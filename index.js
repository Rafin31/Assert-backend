import "./config/global.js";
import { web3, contract, account } from "./web3.js";
//import app from "./app.js";
import errorHandler from "./middlewires/errorHandler.js";
const port = process.env.PORT || 5000;

// Rashed added start
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import router from './routes/v1/form.route.js'; // <-- Ensure this path is correct


dotenv.config();
const app = express();


// MongoDB Connection
mongoose
  .connect(process.env.MONGO_DB_CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected".bold.inverse.green))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Middleware
app.use(cors());
app.use(express.json()); // <-- Using express's built-in JSON parsing
app.use('/api/v1/form', router); // <-- API routing for form
// Rashed added end

import userRoutes from "./routes/v1/user.route.js";
import authRoutes from "./routes/v1/auth.route.js";
import footballRoutes from "./routes/v1/football.route.js";
import votingRoutes from "./routes/v1/voting.route.js";

//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/football", footballRoutes);
app.use("/api/v1/prediction", votingRoutes);

async function checkBalance() {
  try {
    const balance = await contract.methods.balanceOf(account.address).call();
    console.log(
      `Your AT Token Balance: ${web3.utils.fromWei(balance, "ether")} AT`.bold
        .inverse.green
    );
  } catch (error) {
    console.error("Error checking balance:".inverse.red, error);
  }
}

checkBalance();

//no route found
app.all("*", (req, res) => {
  res.status(404).send({ success: "false", message: "No API end point found" });
});

app.listen(port, () => {
  console.log(`Express is listening in port ${port}`.bold.inverse.green);
});

console.log("---------------------------------------------");

//handling global errors
app.use(errorHandler);

//can handel "unhandledRejection" bellow like this.
process.on("unhandledRejection", (error) => {
  console.log("unhandledRejection", error.name, error.message);
  return res
    .status(error.status || 500)
    .json({ success: "false", message: "Internal Server Error" });
  // app.close(() => {
  //     process.exit(1);
  // });
});
