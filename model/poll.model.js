import mongoose from "mongoose";

const { Schema } = mongoose;

const voterSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  votedAt: { type: Date, default: Date.now },
}); 

const optionSchema = new Schema({
  name: { type: String, required: true },
  votes: { type: Number, default: 0 },
  voters: [voterSchema],
});

const resultSchema = new Schema({
  winnerEmail: { type: String, required: true },
});

const ruleSchema = new Schema({
  condition: { type: String, required: true },
  closingDate: { type: String, default: "Prediction closing date to be decided by admin" },
});

const pollSchema = new Schema({
  realm: { type: String, required: true },
  category: { type: String },
  subcategory: { type: String },
  question: { type: String, required: true },
  username: { type: String },
  email: { type: String },
  outcome: [optionSchema],
  timestamp: { type: Date, default: Date.now },
  type: { type: String, default: "poll" },
  status: { type: String, default: "pending" },
  results: [resultSchema],
  rule: [ruleSchema],
}, { timestamps: true });

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;
