#!/bin/bash

# Install the required packages with requirements.txt

# pip is required to install the packages

# Install the required packages
pip install -r requirements.txt

# Check if the installation was successful
if [ $? -eq 0 ]; then
    echo "Installation successful"
else
    echo "Installation failed"
fi
