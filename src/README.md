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

#### Activate env

```bash
conda activate copyme-cuda
```

---

## Dependencies

Install project dependencies using the provided script:

```bash
./install.sh
```

You have also to install mongodb localy:

[Mongodb install for macos](https://dev.to/saint_vandora/how-to-install-mongodb-locally-on-a-macbook-5h3a)
[Mongodb install for ubuntu 24](https://www.cherryservers.com/blog/install-mongodb-ubuntu-2404)

---

## Environment Configuration

Create a `.env` file in the `src` directory with the following structure:

```bash
APP_NAME=copyme
APP_VERSION=1.0.0
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=zJ*BsPZ9E^98AJLGmbhep4R7a7HP$C
FRONTEND_URL=beta-copy-me.vercel.app
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_ARGS=authSource=admin
MONGO_URI=mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}

UPLOAD_DIR=uploads

TRAEFIK_EMAIL=
```

> **Note:** Ensure all required variables are properly set and not use this exemple variable in production please, I see you.

---

## Running the Project

### Local Testing

Run the project locally for inference to test the model with a powerful CLI:

```bash
python3 local.py [OPTIONS | -i | -o] [ARGS]
```

Run the backend API that run the model in local:

```bash
uvicorn --reload main:app
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
