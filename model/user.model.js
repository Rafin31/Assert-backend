const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        unique: true,
        required: true
    },
    nonce: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});


const User = mongoose.model("User", UserSchema);
module.exports = User;