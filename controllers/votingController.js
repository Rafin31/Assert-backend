import Vote from '../model/vote.model.js';
import User from '../model/user.model.js';  // Ensure user exists before voting
import { contract, account } from "../web3.js";

const TOKEN_DEDUCTION_FOR_VOTE = parseInt(process.env.TOKEN_DEDUCTION_FOR_VOTE) || 5;

export const castVote = async (req, res) => {
    try {
        const { userId, fixtureId, teamVoted } = req.body;

        if (!userId || !fixtureId || !teamVoted) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.totalToken < TOKEN_DEDUCTION_FOR_VOTE) {
            return res.status(400).json({ success: false, message: "Not enough AT tokens available" });
        }

        const existingVote = await Vote.findOne({ userId, fixtureId });
        if (existingVote) {
            return res.status(400).json({ success: false, message: "You have already voted for this match" });
        }

        // Deduct AT Tokens from user and send to the contract owner's wallet
        const tx = await contract.methods.transfer(account.address, TOKEN_DEDUCTION_FOR_VOTE).send({
            from: user.walletAddress,
            gas: 200000,
        });

        if (!tx.transactionHash) {
            return res.status(500).json({ success: false, message: "Token transfer failed" });
        }

        user.totalToken -= TOKEN_DEDUCTION_FOR_VOTE;
        await user.save();

        const vote = new Vote({ userId, fixtureId, teamVoted });
        await vote.save();

        // Calculate updated vote percentages
        const totalVotes = await Vote.countDocuments({ fixtureId });
        const teamAVotes = await Vote.countDocuments({ fixtureId, teamVoted: teamVoted });
        const teamBVotes = totalVotes - teamAVotes;
        const teamAPercentage = ((teamAVotes / totalVotes) * 100).toFixed(2);
        const teamBPercentage = ((teamBVotes / totalVotes) * 100).toFixed(2);

        res.status(200).json({
            success: true,
            message: "Vote recorded successfully",
            transactionHash: tx.transactionHash,
            voteData: {
                fixtureId,
                teamVoted,
                votes: {
                    teamA: teamAPercentage,
                    teamB: teamBPercentage
                }
            }
        });

    } catch (error) {
        console.error("Voting Error:", error);
        res.status(500).json({ success: false, message: "Error processing vote", error: error.message });
    }
};

