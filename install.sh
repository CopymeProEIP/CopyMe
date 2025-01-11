#!/usr/bin/env bash

# Install the required packages with requirements.txt

# pip is required to install the packages
if ! [ -x "$(command -v pip)" ]; then
    echo "Error: pip is not installed." >&2
    exit 1
fi

# install pip if not installed
unameOut=$(uname -a)
case "${unameOut}" in
    *Microsoft*)     OS="WSL";; #must be first since Windows subsystem for linux will have Linux in the name too
    *microsoft*)     OS="WSL2";; #WARNING: My v2 uses ubuntu 20.4 at the moment slightly different name may not always work
    Linux*)     OS="Linux";;
    Darwin*)    OS="Mac";;
    CYGWIN*)    OS="Cygwin";;
    MINGW*)     OS="Windows";;
    *Msys)     OS="Windows";;
    *)          OS="UNKNOWN:${unameOut}"
esac

# on linux and macos
if [ $OS == "Linux" ] || [ $OS == "Mac" ]; then
    python3 -m ensurepip --upgrade
elif [ $OS == "Windows" ]; then # on windows
    py -m ensurepip --upgrade
fi

# Install the required packages
pip install -r requirements.txt

# Check if the installation was successful
if [ $? -eq 0 ]; then
    echo "Installation successful"
else
    echo "Installation failed"
fi