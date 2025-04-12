import mongoose from "mongoose";

const { Schema } = mongoose;



const voteSchema = new mongoose.Schema({
  username: String,
  email: String,
  timestamp: Date,
  voteCount: Number,
});

const resultsSchema = new Schema({
  winnerEmail: { type: String, required: true },
});

const ruleSchema = new Schema({
  condition: { type: String, required: true },
  closingDate: { type: Date, required: true },
});

const predictionSchema = new mongoose.Schema({
  realm: { type: String, required: true },
  category: { type: String },
  subcategory: { type: String },
  question: { type: String, required: true },
  username: { type: String },
  email: { type: String },
  outcome: {
    yesVotes: [voteSchema],
    noVotes: [voteSchema],
  },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, default: "prediction" },
  status: { type: String, default: "pending" },
  results: [resultsSchema],
  rule: [ruleSchema],
}, { timestamps: true });

const Prediction = mongoose.model("Prediction", predictionSchema);

export default Prediction;
