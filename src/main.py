from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from config.setting import get_variables
from api import router as APIRouter
import time
import os
import uvicorn

setings = get_variables()

# CORS settings allow the frontend to access the API and nothing else
origins = [
    setings.FRONTEND_URL,
    "http://localhost",
    "https://localhost",
]

def create_application() -> FastAPI:
    app = FastAPI(title=setings.APP_NAME, version=setings.APP_VERSION)
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

app = create_application()
    ## uvicorn.run(app, host="0.0.0.0", port=8000)