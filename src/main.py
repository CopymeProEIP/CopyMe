from fastapi import FastAPI, APIRouter, File, UploadFile, Form, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from config.setting import get_variables
from api import router as APIRouter
import time
import os
import uvicorn
import sys
from config.exception_class import  SettingsException
from config.db_models import DatabaseManager
from pymongo import MongoClient, errors
# import for fast api lifespan
from contextlib import asynccontextmanager
import logging
from logging_setup import setup_logging
from motor.motor_asyncio import AsyncIOMotorClient
from bson.binary import Binary, UuidRepresentation

# Class Yolov8 model
from yolov8_basketball.yolov8 import YOLOv8

try:
    settings = get_variables()
except SettingsException as e:
    logging.critical(e)
    sys.exit(e.errors)

# CORS settings allow the frontend to access the API and nothing else
origins = [
    settings.FRONTEND_URL,
    "http://localhost",
    "https://localhost",
]

# define a lifespan method for fastapi
@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup_db_client(app)
    yield
    await shutdown_db_client(app)

async def startup_db_client(app):
    try:
        """UPLOAD_FOLDER = './uploads'
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER"""

        app.mongodb_client = AsyncIOMotorClient(settings.MONGO_URI, uuidRepresentation='standard')
        app.db = DatabaseManager(app.mongodb_client["CopyMe"])
        logging.info("Logged successful to the mongodb database")

        app.yolo = YOLOv8(capture_index=None, save_path="feedback", mode="debug")
        app.yolo.load_model("model/copyme.pt")
        app.yolo.load_keypoint_model()
        logging.info("Load our yolo model")
    except Exception as e:
        logging.critical(e)
        sys.exit(84)
    logging.info("MongoDB connected.")

async def shutdown_db_client(app):
    app.mongodb_client.close()
    logging.info("Database disconnected.")

def create_application() -> FastAPI:
    app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, lifespan=lifespan)
    app.include_router(APIRouter)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # to check response time execution
    @app.middleware("http")
    async def add_process_time_header(request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response

    return app

# Set up logging
setup_logging()

# Get the logger
logger = logging.getLogger(__name__)

app = create_application()
    ## uvicorn.run(app, host="0.0.0.0", port=8000)
