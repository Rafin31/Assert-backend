import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

export const getNonce = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress)
      return res.status(400).json({ error: "Wallet address is required" });

    let user = await User.findOne({ walletAddress });

    if (!user) {
      user = new User({
        walletAddress,
        nonce: Math.floor(Math.random() * 1000000),
      });
      await user.save();
    } else {
      user.nonce = Math.floor(Math.random() * 1000000);
      await user.save();
    }

    res.status(200).json({
      status: "Success",
      nonce: user.nonce,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

export const verify = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature)
      return res.status(400).json({ error: "Missing fields" });

    const user = await User.findOne({ walletAddress });
    if (!user) return res.status(400).json({ error: "User not found" });

    const message = `Sign this message to log in: ${user.nonce}`;
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Generate JWT token
    const token = jwt.sign({ walletAddress }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      status: "Success",
      data: { token, walletAddress },
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

export const signup = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    // Validate Required Fields
    if (!userName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already registered" });
    }

    const newUser = new User({
      userName,
      email,
      password,
      totalToken: "0",
    });

    await newUser.save();

    return res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate Required Fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Find User by Email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d", // Token valid for 7 days
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        totalToken: user.totalToken,
        lastLoginReward: user.lastLoginReward,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
