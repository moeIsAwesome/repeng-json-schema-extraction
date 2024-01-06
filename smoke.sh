#!/bin/bash

# Get version from package.json using jq (a command-line JSON processor)
VERSION=$(jq -r '.version' ./package.json)

#Perform a smoke test and check for success
if [ "$VERSION" == "0.0.1" ]; then
    echo "Smoke test successful: Version is 0.0.1"
    exit 0  # Exit with success status
else
    echo "Smoke test failed: Version is not 1.0.0"
    exit 1  # Exit with failure status
fi


