import Vote from "../model/vote.model.js";
import User from "../model/user.model.js"; // Ensure user exists before voting
import { contract, account, web3 } from "../web3.js";

const TOKEN_DEDUCTION_FOR_VOTE =
  BigInt(Number(process.env.TOKEN_DEDUCTION_FOR_VOTE)) || 5; // Ensure it's an integer
const TOKEN_DEDUCTION_AMOUNT = TOKEN_DEDUCTION_FOR_VOTE * BigInt(10 ** 18); // Convert to Wei

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

    if (user.totalToken < 5) {
      return res.status(400).json({ success: false, message: "Not enough AT tokens" });
    }

    const existingVote = await Vote.findOne({ userId, fixtureId });
    if (existingVote) {
      return res.status(400).json({ success: false, message: "Already voted for this match" });
    }

    // Simulate token deduction and track internally
    user.totalToken -= 5;
    await user.save();

    const vote = new Vote({ userId, fixtureId, teamVoted });
    await vote.save();

    return res.status(200).json({
      success: true,
      message: "Vote recorded successfully",
      voteData: { fixtureId, teamVoted },
    });
  } catch (error) {
    console.error("Voting Error:", error);
    res.status(500).json({ success: false, message: "Vote failed", error: error.message });
  }
};


export const getUserVotes = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const votes = await Vote.find({ userId });

    res.status(200).json({ success: true, votes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user votes",
      error: error.message,
    });
  }
};
