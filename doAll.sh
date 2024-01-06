#!/bin/bash
sudo ./smoke.sh
sudo node ./scripts/generate
sudo make clean

# Check the exit status of the first command
if [ $? -eq 0 ]; then
    # If the first command succeeded, run the second command
    sudo make report
else
    # If the first command failed, display an error message
    echo "Error: the experiment has not been completed successfully."
fi
