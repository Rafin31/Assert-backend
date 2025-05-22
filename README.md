# ASSERT Backend

This is the backend server for **ASSERT**, a blockchain-enabled prediction platform where users participate in debates, polls, and predictions using token-based logic. The backend is built with Node.js and Express, connected to MongoDB and integrated with a smart contract using Web3.

---

## Project Structure

```
├── assets/                   # Sample ABI, contract metadata, docs
├── config/                   # MongoDB and app configuration
│   └── db.js
├── controllers/              # Main controller logic (auth, form, etc.)
├── middlewires/              # Custom middleware (auth checks, error handling)
├── model/                    # Mongoose models (User, Thread, Notification)
├── routes/
│   └── v1/                   # Versioned API route definitions
├── app.js                    # Express app setup
├── index.js                  # Entry point
├── web3.js                   # Web3 + contract instance configuration
├── .env                      # Environment variables
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── package-lock.json
├── yarn.lock
```

---

## Features

- RESTful API using Express.js
- MongoDB integration via Mongoose
- JWT-based authentication
- Smart contract integration (ATToken) with Web3.js
- Vote cost and reward logic using tokens
- Daily login rewards
- Match result validation using Sportmonks API
- Caching and cron logic for efficient API usage
- Notification system (stored in DB)

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/assert-backend.git
cd assert-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
SPORTMONKS_API_KEY=your_sportmonks_api_key
OWNER_WALLET_ADDRESS=0xYourOwnerWallet
OWNER_PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=your_contract_address
```

> ⚠️ Keep your private keys secure and avoid committing them to version control.

### 4. Run the development server
```bash
npm run start-dev
```

> Server runs on `http://localhost:5000` by default.

---

## API Overview

| Method | Route                     | Description                          |
|--------|---------------------------|--------------------------------------|
| POST   | /api/v1/auth/signup       | Register a new user                  |
| POST   | /api/v1/auth/login        | Log in an existing user              |
| POST   | /api/v1/form/thread       | Create a new thread (poll/debate)    |
| POST   | /api/v1/form/vote         | Vote on a thread using tokens        |
| GET    | /api/v1/form/category/:c  | Get approved threads by category     |
| POST   | /api/v1/reward/claim      | Claim daily login reward             |
| POST   | /api/v1/validate/matches  | Validate match results via API       |
| GET    | /api/v1/notifications     | Fetch user notifications             |

> Routes are defined under `/routes/v1` and handled in `/controllers`.

---

## Technologies Used

- Node.js + Express.js
- MongoDB + Mongoose
- Web3.js
- Solidity smart contract (ATToken)
- JSON Web Tokens (JWT)
- Sportmonks API
- Cron Jobs
- Caching with in-memory logic

---

## Smart Contract Integration

- The smart contract (`ATToken.sol`) is compiled and deployed manually (e.g., Remix, Ganache).
- Web3 is used only by the backend to perform `mint`, `transfer`, and `balanceOf` actions using the owner's wallet.
- Users do not need real wallets — their balances are tracked in MongoDB for simulation.

---

## Contribution

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add new feature"`
4. Push the branch: `git push origin feature/my-feature`
5. Open a pull request

---

## License

This project is licensed under the MIT License.

---

## Credits

Developed as part of the **ASSERT Capstone Project** at the University of Wollongong by Team ASSERT.
