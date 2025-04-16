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
    console.log("Prediction saved:", savedPrediction);

    res.status(201).json({ success: true, data: savedPrediction });
  } catch (error) {
    console.error("Error saving prediction:", error);
    res.status(500).json({ success: false, message: "Error saving prediction", error: error.message });
  }
};

export const showPredictions = async (req, res) => {
  try {
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
    if (status === "approved") {
      if (!rule || !rule.condition?.trim() || !rule.closingDate) {
        return res.status(400).json({
          success: false,
          message: "Condition and closingDate are required for approval."
        });
      }
    }

    const updateData = { status };

    if (status === "approved") {
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

