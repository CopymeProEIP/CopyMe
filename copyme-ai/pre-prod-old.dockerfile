FROM python:3.9-slim

# Defined Env variable 
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_ENV=production

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential cmake wget \
    gcc \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 5000

VOLUME ["/etc/ssl/certs", "/etc/ssl/private", "/app/model"]
                                            
# Start server
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--keyfile", "/etc/ssl/private/server.key", "--certfile", "/etc/ssl/certs/server.crt", "app:app"]