import { web3, contract, account } from "../web3.js";
import User from "../model/user.model.js";
import mongoose from "mongoose";

const DAILY_REWARD_AMOUNT = web3.utils.toWei("20", "ether"); // Convert 20 AT to correct decimal

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getSingleUser = async (req, res) => {
    try {
        const { id } = req.params; // Extract user ID from request params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        // Check if User Exists
        const user = await User.findById(id).select("-password"); // Exclude password from response

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


// ✅ Claim Daily Reward (Using Wallet Address)
export const claimDailyReward = async (req, res) => {
    try {
        const { walletAddress } = req.body;

        // ✅ Validate Wallet Address Format
        if (!web3.utils.isAddress(walletAddress)) {
            return res.status(400).json({ success: false, message: "Invalid wallet address" });
        }

        // ✅ Find User by Wallet Address
        let user = await User.findOne({ walletAddress });
        if (!user) {
            return res.status(404).json({ success: false, message: "Wallet not registered. Please register first." });
        }

        // ✅ Check if User Has Already Claimed Reward in Last 24 Hours
        const now = new Date();
        if (user.lastLoginReward) {
            const timeDiff = now - new Date(user.lastLoginReward);
            if (timeDiff < 24 * 60 * 60 * 1000) {
                return res.status(400).json({ success: false, message: "Daily reward already claimed. Try again later." });
            }
        }

        // ✅ Transfer 20 AT Tokens to User
        const tx = await contract.methods.transfer(walletAddress, DAILY_REWARD_AMOUNT).send({
            from: account.address,
            gas: 200000,
        });

        // ✅ Fetch Updated Balance from Smart Contract
        const updatedBalanceWei = await contract.methods.balanceOf(walletAddress).call();
        const updatedBalance = web3.utils.fromWei(updatedBalanceWei, "ether"); // Convert from Wei to AT tokens

        // ✅ Update Last Claim Time & Token Balance in MongoDB
        user.lastLoginReward = now;
        user.totalToken = updatedBalance;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `You received 20 AT tokens!`,
            transactionHash: tx.transactionHash,
            newBalance: updatedBalance
        });

    } catch (error) {
        console.error("Daily Reward Error:", error);
        return res.status(500).json({ success: false, message: "Error processing daily reward", error: error.message });
    }
};





export const createUser = async (req, res) => {
    try {
        const { userName, email, password } = req.body;

        // ✅ Validate Inputs
        if (!userName || userName.length < 3) {
            return res.status(400).json({ success: false, message: "Username must be at least 3 characters" });
        }

        if (!email || !email.includes("@")) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        // let existingUser = await User.findOne({ email });
        // if (existingUser) {
        //     return res.status(400).json({ success: false, message: "Email already registered" });
        // }

        const user = new User({ userName, email, password });
        await user.save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const addWalletAddress = async (req, res) => {
    try {
        const { email, walletAddress } = req.body;

        if (!email || !email.includes("@")) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (!walletAddress || walletAddress.length !== 42) {
            return res.status(400).json({ success: false, message: "Invalid wallet address" });
        }

        // Find User by Email
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Ensure Wallet Address is Unique
        const existingWalletUser = await User.findOne({ walletAddress });
        if (existingWalletUser) {
            return res.status(400).json({ success: false, message: "Wallet address already in use" });
        }

        // Update Wallet Address
        user.walletAddress = walletAddress;
        user.updatedAt = new Date();
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Wallet address added successfully",
            user: {
                email: user.email,
                walletAddress: user.walletAddress
            }
        });

    } catch (error) {
        console.error("Error updating wallet address:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


export const deductTokens = async (req, res) => {
    try {
        const { email, amount } = req.body;


        if (!email || !email.includes("@")) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }

        //Find User by Email
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if User Has Enough Tokens
        const userBalance = parseFloat(user.totalToken);
        if (userBalance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        // Convert Amount to 18 Decimals (Wei Equivalent)
        const amountWithDecimals = web3.utils.toWei(amount.toString(), "ether");

        // Transfer Tokens Back to the Platform (Smart Contract Owner)
        const tx = await contract.methods.transfer(account.address, amountWithDecimals).send({
            from: user.walletAddress,
            gas: 200000
        });

        // Deduct from User Balance
        user.totalToken = (userBalance - amount).toString();
        await user.save();

        return res.status(200).json({
            success: true,
            message: `Successfully deducted ${amount} AT tokens from user and added back to platform`,
            transactionHash: tx.transactionHash,
            user: {
                email: user.email,
                newBalance: user.totalToken
            }
        });

    } catch (error) {
        console.error("Error deducting tokens:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};




