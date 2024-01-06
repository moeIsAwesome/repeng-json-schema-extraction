# JSON Schema Discovery Dockerized Application

This repository contains a Dockerized version of the [JSON Schema Discovery](https://github.com/feekosta/JSONSchemaDiscovery) application along with additional functionalities such as automated smoke testing, report generation, and data preparation. This README provides detailed instructions on how to use and interact with the provided Docker container.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Running the tool](#running-the-tool)
4. [Runnning the experiment](#running-the-experiment)
5. [Report Generation](#report-generation)
6. [Smoke Testing](#smoke-testing)
7. [Dataset Copyright](#dataset-copyright)
8. [Additional Information](#additional-information)

---

## Prerequisites

Before using this Dockerized application, ensure you have the following installed on your system:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

Clone this repository to your local machine:

```
git clone https://github.com/moeIsAwesome/repeng-json-schema-extraction
```

## Running the tool

To run the application, as in the prerequisites mentioned, make sure you have Docker and Docker Compose installed on your system.

1. Navigate to the root directory of the cloned repository.

2. Build and run the Docker containers using the provided `docker-compose.yml` file:

```
docker-compose up -d mongo && sleep 5 && docker-compose up app
```
NOTE: You might need to use 'docker compose' instead of 'docker-compose' in some systems.

This will launch the application along with a MongoDB instance. Please note that the initial execution may take some time as it sets up the environment. Once the process is complete, you should see the "**API running on localhost:3000**" message, and at that point, you're ready to start using the tool.

## Running the experiment

Open a new terminal and access the running `jsonschemaextraction` container following the below command:

```
docker exec -it jsonschemaextraction /bin/bash
```

Now, you are inside the container. Run the `./doAll.sh` command; **the password is "1234"**.

Wait until the process is finished.

## Report Generation

After successfully running the experiment, a PDF report will be generated and stored in `/home/report/final_report`.
You can either go inside the container to view the report or simply copy it to your local machine. To copy the report to your local machine, open a new terminal and then run the below command:

```
docker cp jsonschemaextraction:/home/report/final_report .
```

You can also manually recreate the report again. To generate the report, run the report generation command inside the container:

```
make report
```

This command will generate a PDF report again, and store it in the `/home/report/final_report` directory.

To clean up generated files and reports, use the following command:

```
make clean
```

## Smoke Testing

The application includes an automated smoke test to ensure its proper functioning. The smoke test is performed both during the Docker build process and when running the `./doAll.sh` command. However, if you want to manually run the smoke test, run the below command:

```
./smoke.sh
```

The smoke test will check if the application version is set to "0.0.1" and exit with a success or failure message.

## Dataset Copyright

The data in imdb_movies.json is downloaded and processed from http://www.imdb.com. Please refer to the copyright/license information at http://www.imdb.com/Copyright and http://www.imdb.com/interfaces.
According to http://www.imdb.com/interfaces:
"The data is NOT FREE although it may be used for free in specific circumstances.".

The data in drugbank_drugs.json is downloaded and processed from DrugBank http://drugbank.ca/.

The other data files are downloaded and processed from DBpedia http://dbpedia.org and Freebase http://freebase.org.

Pleease refer to the source websites for copyright information and terms of use.

All the data files are made available only for research purposes. We hold no responsibility for the accuracy, completeness and content of the files. Please contact us immediately if you believe these files contain copyrighted material that may not be distributed in this form.

If you use the data in a reasearch project, please user URL http://purl.org/linkdiscovery/data/ or cite the related publication. A list of publications is available at http://purl.org/linkdiscovery/

## Additional Information

A dataset is provided by this GitHub repository:
https://github.com/feekosta/datasets?tab=License-1-ov-file
is downloaded during the build for running the experiment.
You can access the dataset inside the running container at `home/app/datasets`

For any inquiries, feedback, or contributions, please contact Mohammad Mousavi at mousav03@ads.uni-passau.de.
