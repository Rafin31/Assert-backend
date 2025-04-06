import Web3 from "web3";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Load ABI and initialize Web3
const contractABI = JSON.parse(fs.readFileSync("./assets/ATTokenABI.json", "utf-8"));
const web3 = new Web3(process.env.SEPOLIA_RPC_URL);

// Add account using private key
const account = web3.eth.accounts.privateKeyToAccount('0x' + process.env.METAMASK_PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

// Initialize contract instance
const contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS_METAMASK);

// 🟡 Connection and Balance Check
async function checkConnectionAndBalance() {
    try {
        const isConnected = await web3.eth.net.isListening();
        const networkId = await web3.eth.net.getId();

        const networkName = {
            1: "Mainnet",
            5: "Goerli",
            11155111: "Sepolia"
        }[networkId] || `Unknown (${networkId})`;

        if (!isConnected) {
            console.log("❌ Not connected to any Ethereum network.".bold.red.inverse);
            return;
        }


        console.log(`✅ Connected to ${networkName}`.bold.green.inverse);

        const balanceWei = await web3.eth.getBalance(account.address);
        const balanceEth = web3.utils.fromWei(balanceWei, "ether");
        console.log(`💰 Wallet Address: ${account.address}`.bold.green.inverse);
        console.log(`🔢 ETH Balance: ${balanceEth} ETH`.bold.green.inverse);
    } catch (err) {
        console.error("❌ Connection Error:".bold.red.inverse, err.message);
    }
}

// 🔢 Get Total Supply of AT Token
async function getTotalSupply() {
    try {
        const totalSupplyWei = await contract.methods.totalSupply().call();
        const totalSupply = web3.utils.fromWei(totalSupplyWei, "ether");
        console.log(`🪙 Total Supply of AT Token: ${totalSupply} AT`.bold.green.inverse);
        return totalSupply;
    } catch (error) {
        console.error("❌ Error fetching total supply:".bold.red.inverse, error.message);
    }
}


(async () => {
    console.log("🔗 Initializing Web3 connection...".bold.yellow.inverse);
    await checkConnectionAndBalance();
    await getTotalSupply();
})();

export { web3, contract, account };
