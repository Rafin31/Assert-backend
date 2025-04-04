import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
    reply: { type: String, required: true },
    username: { type: String, required: true },
    timestamp: { 
        type: Date, 
        default: () => new Date() // Set current time for replies
      },
});

const FormSchema = new mongoose.Schema({
    username: String,
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
    likedBy: { type: [String], default: [] } // ✅ Track users who liked
});

const Form = mongoose.model('Form', FormSchema);
export default Form;
