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



async function checkConnectionAndBalance() {
    const isConnected = await web3.eth.net.isListening();
    if (!isConnected) {
        return console.log("❌ Not connected to a network");
    }

    const networkId = await web3.eth.net.getId();
    const networkName = {
        11155111: "Sepolia",
    }[networkId] || "Unknown";

    console.log(`✅ Connected to ${networkName} (ID: ${networkId})`);

    const balanceWei = await web3.eth.getBalance(account.address);
    const balanceEth = web3.utils.fromWei(balanceWei, "ether");
    console.log(`💰 ${account.address} has ${balanceEth} ETH`);
}

// checkConnectionAndBalance()


export { web3, contract, account };
