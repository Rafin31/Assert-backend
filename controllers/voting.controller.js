import Vote from "../model/vote.model.js";
import User from "../model/user.model.js"; // Ensure user exists before voting
import { contract, account, web3 } from "../web3.js";
import axios from "axios";

const TOKEN_DEDUCTION_FOR_VOTE = Number(process.env.TOKEN_DEDUCTION_FOR_VOTE) || 5; // Ensure it's an integer
const TOKEN_REWARD = Number(process.env.TOKEN_REWARD) || 10;
const fixtureCache = new Map();



export const castVote = async (req, res) => {
  try {
    const { userId, fixtureId, teamVoted } = req.body;

    // 1. Check user and deduct tokens
    const user = await User.findById(userId);
    if (!user || user.tokenBalance < 5) {
      return res.status(400).json({ message: 'Insufficient tokens or invalid user' });
    }

    // 2. Get fixture info from Sportmonks
    const response = await axios.get(
      `https://api.sportmonks.com/v3/football/fixtures/${fixtureId}?api_token=${process.env.FOOTBALL_TOKEN}`
    );

    const fixture = response.data?.data;
    if (!fixture || !fixture.starting_at) {
      return res.status(400).json({ message: 'Invalid fixture ID or no start time' });
    }

    const matchStartTime = new Date(fixture.starting_at);
    const processAfterTime = new Date(matchStartTime.getTime() + 3 * 60 * 60 * 1000); // +3h

    // 3. Create vote
    const vote = await Vote.create({
      fixtureId,
      teamVoted,
      userId,
      matchStartTime,
      processAfterTime,
      isRewarded: false,
      matchResult: null
    });

    // 4. Deduct tokens
    user.tokenBalance = Number(user.tokenBalance) - TOKEN_DEDUCTION_FOR_VOTE;
    await user.save();

    return res.status(200).json({ message: 'Vote placed successfully', vote });

  } catch (err) {
    console.error('Vote error:', err.message);
    res.status(500).json({ message: 'Failed to cast vote', error: err.message });
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


export const processFixtureResult = async (req, res) => {
  const { fixtureId } = req.params;

  try {
    const now = Date.now();
    const cached = fixtureCache.get(fixtureId);

    // Use cache if less than 10 minutes old
    if (cached && now - cached.timestamp < 10 * 60 * 1000) {
      return await handleFixtureProcessing(cached.data, fixtureId, res, 'cached');
    }

    // Otherwise, fetch from Sportmonks API
    const { data } = await axios.get(
      `https://api.sportmonks.com/v3/football/fixtures/${fixtureId}?api_token=${process.env.FOOTBALL_TOKEN}&include=scores`
    );

    const fixture = data?.data;
    if (!fixture || !fixture.name || !fixture.scores) {
      return res.status(404).json({ message: 'Invalid fixture or no score data' });
    }

    // Cache it
    fixtureCache.set(fixtureId, { data: fixture, timestamp: now });

    // Proceed with processing
    return await handleFixtureProcessing(fixture, fixtureId, res, 'Live');

  } catch (err) {
    console.error('Error fetching fixture result:', err.message);
    return res.status(500).json({ message: 'Failed to process match result', error: err.message });
  }
};


const handleFixtureProcessing = async (fixture, fixtureId, res, cache) => {
  const [homeTeamName, awayTeamName] = fixture.name.split(' vs ').map(t => t.trim());

  const currentScores = fixture.scores?.filter(s => s.description === 'CURRENT') || [];
  const homeScore = currentScores.find(s => s.score.participant === 'home')?.score?.goals || 0;
  const awayScore = currentScores.find(s => s.score.participant === 'away')?.score?.goals || 0;

  let winningTeamName = null;
  if (homeScore > awayScore) winningTeamName = homeTeamName;
  else if (awayScore > homeScore) winningTeamName = awayTeamName;

  const votes = await Vote.find({ fixtureId, isRewarded: false });

  if (!votes.length) {
    return res.status(200).json({ message: 'No pending votes to process.' });
  }

  let rewardedCount = 0;

  for (const vote of votes) {
    vote.matchResult = winningTeamName || 'Draw';
    vote.isRewarded = true;

    const votedTeam = vote.teamVoted?.trim().toLowerCase();
    const winningTeam = winningTeamName?.trim().toLowerCase();

    if (winningTeamName && votedTeam === winningTeam) {
      const user = await User.findById(vote.userId);
      if (user) {
        user.tokenBalance = Number(user.tokenBalance) + 10;
        await user.save();
        rewardedCount++;
      }
    }

    await vote.save();
  }

  return res.status(200).json({
    message: `Processed fixture ${fixture.name}`,
    winner: winningTeamName || 'Draw',
    totalVotes: votes.length,
    rewarded: rewardedCount,
    cache: cache
  });
};



