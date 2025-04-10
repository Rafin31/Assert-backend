import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
    fixtureId: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teamVoted: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    matchResult: { type: String, default: null }, // winning team name or ID 
    isRewarded: { type: Boolean, default: false },
    matchStartTime: { type: Date, required: true },
    processAfterTime: { type: Date, required: true }
});

const Vote = mongoose.model('Vote', VoteSchema);
export default Vote;
