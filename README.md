# Online Ticket Booking Platform Server

This is the server-side application for the Online Ticket Booking Platform.

## Purpose

The purpose of this server is to handle API requests, manage the database, and facilitate secure transactions for the ticket booking platform.

## Key Features

- **Authentication**: Secure user authentication using JWT.
- **Role-based Access Control**: Different access levels for Users, Vendors, and Admins.
- **Ticket Management**: APIs for adding, updating, deleting, and retrieving tickets.
- **Booking System**: APIs for booking tickets and managing booking status.
- **Payment Integration**: Stripe integration for secure payments.

## NPM Packages Used

- **express**: Web framework for Node.js.
- **cors**: Middleware to enable Cross-Origin Resource Sharing.
- **dotenv**: Module to load environment variables.
- **mongodb**: Official MongoDB driver for Node.js.
- **jsonwebtoken**: Implementation of JSON Web Tokens.
- **stripe**: Stripe API library for Node.js.

## Setup

1. Clone the repository.
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   DB_USER=your_db_user
   DB_PASS=your_db_pass
   ACCESS_TOKEN_SECRET=your_access_token_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```
4. Run the server: `npm run start` or `npm run dev` (if nodemon is installed)

## Live URL

(Add your live server URL here)
