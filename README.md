# 311 Complaint Patterns and Response Times

An interactive map-based dashboard for NYC 311 complaint data, highlighting trends, resolution times, and service hotspots. It enables users to explore patterns and identify areas requiring attention.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/)
- [NYC Open Data API Token](https://data.cityofnewyork.us)
- [CONTRIBUTING.md](CONTRIBUTING.md) for branching strategy, commit conventions, code style, and testing guidelines

## Quick Start

1. Clone the repository

```bash
git clone git@gitlab.socs.uoguelph.ca:cis3760w26/forest/311-complaint-patterns-and-response-times.git
cd 311-complaint-patterns-and-response-times
```

2. Create your environment file

```bash
cp .env.example .env
```

3. Create API token: [NYC Open DataAPI Token](https://data.cityofnewyork.us)

4. Update `.env` to include the API token and database credentials.

Example:

```bash
NYC_APP_TOKEN=see_prerequisites

DB_HOST=db
DB_PORT=3306
DB_NAME=devdb
DB_USER=dev
DB_PASSWORD=dev
DB_ROOT_PASSWORD=root
```

5. Build and start all services

```bash
make build
```

## Services

| Service  | URL                   |
| :------- | :-------------------- |
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:8080 |
| Ingestor | http://localhost:8001 |
| Database | localhost:3306        |

## Useful Commands

```bash
make             # displays full list of available commands

make build       # docker compose up --build -d
make up          # docker compose up -d
make down        # docker compose down

make test        # run all tests
make lint        # lint all services
make ci          # run complete pipeline (lint/test/style)
```
