import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
    fixtureId: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teamVoted: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Vote = mongoose.model('Vote', VoteSchema);
export default Vote;
