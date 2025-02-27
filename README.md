# BTMCoin Project

A blockchain-based cryptocurrency project with frontend, backend, and CLI components.

## Project Structure

```
├── frontend/       # Vue.js frontend application
├── backend/        # Go backend server
├── cli/            # Command-line interface tools
└── src/            # Shared services
```

## Prerequisites

- Node.js (v16 or higher)
- Go (v1.21 or higher)
- Redis

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd btmcoin
```

2. Set up environment variables:
- Copy `.env.example` to `.env` in the root directory
- Copy `frontend/.env.example` to `frontend/.env`
- Copy `cli/.env.example` to `cli/.env`
- Update the environment variables with your credentials

3. Install and run the frontend:
```bash
cd frontend
npm install
npm run dev
```

4. Set up and run the backend:
```bash
cd backend
go mod download
go run main.go
```

5. Set up the CLI tools:
```bash
cd cli
npm install
```

## Features

- Blockchain integration with Cosmos SDK
- Real-time updates using WebSocket
- Rate-limited API endpoints
- Supabase integration for data storage
- CLI tools for blockchain interaction

## Development

- Frontend runs on port 5173 by default
- Backend API runs on port 8080
- Redis is required for rate limiting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
