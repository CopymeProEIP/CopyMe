# CopyMe Project Documentation

## Table of Contents

1. [Setup](#setup)
   - [Activate Virtual Environment](#activate-virtual-environment)
   - [Using Conda](#using-conda)
2. [Dependencies](#dependencies)
3. [Environment Configuration](#environment-configuration)
4. [Running the Project](#running-the-project)
   - [Local Testing](#local-testing)
   - [Production Deployment](#production-deployment)

---

## Setup

### Activate Virtual Environment

```bash
cd src/
python3.10 -m venv copyme
source copyme/bin/activate
```

### Using Conda

#### Create Environment

```bash
conda env create -f environnement-conda.yml -y -v
```

#### Update Environment

```bash
conda env update --file environnement-conda.yml --prune
```

---

## Dependencies

Install project dependencies using the provided script:

```bash
./install.sh
```

---

## Environment Configuration

Create a `.env` file in the `src` directory with the following structure:

```bash
APP_NAME=
APP_VERSION=
FRONTEND_URL=
MONGO_ROOT_USERNAME=
MONGO_ROOT_PASSWORD=
MONGO_PORT=
MONGO_HOST=
MONGO_ARGS=
MONGO_URI=
UPLOAD_DIR=
```

> **Note:** Ensure all required variables are properly set.

---

## Running the Project

### Local Testing

Run the project locally for inference:

```bash
python3 local.py [OPTIONS | -i | -o] [ARGS]
```

> A feedback directory will be created during execution.

### Production Deployment

Run the back-end using Docker in production:

```bash
docker run -d -p 5000:5000 \
  -v /home/ubuntu/copyme/models:/app/model/:ro \
  -v /home/ubuntu/copyme/certs/server.crt:/etc/ssl/certs/server.crt:ro \
  -v /home/ubuntu/copyme/certs/server.key:/etc/ssl/private/server.key:ro \
  --name my_app ghcr.io/mpjunot/copyme/copyme-backend-api:latest
```
