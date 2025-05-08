# Chess Opening Analysis System: Design and Implementation

https://openingsuccess.netlify.app

## Overview and Background

This is a system for analyzing chess openings from a large dataset of PGN files sourced from [database.lichess.org](http://database.lichess.org/), which hosts approximately 6.5 billion games played on lichess.org. I have a longstanding interest in data analysis and chess, completing several previous academic projects that merge the two. This is my most advanced data processing approach, implementing middleware and message queues to decouple processing steps and utilizing proper databases. My prior analysis had been limited to approximately 2 million games, but this time I analyzed over 120 million. Additionally, having recently read **Cracking the System Design Interview – An insider's guide**, I sought practical experience with technologies commonly utilized in distributed systems.

## Technologies

To simulate distributed system architecture despite operating solely on a single laptop, I implemented the following technologies:

- **Python 3.9**: For parsers and database interaction
  - **python-chess 1.9.3** for PGN parsing
  - **psycopg2** for PostgreSQL connectivity
  - **kafka** for Kafka integration
- **Bash**: For downloader script implementation with curl
- **Apache Kafka 3.3.1**: As middleware message queuing system to decouple PGN parsing from database operations
- **PostgreSQL 14**: For processed game data storage
- **Docker & Docker Compose**: For containerization of Kafka and PostgreSQL services

## Components

### Downloader

I developed a bash script to download a manageable subset of chess game files from lichess.org. This approach allowed me to process the dataset on a personal laptop while focusing on core processing functionality that could be scaled in future iterations, rather than overengineering an AWS architecture prematurely.

The script utilizes curl's `range` setting, limiting each month's game collection to a predetermined maximum size, enabling data collection spanning all months and years (2013-2025) while maintaining a manageable total volume. One limitation of this approach is that it typically captures only games played during the first two weeks of each month, potentially missing certain micro-trends. However, as the primary focus is on macro-trends across years, I accepted this drawback.

### Middleware: Kafka

I used Apache Kafka to decouple data extraction (`producer.py`) from database writing (`consumer.py`), allowing each component to scale independently since parsing is more intensive than database operations. Another benefit of using middleware is coordination of simultaneous execution of multiple producers and consumers. Since I used Python to do the data extraction, I ran multiple producers and consumers concurrently which allowed me to avoid the Global Interpreter Lock limiting throughput. By horizontally scaling with two producers and one consumer running concurrently, the system achieved a throughput of approximately 2,500 games per second from raw PGN to database insertion, equating to roughly 9 million games per hour (or 215 million games per day). I chose Kafka was over gRPC because of its built-in buffering capabilities, which effectively manage scenarios where producers and consumers operate at different speeds, eliminating the need for a custom buffering mechanisms.

I configured the Kafka topic to have six partitions which allowed me to run up to six producers and consumers at once, optimizing throughput. I considered implementing message batching when writing to the Kafka topic, but there were no significant throughput improvements when I tested it. I used individual message transmission.

### Producer (PGN Parser)

The producer script (producer.py) extracts and transforms raw PGN files into structured data. For example:

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

Is transformed into:

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

The parser's primary functions include:

1. **Filtering extraneous data fields to export only information relevant to opening analysis to the database.**
2. **Converting string representations to appropriate data types for seamless database ingestion without additional transformation**. In PGNs, the `result` field is represented by strings such as `"1-0"`, `"0-1"`, or `"1/2-1/2"`, which are human-readable but require a minimum of 7 bytes to store three options. For optimization, I evaluated three storage options: `enum`, `CHAR(1)`, or `SMALLINT`. I initially selected `SMALLINT` (2 bytes) based on the assumption that numeric comparisons would be more efficient than string comparisons. Upon reevaluation, an enum type would have provided better readability (`white`, `black`, `draw`) compared to numeric values (`0`, `1`, `2`) which would increase maintainability. However, the practical impact of this data type selection is minimal due to table padding between tuples, so I maintained the `SMALLINT` implementation and documented the representation scheme.
3. **Implementing robust error handling and field validation**. Lichess's database occasionally contains blank fields which required appropriate handling. The most frequently blank field is a player's Elo rating, sometimes replaced with a question mark, which would cause type conversion errors if not properly handled. Another common parsing error occurs when the final game in a collection is truncated due to the `curl range` terminating the connection after reaching a specified byte threshold. These scenarios were managed by catching `KeyError` exceptions and gracefully excluding the affected games.

To prevent database corruption during reprocessing, I initially implemented custom UUID generation to preemptively identify duplicate games before writing to the database. Looking back, I was too excited about UUIDs after learning about Twitter Snowflake when I made this decision. Given that duplicate processing would only occur through deliberate rerunning of the producer script on the same dataset, early failure detection was unnecessary and negatively impacted performance. I ultimately delegated UUID management and duplicate handling to PostgreSQL, which simplified this error handling.

### Consumer (Database Writer)

The consumer script (`consumer.py`) processes messages from Kafka and inserts them into PostgreSQL. As previously mentioned, I transitioned from custom UUID generation with SHA hashes to natural composite primary keys (I even had wild dreams of using a bloom filter to check if a record already exists). Utilizing PostgreSQL's `PRIMARY KEY` constraint for automatic duplicate elimination proved more efficient than performing `ON CONFLICT DO NOTHING` checks. Adding a primary key was as simple as:

```sql
ALTER TABLE games ADD PRIMARY KEY (white, black, date_played);
```

This approach parallels flow identification in network analysis, a concept familiar from my professional experience. In networking, a 5-tuple (source IP, destination IP, source port, destination port, and protocol) uniquely identifies a network flow. Similarly, I determined that a chess game can be uniquely identified by three fields: the two players (`white`, `black`) and the timestamp (`date_played` which is accurate to the second).

The composite key provides several advantages:
- Facilitates automatic deduplication of games
- Eliminates the overhead associated with UUID generation
- Removes the need for additional `ON CONFLICT DO NOTHING` logic, improving performance

### Database: PostgreSQL

I chose PostgreSQL for its schema enforcement capabilities, which ensures data consistency and facilitating query error detection. While the relational aspect was valuable for potential future table expansion, a critical requirement of the database was support for **materialized views**. These enable pre-computation of common aggregates for opening analysis, allowing efficient querying of these statistics for data reporting.

The games table schema, where each record represents a single chess game, is structured as follows:

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

Below is an example of one of the materialized views that generates aggregate statistics from the games table. This particular view groups openings by name and ECO code, calculating total games, wins, draws, and win percentages. It includes only openings that have been played more than 1,000 times across the dataset to avoid statistical distortions from rarely played openings:

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

These views represent one-time analyses performed after complete data ingestion. In a real-time streaming scenario, the materialized views could be refreshed using trigger-based or time-based approaches to maintain data currency.

### Containerization: Docker

In alignment with the objective of employing technologies prevalent in distributed systems, I used Docker for containerization. Kafka and PostgreSQL operate in separate containers, simplifying deployment and facilitating potential expansion to a more distributed architecture.