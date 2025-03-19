import logging
from logging.handlers import RotatingFileHandler
import sys
import colorlog

def setup_logging():
    # Create a logger
    logger = logging.getLogger()

    # Set the log level (can be changed to DEBUG, INFO, etc.)
    logger.setLevel(logging.DEBUG)

    # Disable logs to WARNINGS
    logging.getLogger("pymongo").setLevel(logging.INFO)
    #logging.getLogger("motor").setLevel(logging.WARNING)

    # Create handlers
    console_handler  = colorlog.StreamHandler(stream=sys.stdout)
    file_handler = RotatingFileHandler('app.log', maxBytes=5*1024*1024, backupCount=3)  # Rotate logs after 5 MB

    # Create formatters and add them to the handlers
    formatter_file = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s', '%Y-%m-%d %H:%M:%S')
    fmt = colorlog.ColoredFormatter(
        "%(name)s: %(white)s%(asctime)s%(reset)s | %(log_color)s%(levelname)s%(reset)s | %(blue)s%(filename)s:%(lineno)s%(reset)s | %(process)d >>> %(log_color)s%(message)s%(reset)s",
        '%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(fmt)
    file_handler.setFormatter(formatter_file)

    # Add the handlers to the logger
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    # Return the logger for use elsewhere
    return logger
