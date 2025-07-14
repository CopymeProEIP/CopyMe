# Alternative: Utiliser l'image Python officielle avec CUDA
FROM python:3.9-slim

# Install CUDA runtime and system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg2 \
    && wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb \
    && dpkg -i cuda-keyring_1.0-1_all.deb \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
    cuda-runtime-12-4 \
    libcudnn8 \
    build-essential \
    curl \
    git \
    libssl-dev \
    zlib1g-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    libncursesw5-dev \
    xz-utils \
    libffi-dev \
    liblzma-dev \
    ca-certificates \
    make \
    && apt-get clean && rm -rf /var/lib/apt/lists/* \
    && rm cuda-keyring_1.0-1_all.deb

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Configuration du dossier de travail
WORKDIR /app

# Copie des dépendances
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 3001

VOLUME ["/app/model"]

# Start in dev mode with a uvicorn server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3001", "--reload"] 