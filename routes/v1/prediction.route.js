import express from "express";
import Prediction from "../../model/prediction.model.js";  // Corrected model import
import { showPredictions, submitForm, votePrediction, showParticipatedPredictions, showAdminApproval, showAdminUpdateStatus, markPredictionOutcome } from "../../controllers/prediction.controller.js";

const router = express.Router();

router.post("/submit", submitForm);

// Add this to your existing router file

router.get("/predictions", showPredictions);

router.post("/vote", votePrediction); // New vote endpoint

router.get("/participatedPredictions", showParticipatedPredictions); // to get user predictions

router.get("/adminApproval", showAdminApproval); // Admin approval for prediction

router.put('/updateStatus/:id', showAdminUpdateStatus);

router.put("/markOutcome/:id", markPredictionOutcome); // For Final result by Admin

export default router;
