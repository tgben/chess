import logging, time, argparse
import chess.pgn
import json
from datetime import datetime
from kafka import KafkaProducer
from kafka.errors import KafkaError

DATETIME_FORMAT_CODE = "%Y.%m.%d %H:%M:%S"
DEFAULT_DATE = "1970.01.01 00:00:00"
BOOTSTRAP_SERVERS = ['localhost:9092']
WHITE_WIN, BLACK_WIN, DRAW = 2, 1, 0

parser = argparse.ArgumentParser()
parser.add_argument('kafka_topic')
parser.add_argument('pgn_file')
parser.add_argument(
    "--log",
    default="INFO",
    choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
    help="Set the logging level"
)
args        = parser.parse_args()
kafka_topic = args.kafka_topic
pgn_file    = args.pgn_file
log_level   = args.log

logging.basicConfig()
logging.getLogger().setLevel(level=log_level)
logging.getLogger('kafka').setLevel(logging.ERROR)
try:
    pgn = open(pgn_file)
except Exception as e:
    logging.error(f'Failed to open file {pgn_file} -> {e}')
    exit(1)

producer = KafkaProducer(
    bootstrap_servers=BOOTSTRAP_SERVERS,
    value_serializer=lambda m: json.dumps(m).encode('utf-8'),
    retries=5,
    # batch_size=131072,
    # linger_ms=500,
    # buffer_memory=67108864,
    # max_request_size=5242880,
    # acks='1',
    # max_in_flight_requests_per_connection=10,
)

def on_send_success(record_metadata):
    logging.debug(
        f'Kafka produced: ('
        f'topic: {record_metadata.topic}, '
        f'partition: {record_metadata.partition} '
        f'offset: {record_metadata.offset})'
    )

def on_send_error(excp, i, game):
    logging.error(
        f'Kafka failed to produce record ('
        f'exception: {excp}, i: {i}, game: {str(game)})'
    )

logging.info(f'Starting processing games from {args.pgn_file}')

i = 0
start_time = time.perf_counter()
result_translation = {'1-0': 2, '0-1': 1, '1/2-1/2': 0, '*': 0}
while pgn_game := chess.pgn.read_game(pgn):
    # Pull out key features
    try:
        opening      = pgn_game.headers["Opening"]
        eco          = pgn_game.headers["ECO"]
        white        = pgn_game.headers["White"]
        black        = pgn_game.headers["Black"]
        white_elo    = pgn_game.headers["WhiteElo"]
        black_elo    = pgn_game.headers["BlackElo"]
        time_control = pgn_game.headers["TimeControl"]
        result       = result_translation.get(pgn_game.headers["Result"])
        date_played  = (
            pgn_game.headers["UTCDate"] + " " +
            pgn_game.headers["UTCTime"]
        )
    except KeyError:
        continue
    # Validate
    try:
        date_played = datetime.strptime(
            date_played,
            DATETIME_FORMAT_CODE
        )
    except ValueError:
        logging.debug(f'Bad date: {date_played}')
        date_played = datetime.strptime(
            DEFAULT_DATE,
            DATETIME_FORMAT_CODE
        )
    if (not white_elo.isdigit() or
        not black_elo.isdigit()
    ):
        logging.info(
            f'Dropping record: white_elo: {white_elo}, '
            f'black_elo: {black_elo}, '
            f'date_played: {date_played}'
        )
        continue

    # Build game dict
    game = {
        'opening'       : opening,
        'eco'           : eco,
        'white'         : white,
        'black'         : black,
        'white_elo'     : white_elo,
        'black_elo'     : black_elo,
        'result'        : result,
        'time_control'  : time_control,
        'date_played'   : datetime.strftime(
            date_played,
            DATETIME_FORMAT_CODE
        )
    }

    # Produce to kafka topic
    future = (
        producer.send(kafka_topic, game)
        # .add_callback(on_send_success)
        .add_errback(on_send_error, i, game)
    )
    try:
        record_metadata = future.get(timeout=10)
    except KafkaError:
        logging.error(f'Producer request failed.')

    # Logging
    i += 1
    if i % 1000 == 0:
        # logging.info(f'-> Processed {i} games in {(time.perf_counter() - start_time):.2f} seconds.')
        logging.info(f'-> Processed {i} games.')
    logging.debug(
            f'->\n'
            f'\topening:\t{opening} ({eco})\n'
            f'\twhite:\t\t{white} ({white_elo})\n'
            f'\tblack:\t\t{black} ({black_elo})\n'
            f'\ttime_control:\t{time_control}\n'
            f'\tdate_played:\t{date_played}\n'
            f'<-'
    )
producer.flush()
pgn.close()