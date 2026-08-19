# Omnix

Omnix is an AI-powered application built with a modern frontend and a modular backend architecture. The backend is organized into separate services for authentication, chat, AI agents, and billing.

## Project Structure

```text
OMNIX/
├── backend/
│   ├── gateway/
│   ├── services/
│   │   ├── agent/
│   │   ├── auth/
│   │   ├── billing/
│   │   └── chat/
│   ├── shared/
│   ├── docker-compose.yml
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

## Features

* AI-powered chat experience
* Multiple AI agent capabilities
* Conversation and message management
* Authentication and user management
* Credit/billing management
* File and image handling
* Artifact generation and preview
* Presentation generation
* Modular backend service architecture
* Docker-based backend service setup

## Architecture

The application follows a modular service-based architecture.

### Frontend

The frontend provides the user interface and communicates with the backend through the API gateway.

Main responsibilities:

* Chat interface
* Conversation management
* Message rendering
* Artifact preview
* File uploads
* Authentication UI
* AI interaction

### Backend Gateway

The gateway acts as the main entry point for frontend API requests and routes requests to the appropriate backend service.

### Agent Service

Handles AI agent functionality and agent-related processing.

### Auth Service

Handles:

* User authentication
* User sessions
* User-related authentication operations

### Chat Service

Handles:

* Conversations
* Messages
* Chat-related operations
* Conversation updates

### Billing Service

Handles:

* User credits
* Credit usage
* Billing-related operations

## Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Docker
* Docker Compose

## Environment Variables

Each service can have its own environment configuration.

Example:

```text
backend/
├── gateway/
│   └── .env
└── services/
    ├── agent/
    │   └── .env
    ├── auth/
    │   └── .env
    ├── billing/
    │   └── .env
    └── chat/
        └── .env

frontend/
└── .env
```

Environment files contain local secrets and configuration and should **not** be committed to Git.

Use `.env.example` files when sharing the required environment variable names without exposing secret values.

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd OMNIX
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Install backend dependencies according to the individual service configuration.

## Running the Application

### Frontend

```bash
cd frontend
npm run dev
```

### Backend

Backend services can be started using the provided Docker Compose configuration:

```bash
cd backend
docker compose up --build
```

To stop the services:

```bash
docker compose down
```

## Security

The following files and directories should never be committed to the repository:

* `.env`
* `.env.*`
* `node_modules/`
* `dist/`
* `serviceAccountKey.json`
* Private keys and credentials

Keep all production secrets in environment variables or an appropriate secret-management system.

## Development

Before committing changes:

```bash
git status
```

Review the changed files and make sure no secrets or generated files are included.

## License

This project is currently under development.
