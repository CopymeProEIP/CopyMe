# How to run this project

## Activate venv

``` bash
cd src/
python3.10 -m venv copyme
source copyme/bin/activate
```

## If you want to use conda with config
``` bash
conda env create -f environnement-conda.yml -y -v
```

## Update the conda environment
``` bash
conda env update --file environnement-conda.yml --prune
```

## Install Dependences

``` bash
./install.sh
```

## Run script

```
python3 local.py [OPTIONS | -i | -o] [ARGS]
```
> To run local inference / a feeback directory will be created

## Run back-end docker in production
``` bash
docker run -d -p 5000:5000 \
  -v /home/ubuntu/copyme/models:/app/model/:ro \
  -v /home/ubuntu/copyme/certs/server.crt:/etc/ssl/certs/server.crt:ro \
  -v /home/ubuntu/copyme/certs/server.key:/etc/ssl/private/server.key:ro \
  --name my_app ghcr.io/mpjunot/copyme/copyme-backend-api:latest
```
