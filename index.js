import "./config/global.js";
import { web3, contract, account } from "./web3.js";
import app from "./app.js";
import errorHandler from "./middlewires/errorHandler.js";
const port = process.env.PORT || 5000;



import userRoutes from "./routes/v1/user.route.js";
import authRoutes from "./routes/v1/auth.route.js";
import footballRoutes from "./routes/v1/football.route.js";
import votingRoutes from "./routes/v1/voting.route.js";
import formRouter from './routes/v1/form.route.js'
import predictionRouter from './routes/v1/prediction.route.js'
import pollRouter from './routes/v1/poll.route.js'

//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/football", footballRoutes);
app.use("/api/v1/prediction", votingRoutes);
app.use('/api/v1/form', formRouter);
app.use('/api/v1/userPrediction', predictionRouter);
app.use('/api/v1/userPoll', pollRouter);


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
process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection:", err);
});
