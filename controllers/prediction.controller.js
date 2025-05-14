import Prediction from '../model/prediction.model.js';

// Store form data
export const submitForm = async (req, res) => {
  try {
    const { realm, category, subcategory, question, username, email, outcome, results, rule } = req.body;

    // Validate required fields
    if (!realm || !question || !username || !email) {
      return res.status(400).json({
        success: false,
        message: "Realm, question, username, and email are required fields.",
      });
    }

    // Create a new prediction instance
    const newPrediction = new Prediction({
      realm,
      category,
      subcategory,
      question,
      username,
      email,
      outcome,
      results,
      rule,
    });

    // Save the new prediction to the database
    const savedPrediction = await newPrediction.save();

    res.status(201).json({ success: true, data: savedPrediction });
  } catch (error) {
    console.error("Error saving prediction:", error);
    res.status(500).json({ success: false, message: "Error saving prediction", error: error.message });
  }
};

export const showPredictions = async (req, res) => {
  try {

    // Run status update check
    await updateExpiredPredictionsStatus();

    const { realm, status } = req.query;

    // Build dynamic filter based on query parameters
    const filter = {};
    if (realm) filter.realm = realm;
    if (status) filter.status = status;

    const predictions = await Prediction.find(filter);

    res.status(200).json({ success: true, data: predictions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching predictions", error: error.message });
  }
};


export const votePrediction = async (req, res) => {
  try {
    const { predictionId, voteType, username, email, timestamp } = req.body;

    // Check for missing data
    if (!predictionId || !voteType || !username || !email) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Find the prediction by ID
    const prediction = await Prediction.findById(predictionId);

    if (!prediction) {
      return res.status(404).json({ success: false, message: "Prediction not found" });
    }

    // Check if voting is allowed based on status
    if (prediction.status === "pending_result") {
      return res.status(403).json({
        success: false,
        message: "Voting has ended for this prediction."
      });
    }

    // Optional: Check if current time is past the closingDate
    if (prediction.rule?.[0]?.closingDate && new Date() > new Date(prediction.rule[0].closingDate)) {
      return res.status(403).json({
        success: false,
        message: "Voting time has expired."
      });
    }

    // Update the votes based on the voteType
    if (voteType === "yes") {
      prediction.outcome.yesVotes.push({ username, email, timestamp });
    } else if (voteType === "no") {
      prediction.outcome.noVotes.push({ username, email, timestamp });
    } else {
      return res.status(400).json({ success: false, message: "Invalid vote type" });
    }

    // Save the prediction after the vote update
    await prediction.save();

    return res.status(200).json({ success: true, message: "Vote recorded successfully" });
  } catch (error) {
    console.error("Error voting prediction:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// Show logged in user prediction participation
export const showParticipatedPredictions = async (req, res) => {
  try {
    // Fetch all predictions without filtering
    const predictions = await Prediction.find();

    res.status(200).json({ success: true, data: predictions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching predictions", error: error.message });
  }
};

// Show admin all the pending prediction for approval
export const showAdminApproval = async (req, res) => {
  try {
    // Fetch all predictions without filtering
    const predictions = await Prediction.find();

    res.status(200).json({ success: true, data: predictions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching predictions", error: error.message });
  }
};


// admin submit pending prediction for approval or rejection with rules and closing
export const showAdminUpdateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, rule } = req.body;

  try {
    // Validation for 'approved' status
    if (status === "approved" || status === "rejected") {
      // Check for condition and closingDate in both cases
      if (!rule || !rule.condition?.trim() || !rule.closingDate) {
        return res.status(400).json({
          success: false,
          message: "Condition and closingDate are required for approval or rejection."
        });
      }
    }

    const updateData = { status };

    if (status === "approved" || status === "rejected") {
      updateData.rule = [{
        condition: rule.condition.trim(),
        closingDate: new Date(rule.closingDate)
      }];
    }

    const updated = await Prediction.findByIdAndUpdate(id, updateData, { new: true });

    if (updated) {
      return res.json({ success: true, data: updated });
    } else {
      return res.status(404).json({ success: false, message: "Prediction not found" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


// Automatically update status of predictions whose closing date has passed
export const updateExpiredPredictionsStatus = async () => {
  const now = new Date();

  try {
    const expired = await Prediction.updateMany(
      {
        "rule.0.closingDate": { $lte: now },
        status: "approved"
      },
      { $set: { status: "pending_result" } }
    );

    
  } catch (error) {
    console.error("Error updating expired predictions:", error);
  }
};


// Mark outcome and reward winners
export const markPredictionOutcome = async (req, res) => {
  try {
    const { predictionId, winningOutcome } = req.body;

    if (!["Yes", "No", "No Result"].includes(winningOutcome)) {
      return res.status(400).json({ success: false, message: "Invalid outcome" });
    }

    const prediction = await Prediction.findById(predictionId);
    if (!prediction) {
      return res.status(404).json({ success: false, message: "Prediction not found" });
    }

    // If 'No Result', update and return
    if (winningOutcome === "No Result") {
      prediction.status = "resolved";
      
      await prediction.save();
      return res.json({ success: true, message: "Marked as No Result" });
    }

    const winningVotes = winningOutcome === "Yes" ? prediction.outcome.yesVotes : prediction.outcome.noVotes;
    const winnerEmails = winningVotes.map(v => v.email);

    prediction.results = winnerEmails.map(email => ({ winnerEmail: email }));
    prediction.status = "resolved";
    await prediction.save();

    res.json({ success: true, message: "Outcome recorded and winners marked" });
  } catch (error) {
    console.error("Error marking outcome:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
