# Copyright 2024, Mohammad Mousavi <mousav03@ads.uni-passau.de>

# Start off of a long-term maintained base distribution
FROM ubuntu:20.04

# Set the maintainer
LABEL maintainer="Mohammad Mousavi - mousav03@ads.uni-passau.de"

# Since some packages ask questions while installing, this will prevent the installer from prompting for user input and uses default values instead.
ENV DEBIAN_FRONTEND=noninteractive

# Update the repository sources list and then install dependencies
RUN apt-get update && \
    apt-get install -y \
    bzip2 \ 
    curl \
    gcc \
    g++ \
    git \
    jq \
    make \
    python3 \
    python3-pip \
    sudo \
    tar \
    texlive \
    texlive-bibtex-extra \
    texlive-fonts-extra \
    texlive-fonts-recommended \
    texlive-latex-extra \
    texlive-plain-generic \
    texlive-publishers \
    texlive-xetex \
    wget \
    # Install Node.js 18.x
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    # Delete the downloaded packages since these downloaded package files are no longer needed once the installation is complete.
    && apt-get clean \
    # Removes the package lists from the package manager cache. 
    && rm -rf /var/lib/apt/lists/*

# create a new user called moe, and run the application as this user for security reasons
RUN useradd -m -G sudo -s /bin/bash moe && echo "moe:1234" | chpasswd
RUN usermod -a -G staff moe
USER moe

# Set the working directory
WORKDIR /home/app

# Clone the GitHub repository
RUN git clone https://github.com/feekosta/JSONSchemaDiscovery.git
 # The JSONSchemaDiscovery project is cloned from https://github.com/feekosta/JSONSchemaDiscovery, and it is licensed under the Apache License 2.0. For details, refer to the LICENSE file in the mentioned repository.

# Change the working directory to the cloned repository
WORKDIR /home/app/JSONSchemaDiscovery

# Check out a specific commit to make sure the application works as expected even if the repository is updated in the future
RUN git checkout fb625964a1511161d0b9c2d7344d27273d4c36d7


COPY init.patch smoke.sh Makefile doAll.sh ./
# Copy the necessary files to the container
COPY scripts/ ./scripts/

USER root
# Make the smoke.sh file executable
RUN chmod +x ./smoke.sh
RUN chmod +x ./doAll.sh


# Automatically confirms that the smoke test is successful, if it fails, the container will not be built
RUN ./smoke.sh



# # Install Node.js dependencies from package.json in the cloned repository
RUN npm install
RUN npm install -g jsonrepair

USER moe


# # Apply the patch file
RUN git apply init.patch



USER root

# Create a directory for storing the datasets, and then download the datasets and extract them
RUN mkdir datasets && \
    cd datasets && \
    wget https://github.com/feekosta/datasets/raw/master/companies/dbpedia_companies1.json.tar.bz2 && \
    wget https://github.com/feekosta/datasets/raw/master/drugs/dbpedia-drugs1.json.tar.bz2 && \
    wget https://github.com/feekosta/datasets/raw/master/movies/dbpedia_movies1.json.tar.bz2 && \
    tar -xvf dbpedia_companies1.json.tar.bz2 && \
    tar -xvf dbpedia-drugs1.json.tar.bz2  && \
    tar -xvf dbpedia_movies1.json.tar.bz2 && \
    rm *.tar.bz2

# Clean up and rename the datasets for better readability
RUN cd datasets && \
    jsonrepair dbpedia-drugs1.json > drugs.json && \
    jsonrepair dbpedia_companies1.json > companies.json && \
    jsonrepair dbpedia_movies1.json > movies.json

# Create a directory for storing the report template, and clone the report template repository into the container
RUN mkdir -p /home/report/report_template && \
    cd /home/report/report_template && \
    git clone https://github.com/moeIsAwesome/repeng-json-schema-extraction-report

# Create a directory to store the final report and give the permission to the moe user to write in the final_report directory
RUN mkdir /home/report/final_report && \
    chown moe:moe /home/report/final_report

#run the make report command to generate the final report
# RUN make report 


# # Set the default command to run the smoke file, and run the application after the container is built
CMD ["sh", "-c", "node scripts/importDataset && npm start"]
# # Expose the required port
EXPOSE 4200

# Change the user back to moe
USER moe
