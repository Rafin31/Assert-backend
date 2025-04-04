import Web3 from "web3";
import dotenv from "dotenv";
import fs from "fs";

const contractABI = JSON.parse(fs.readFileSync("./assets/ATTokenABI.json", "utf-8"));

dotenv.config(); // Load environment variables

// Connect to Ganache's local blockchain
const web3 = new Web3(process.env.SEPOLIA_RPC_URL);

// Load the wallet account using the private key
const account = web3.eth.accounts.privateKeyToAccount('0x' + process.env.METAMASK_PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

// Load the deployed ATToken smart contract
const contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS_METAMASK);

console.log("---------------------------------------------")
console.log("Web3.js Connected to Sepolia".bold.green.inverse);
console.log(`Wallet Address: ${account.address}`.bold.green.inverse);
console.log(`Contract Address: ${process.env.CONTRACT_ADDRESS_METAMASK}`.bold.green.inverse);


export { web3, contract, account };
