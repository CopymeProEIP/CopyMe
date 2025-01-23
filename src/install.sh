#!/usr/bin/env bash

# Install the required packages with requirements.txt

pip=$(command -v pip) # check if pip is installed
pip3=$(command -v pip3) # check if pip3 is installed

# Check if the requirements.txt file exists
if [ ! -f requirements.txt ]; then
    echo "requirements.txt not found"
    exit 1
fi

# check which is available pip or pip3
if [ ! -z "$pip" ]; then
    echo "Using pip ..."
    pip install -r requirements.txt
elif [ ! -z "$pip3" ]; then
    echo "Using pip3 ..."
    pip3 install -r requirements.txt
else
    echo "pip or pip3 not found"
    
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

    # we install pip on the system
    echo "Installing pip on $OS"

    # on linux and macos
    if [ $OS == "Linux" ] || [ $OS == "Mac" ]; then
        python3 -m ensurepip --upgrade
    elif [ $OS == "Windows" ]; then # on windows
        py -m ensurepip --upgrade
    fi
fi

# Check if the installation was successful
if [ $? -eq 0 ]; then
    echo "Installation successful"
else
    echo "Installation failed"
fi

# ressources:
# https://stackoverflow.com/questions/394230/how-to-detect-the-os-from-a-bash-script