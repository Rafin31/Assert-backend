const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');
const User = require('../model/user.model')

exports.getNonce = async (req, res) => {
    try {

        const { walletAddress } = req.body;

        if (!walletAddress) return res.status(400).json({ error: "Wallet address is required" });

        let user = await User.findOne({ walletAddress });

        if (!user) {
            user = new User({ walletAddress, nonce: Math.floor(Math.random() * 1000000) });
            await user.save();
        } else {
            user.nonce = Math.floor(Math.random() * 1000000);
            await user.save();
        }


        res.status(200).json({
            status: "Success",
            nonce: user.nonce
        })

    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error.message
        })
    }
}


exports.verify = async (req, res) => {
    try {

        const { walletAddress, signature } = req.body;

        if (!walletAddress || !signature) return res.status(400).json({ error: "Missing fields" });

        const user = await User.findOne({ walletAddress });
        if (!user) return res.status(400).json({ error: "User not found" });

        const message = `Sign this message to log in: ${user.nonce}`;
        const recoveredAddress = ethers.utils.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(401).json({ error: "Invalid signature" });
        }

        // Generate JWT token
        const token = jwt.sign({ walletAddress }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            status: "Success",
            data: { token, walletAddress }
        })

    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error.message
        })
    }
}
