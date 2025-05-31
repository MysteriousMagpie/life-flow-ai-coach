# Life Flow AI Coach - Server

This is the backend server for the Life Flow AI Coach application. It is built using Express.js and provides the API endpoints for the client application.

## Project Structure

- `/src/` - Contains the source code for the server application.
  - `/controllers/` - Contains the controller files that handle the business logic for different API endpoints.
  - `/routes/` - Contains the route definitions for the Express application.
  - `/types/` - Contains TypeScript type definitions used in the server application.
- `app.ts` - The entry point of the Express backend application. It sets up middleware, routes, and starts the server.

## Quick Start

### Prerequisites

Make sure you have Node.js and npm installed.

### Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`.

### Running the Server

To start the development server, run:
```bash
npm run dev
```

The API server will be available at `http://localhost:3000`.

## API Endpoints

- **GET /api/example** - Example endpoint to demonstrate API functionality.

## Development Workflow

1. Start the backend server from the `/server` directory.
2. Ensure the client application is running to test API endpoints.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test thoroughly.
5. Submit a pull request.

## License

This project is licensed under the MIT License.