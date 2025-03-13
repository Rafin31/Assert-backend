# ASSERT Backend

## 📌 Project Overview
This is the backend for the **ASSERT Prediction Platform**, a blockchain-based system where users can participate in predictions using AT tokens. The backend handles user authentication, token transactions, daily rewards, and interactions with the smart contract deployed on **Ganache**.

## 🚀 Features
- **User Authentication** (Signup & Login with email and password)
- **Wallet Integration** (Users can add their wallet address later)
- **AT Token Transactions**
  - Claim **daily rewards** (20 AT tokens every 24 hours)
  - **Deduct tokens** for participation in predictions
  - **Check user token balance** (Syncs with blockchain)
- **Smart Contract Interaction**
  - Transfers tokens using Web3.js
  - Ensures on-chain balance sync with MongoDB

## 🛠️ Technology Stack
- **Node.js** & **Express.js** (Backend Framework)
- **MongoDB** & **Mongoose** (Database)
- **Web3.js** (Blockchain Integration)
- **Ganache** (Ethereum Local Blockchain for Testing)
- **dotenv** (Environment Variable Management)
- **bcrypt.js & jsonwebtoken** (User Authentication)

---

## 📥 Installation Guide

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### **2️⃣ Install Dependencies**
```bash
npm install
```

### **3️⃣ Setup `.env` File**
Create a `.env` file in the root directory and configure the following variables:
```env
PORT=5000
MONGO_DB_CONNECTION_URI=your_mongo_db_uri
PRIVATE_KEY=your_ganache_private_key
RPC_URL=http://127.0.0.1:7545  # Ganache RPC URL
```
> ⚠️ **Note:** Use the **private key from the first account in Ganache**.

### **4️⃣ Start the Backend Server**
```bash
npm run start-dev  # For development with nodemon
npm run start      # For production
```

---

## 🔗 **How to Use This Backend with Your Own Smart Contract & Wallet**
### **🛠 Steps to Deploy Your Own Smart Contract**
1. **Modify and Deploy Your Own Smart Contract in Remix**
   - Go to [Remix Ethereum IDE](https://remix.ethereum.org/)
   - Write your **Solidity** contract (or modify the existing AT token contract)
   - Deploy it on **Ganache**
   - Copy the **Contract Address** after deployment

2. **Update `web3.js` in the Backend**
   - Open `web3.js` in your project
   - Replace the **contract address** with your own
   - Update the **ABI** if you modified the smart contract

```javascript
const contractAddress = "0xYourContractAddressHere";  // Replace this
const contractABI = [...];  // Replace with your contract's ABI
```

3. **Restart the Backe