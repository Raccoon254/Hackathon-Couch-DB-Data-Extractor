# CouchDB Document Fetcher and API Server

This Node.js script fetches documents from all databases in a CouchDB instance, stores them locally as JSON files, and sets up an Express.js server to serve those documents through a RESTful API.

## Prerequisites

- Node.js version 16 
- CouchDB server accessible at `http://127.0.0.1:5984`
- Basic understanding of Node.js and Express.js

## Installation

1. Clone this repository or download the script file.
2. Install dependencies by running `npm install nano express`.

## Configuration

Ensure CouchDB server is running and accessible at http://127.0.0.1:5984.
Modify the CouchDB connection details (URL, username, and password) in the script if required.

## Usage

1. Ensure your CouchDB server is running.
2. Run the script using `node index.js`.
3. Access the fetched documents via API endpoints, e.g., GET /api/<dbName>.

## Script Overview

- **Connecting to CouchDB:** The script initializes a connection to CouchDB using `nano`, specifying the server URL and authentication credentials.
- **Creating Data Directory:** It checks if a directory named `data` exists. If not, it creates one.
- **Fetching and Storing Database Documents:** Documents from each database are fetched and stored locally as JSON files in the `data` directory.
- **Setting Up API Endpoints:** After storing documents, API endpoints are created for each database using Express.js.
- **Starting the Server:** The script starts an Express.js server listening on a specified port (default is 3000).

## API Endpoints

- **GET /api/{database-name}:** Retrieves data from the specified CouchDB database.
  Example: GET http://localhost:3000/api/medic

- **POST /auth/login:** Authenticates users.
  Example:  curl -X POST -H "Content-Type: application/json" -d '{"username":"yourusername","password":"yourpassword"}' http://localhost:3000/auth/login

## Features

- Fetches documents from CouchDB databases and stores them as JSON files locally.
- Provides API endpoints to access the stored data.
- Supports user authentication via HTTP POST requests.

## Security Considerations

- Ensure proper security measures are in place, such as securing CouchDB with HTTPS and using secure authentication methods.
- Review and adjust configurations as needed for remote or customized setups.
