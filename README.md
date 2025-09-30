# Chess Opening Analysis System: Design and Implementation

https://openingsuccess.netlify.app

## Overview and Background

This system analyzes chess openings using a large dataset of PGN files from [database.lichess.org](http://database.lichess.org/), which hosts around 6.5 billion games played on lichess.org. I've been interested in the intersection of chess and data analysis since college and have successfully found a way to combine the two in multiple class projects. This time, I wanted to learn some distributed system tools like Kafka and proper database integration; historically I just threw my data into a CSV and called it a day. My previous projects usually processed and analysed about 2 million games,but this time it handled over 120 million.

## Technologies

Although I operated on a single laptop, I designed the system to simulate distributed architecture using:

- **Python 3.9**: For parsers and database interaction
  - **python-chess 1.9.3** For PGN parsing
  - **psycopg2** For PostgreSQL connectivity
  - **kafka** For Kafka integration
- **Bash**: For downloader scripts
- **Apache Kafka 3.3.1**: For decoupling parsing and database operations
- **PostgreSQL 14**: For storing processed game data
- **Docker & Docker Compose**: For containerizating Kafka and PostgreSQL

## Components

### Downloader

I wrote a short bash script to download a "manageable" subset of chess game files from lichess.org. This let me to run a more limited dataset on a personal laptop while focusing on core processing functionality that could be scaled in future iterations. I briefly considered deploying the initial parsing step in the cloud, but I preferred to keep my rainy day fund.


The script utilizes `curl`'s `range` setting to limit each month’s data to a maximum size, enabling data coverage across all months and years (2013–2025). This downloaded games from the first two-ish weeks of each month, admittedly possibly missing short-term trends. Since the focus is on macro trends over years, I accepted this tradeoff.

### Middleware: Kafka

I used Apache Kafka to decouple data extraction (`producer.py`) from database writing (`consumer.py`), which let me scale these components independently. Parsing showed to be more resource-intensive than writing, so I ran multiple producers and consumers concurrently. This multi-producer design also avoided Python's Global Interpreter Lock bottleneck and achieved a throughput of ~2,500 games per second or about 9 million games per hour (215 million games per day).


I chose Kafka over gRPC for its built-in buffering, which handled producer-consumer speed mismatches without writing custom buffering logic. The Kafka topic had six partitions, supporting up to six producers and consumers. I tested having the producer batch messages to improve speed, but found no significant performance gains, so I stuck with individual messages.

### Producer (PGN Parser)

The producer (producer.py) extracts and transforms raw PGN files into structured data. For example:

This game..

```
[Event "Rated Classical game"]
[Site "https://lichess.org/ajwweupe"]
[White "fanf"]
[Black "cixon123"]
[Result "0-1"]
[UTCDate "2013.07.31"]
[UTCTime "22:02:19"]
[WhiteElo "1300"]
[BlackElo "1397"]
[WhiteRatingDiff "-91"]
[BlackRatingDiff "+7"]
[ECO "B00"]
[Opening "Owen Defense"]
[TimeControl "660+11"]
[Termination "Normal"]
1. e4 b6 2. d4 Bb7 3. Nc3 e6 4. Nf3 d5 5. Bg5 Ne7 6. e5 h6 7. Bxe7 Bxe7 8. Bb5+ Nd7 9. Nh4 c6 10. Be2 Bxh4...
```

...Is transformed into...

```json
{
  "opening": "Owen Defense",
  "eco": "B00",
  "white": "fanf",
  "black": "cixon123",
  "white_elo": 1300,
  "black_elo": 1397,
  "result": 1,
  "time_control": "660+11",
  "date_played": "2013-07-31 22:02:19"
}
```

Steps:

1. **Filter extraneous fields** and export only information relevant to opening analysis to the database.
2. **Converting string fields to appropriate types** for direct database ingestion without additional transformation. For example, the result field in PGNs is represented by strings like "1-0", "0-1", or "1/2-1/2", which are human-readable but require at least 7 bytes to store three options. I evaluated three options for storage: enum, CHAR(1), or SMALLINT. I initially chose SMALLINT (2 bytes), assuming numeric comparisons would be faster than string comparisons. Upon reevaluation, an enum type, which uses INT instead of SMALLINT would have offered better readability (e.g., white, black, draw) compared to SMALLINT values (0, 1, 2), improving maintainability. However, the practical impact of this decision is negligible due to PostgreSQL’s table padding between tuples. I retained the SMALLINT implementation and clearly documented the mapping scheme, no harm done.
3. **Error handling and validation** was key because Lichess’s database occasionally contains blank fields. The most common missing value was a player's Elo rating, often replaced wyth a question mark. Another parsing error would occur when the final game in a file is abruptly truncated because the curl range ends the download at a set byte limit. These cases were handled by catching KeyError exceptions and gracefully excluding the last game in the file.


### Consumer (Database Writer)

The consumer script (`consumer.py`) reads Kafka messages and writes them to PostgreSQL.

To prevent database corruption during reprocessing by adding games that already exist in the database, I initially implemented custom UUID generation to preemptively identify duplicate games before writing to the database. Looking back, I was too excited about UUIDs after learning about Twitter Snowflake when I made this decision. Given that duplicate processing would only occur through deliberate rerunning of the producer script on the same dataset, early failure detection was unnecessary and negatively impacted performance. I ultimately delegated UUID management and duplicate handling to PostgreSQL, simplifying the system and increasing write performance. I transitioned from hash-based custom UUIDs to natural composite primary keys (Even having dreams of using a bloom filter to check if a record already exists). Utilizing PostgreSQL's `PRIMARY KEY` constraint for automatic duplicate elimination proved more efficient than performing `ON CONFLICT DO NOTHING` checks. Adding a primary key was as simple as:

```sql
ALTER TABLE games ADD PRIMARY KEY (white, black, date_played);
```

This approach parallels flow identification in network analysis. In networking, a 5-tuple that consists of a source IP, destination IP, source port, destination port, and protocol and uniquely identifies a network flow at a given time. Similarly, I determined that a chess game can be uniquely identified by three fields: the two players (`white`, `black`) and the timestamp (`date_played`), which is taken at the start of the game and accurate to the second. This composite key provides a natural and efficient way to prevent duplicate records without introducing unnecessary complexity.

The composite key provides several advantages:
- Automatic deduplication of games
- No UUID generation overhead
- No need for `ON CONFLICT DO NOTHING` logic

### Database: PostgreSQL

I chose PostgreSQL for its SQL schema enforcement capabilities, ensuring data consistency and easier debugging. While the relational aspect was valuable for potential future table expansion, the database needed to support **materialized views** which enable pre-computation of common aggregates used in opening analysis, allowing efficient querying. This way we can just query on these pre-computed materialized views instead of directly on the data.

The `games` table schema, where each record represents a single chess game, is structured as follows:

```sql
CREATE TABLE games (
	opening VARCHAR(128),
	eco VARCHAR(4),
	white VARCHAR(32),
	black VARCHAR(32),
	white_elo SMALLINT,
	black_elo SMALLINT,
	result SMALLINT,
	time_control VARCHAR(12),
	date_played TIMESTAMP
);
```

Below is an example of one of the materialized views that generates aggregate statistics from the games table. This particular view groups openings by name and ECO code, computing total games, wins, draws, and win percentages. It includes only openings that have been played more than 1,000 times across the dataset to avoid outliers from infrequent openings:

```sql
CREATE MATERIALIZED VIEW opening_statistics AS
SELECT
    opening,
    eco,
    COUNT(*) AS total_games,
    SUM(CASE WHEN result = 2 THEN 1 ELSE 0 END) AS white_wins,
    SUM(CASE WHEN result = 1 THEN 1 ELSE 0 END) AS black_wins,
    SUM(CASE WHEN result = 0 THEN 1 ELSE 0 END) AS draws,
    ROUND((SUM(CASE WHEN result = 2 THEN 1 ELSE 0 END) + 
          SUM(CASE WHEN result = 1 THEN 1 ELSE 0 END))::numeric / 
          NULLIF(COUNT(*),0)::numeric * 100, 2) AS total_win_percentage
FROM games
GROUP BY opening, eco
HAVING COUNT(*) > 1000
ORDER BY total_games DESC;
```

These views represent analyses performed once after data ingestion is complete. In a real-time streaming scenario, the materialized views could be refreshed on a schedule or triggered automatically to keep the statistics current.

### Containerization: Docker

I used Docker for containerization where Kafka and PostgreSQL run in separate containers. This simplified deployment and made it easier to scale the system into a more distributed architecture in the future.
