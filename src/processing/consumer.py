import logging, argparse, os
from kafka import KafkaConsumer
import json
import psycopg2

BOOTSTRAP_SERVERS = ['localhost:9092']

parser = argparse.ArgumentParser()
parser.add_argument('kafka_topic')
parser.add_argument('db')
parser.add_argument(
    "--log",
    default="INFO",
    choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
    help="Set the logging level"
)
args        = parser.parse_args()
kafka_topic = args.kafka_topic
database    = args.db
log_level   = args.log

logging.basicConfig()
logging.getLogger().setLevel(level=log_level)
logging.getLogger('kafka').setLevel(logging.ERROR)

consumer = KafkaConsumer(
    kafka_topic,
    bootstrap_servers=BOOTSTRAP_SERVERS,
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)
conn = psycopg2.connect(
    database = database,
    user     = os.environ.get("DB_USER", "postgres"),
    password = os.environ.get("DB_PASSWORD", ""),
    host     = os.environ.get("DB_HOST", "localhost"),
    port     = os.environ.get("DB_PORT", "5432")
)
cur = conn.cursor()

for message in consumer:
    game = message.value
    try:
        cur.execute("""
            INSERT INTO %s (opening, eco, white, black, white_elo, black_elo, result, time_control, date_played)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                kafka_topic,
                game['opening'],
                game['eco'],
                game['white'],
                game['black'],
                game['white_elo'],
                game['black_elo'],
                game['result'],
                game['time_control'],
                game['date_played'],
            )
        )
    except psycopg2.errors.UniqueViolation:
        logging.warning(
            f'Postgres rejected duplicate record:\n'
            f'\twhite: {game["white"]}, black: {game["black"]}\n'
            f'\tresult: {game["result"]}, time_control: {game["time_control"]}, date_played: {game["date_played"]}'
        )
        conn.rollback()

    logging.debug(
        f'Kafka consumed: ('
        f'topic: {message.topic}, '
        f'partition: {message.partition} '
        f'offset: {message.offset} '
        f'value: {message.value["white"]} vs {message.value["black"]})'
    )
    conn.commit()
cur.close()
conn.close()