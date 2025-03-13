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

export const claimDailyReward = async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!web3.eth.accounts.wallet.add(walletAddress)) {
            return res.status(400).json({ success: false, message: "Invalid wallet address" });
        }

        // Find or create user in DB
        let user = await User.findOne({ walletAddress });
        if (!user) {
            user = new User({ walletAddress });
            await user.save();
        }

        const now = new Date();
        if (user.lastLoginReward) {
            const timeDiff = now - new Date(user.lastLoginReward);
            if (timeDiff < 24 * 60 * 60 * 1000) { // 24 hours in milliseconds
                return res.status(400).json({ success: false, message: "Daily reward already claimed. Try again later." });
            }
        }

        // Transfer 20 AT tokens to user's wallet
        const tx = await contract.methods.transfer(walletAddress, DAILY_REWARD_AMOUNT).send({
            from: account.address,
            gas: 200000,
        });

        // Update last claim time
        user.lastLoginReward = now;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `You received 20 AT tokens!`,
            transactionHash: tx.transactionHash,
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




