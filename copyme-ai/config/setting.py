from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os
from . import exception_class

# This function will check if the .env file exists and return the name of the file
def get_environment():
    env_file = load_dotenv()
    return ".env" if env_file else os.getenv("ENV")

class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str
    FRONTEND_URL: str
    MONGO_ROOT_USERNAME: str
    MONGO_ROOT_PASSWORD: str
    MONGO_PORT: str
    MONGO_HOST: str
    MONGO_ARGS: str
    MONGO_URI: str
    UPLOAD_DIR: str
    MISTRAL_API_KEY: str

    class Config:
        env_file = get_environment()
        extra = 'ignore'  # Ignore extra fields instead of raising an error

def get_variables():
    try:
        settings = Settings()
        return settings
    except Exception as e:
        raise exception_class.SettingsException(f"Errors: ENV variable not found! Details: {str(e)}")
    return settings
