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
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Convert user.totalToken to Wei before comparing
    const userBalanceWei = web3.utils.toWei(
      user.totalToken.toString(),
      "ether"
    );
    const userBalanceBigInt = BigInt(userBalanceWei);

    if (userBalanceBigInt < TOKEN_DEDUCTION_AMOUNT) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough AT tokens available" });
    }

    const existingVote = await Vote.findOne({ userId, fixtureId });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "You have already voted for this match",
      });
    }

    // Deduct AT Tokens from user and send to the contract owner's wallet
    const tx = await contract.methods
      .transfer(account.address, TOKEN_DEDUCTION_AMOUNT.toString()) // Ensure it's a string
      .send({
        from: user.walletAddress,
        gas: 200000,
      });

    if (!tx.transactionHash) {
      return res
        .status(500)
        .json({ success: false, message: "Token transfer failed" });
    }

    // ✅ Convert updated balance back to Ether before saving
    const updatedBalanceWei = await contract.methods
      .balanceOf(user.walletAddress)
      .call();
    const updatedBalance = web3.utils.fromWei(updatedBalanceWei, "ether");

    user.totalToken = updatedBalance; // Save the new balance
    await user.save();

    const vote = new Vote({ userId, fixtureId, teamVoted });
    await vote.save();

    // Calculate updated vote percentages
    const totalVotes = await Vote.countDocuments({ fixtureId });
    const teamAVotes = await Vote.countDocuments({
      fixtureId,
      teamVoted: teamVoted,
    });
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
          teamB: teamBPercentage,
        },
      },
    });
  } catch (error) {
    console.error("Voting Error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing vote",
      error: error.message,
    });
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
