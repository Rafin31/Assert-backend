import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
    reply: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true }, // ✅ Added email field
    timestamp: {
        type: Date,
        default: () => new Date() // Set current time for replies
    },
});

const LikeSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    timestamp: {
        type: Date,
        default: () => new Date() // Time when the like was made
    },
});

const FormSchema = new mongoose.Schema({
    username: String,
    email: String,
    realm: String,
    question: String,
    moreDetails: String,
    type: String,
    replies: { type: [ReplySchema], default: [] },
    timestamp: {
        type: Date,
        default: () => new Date()
    },
    status: { type: String, default: "pending" },
    likeCount: { type: Number, default: 0 },
    likedBy: { type: [LikeSchema], default: [] }
});

const Form = mongoose.model('Form', FormSchema);
export default Form;
