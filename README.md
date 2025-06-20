# Chess Opening Analysis System: Design and Implementation

https://openingsuccess.netlify.app

## Overview and Background

This system analyzes chess openings using a large dataset of PGN files from [database.lichess.org](http://database.lichess.org/), which hosts around 6.5 billion games played on lichess.org. I have long been interested in data analysis and chess, completing several academic projects that combine both. This is my most advanced effort, featuring middleware, message queues to decouple processing steps, and proper database integration. Previous analyses were limited to about 2 million games; this project handled over 120 million. Inspired by Cracking the System Design Interview – An Insider's Guide, I aimed to gain practical experience with technologies common in distributed systems.

## Technologies

Although I operated on a single laptop, I designed the system to simulate distributed architecture using:

- **Python 3.9**: For parsers and database interaction
  - **python-chess 1.9.3** For PGN parsing
  - **psycopg2** For PostgreSQL connectivity
  - **kafka** For Kafka integration
- **Bash**: For downloader scripts (using `curl`)
- **Apache Kafka 3.3.1**: As middleware for decoupling parsing and database operations
- **PostgreSQL 14**: For storing processed game data
- **Docker & Docker Compose**: For containerizating Kafka and PostgreSQL

## Components

### Downloader

I developed a bash script to download a manageable subset of chess game files from lichess.org. This approach allowed me to process the dataset on a personal laptop while focusing on core processing functionality that could be scaled in future iterations, rather than overengineering a cloud architecture prematurely.


The script utilizes `curl`'s `range` setting to limit each month’s data to a maximum size, enabling coverage across all months and years (2013–2025). This method typically captures games from the first two weeks of each month, possibly missing short-term trends. Since the focus is on macro trends over years, I accepted this tradeoff.

### Middleware: Kafka

I used Apache Kafka to decouple data extraction (`producer.py`) from database writing (`consumer.py`), enabling independent scaling of these components. Parsing is more resource-intensive than writing, so I ran multiple producers and consumers concurrently. This design avoided Python's Global Interpreter Lock bottleneck and achieved a throughput of ~2,500 games per second or about 9 million games per hour (215 million games per day).


I chose Kafka over gRPC for its built-in buffering, which handles producer-consumer speed mismatches without writing custom buffering logic. The Kafka topic has six partitions, supporting up to six producers and consumers for optimal throughput. I tested message batching but found no significant performance gains, so I stuck with individual messages.

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

Key Functions:

1. **Filter extraneous fields**, exporting only information relevant to opening analysis to the database. This ensures the stored data is streamlined for efficient querying and analysis.
2. **Converting string fields to appropriate types** for direct database ingestion without requiring additional transformation. For example, the result field in PGNs is represented by strings like "1-0", "0-1", or "1/2-1/2", which are human-readable but require at least 7 bytes to store three options. I evaluated three options for storage: enum, CHAR(1), or SMALLINT. I initially chose SMALLINT (2 bytes), assuming numeric comparisons would be faster than string comparisons. Upon reevaluation, an enum type would have offered better readability (e.g., white, black, draw) compared to numeric values (0, 1, 2), improving maintainability. However, the practical impact of this decision is negligible due to PostgreSQL’s table padding between tuples, so I retained the SMALLINT implementation and clearly documented the mapping scheme.
3. **Robust error handling and validation**. Lichess’s database occasionally contains blank fields that require special handling. The most common issue is a missing player Elo rating, often represented as a question mark, which would cause type conversion errors (str -> int) if not addressed. Another frequent parsing error occurs when the final game in a file is abruptly truncated because the curl range ends the download at a set byte limit. These cases were handled by catching KeyError exceptions and gracefully excluding the problematic games.


To prevent database corruption during reprocessing, I initially implemented custom UUID generation to preemptively identify duplicate games before writing to the database. Looking back, I was too excited about UUIDs after learning about Twitter Snowflake when I made this decision. Given that duplicate processing would only occur through deliberate rerunning of the producer script on the same dataset, early failure detection was unnecessary and negatively impacted performance. I ultimately delegated UUID management and duplicate handling to PostgreSQL, simplifying the system and increasing write performance.

### Consumer (Database Writer)

The consumer script (`consumer.py`) reads Kafka messages and writes them to PostgreSQL. I transitioned from hash-based custom UUIDs to natural composite primary keys (Even having dreams of using a bloom filter to check if a record already exists). Utilizing PostgreSQL's `PRIMARY KEY` constraint for automatic duplicate elimination proved more efficient than performing `ON CONFLICT DO NOTHING` checks. Adding a primary key was as simple as:

```sql
ALTER TABLE games ADD PRIMARY KEY (white, black, date_played);
```

This approach parallels flow identification in network analysis, a concept I’m familiar with from my professional experience. In networking, a 5-tuple consists of a source IP, destination IP, source port, destination port, and protocol and uniquely identifies a network flow. Similarly, I determined that a chess game can be uniquely identified by three fields: the two players (`white`, `black`) and the timestamp (`date_played`), which is accurate to the second. This composite key provides a natural and efficient way to prevent duplicate records without introducing unnecessary complexity.

The composite key provides several advantages:
- Automatic deduplication of games
- No UUID generation overhead
- No need for `ON CONFLICT DO NOTHING` logic

### Database: PostgreSQL

I chose PostgreSQL for its schema enforcement capabilities, ensuring data consistency and facilitating query error detection during development, testing, and deployment. While the relational aspect was valuable for potential future table expansion, a critical requirement of the database was support for **materialized views**, enabling pre-computation of common aggregates used in opening analysis, allowing efficient querying.

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

Below is an example of one of the materialized views that generates aggregate statistics from the games table. This particular view groups openings by name and ECO code, computing total games, wins, draws, and win percentages. It includes only openings that have been played more than 1,000 times across the dataset to avoid statistical distortions from infrequent openings:

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

In alignment with my objective of employing technologies common in distributed systems, I used Docker for containerization. Kafka and PostgreSQL run in separate containers, simplifying deployment and making it easier to scale the system into a more distributed architecture in the future.
