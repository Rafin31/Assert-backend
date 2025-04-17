import Poll from '../model/poll.model.js'; // Updated model import

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
    const newPoll = new Poll({
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
    const savedPoll = await newPoll.save();
    console.log("Prediction saved:", savedPoll);

    res.status(201).json({ success: true, data: savedPoll });
  } catch (error) {
    console.error("Error saving prediction:", error);
    res.status(500).json({ success: false, message: "Error saving poll", error: error.message });
  }
};

export const showPoll = async (req, res) => {
  try {
    const { realm, status } = req.query;

    // Build dynamic filter based on query parameters
    const filter = {};
    if (realm) filter.realm = realm;
    if (status) filter.status = status;

    const poll = await Poll.find(filter);

    res.status(200).json({ success: true, data: poll });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching poll", error: error.message });
  }
};

export const voteOnPoll = async (req, res) => {
    try {
      const { pollId } = req.params;
      const { optionId, username, email } = req.body;

      const poll = await Poll.findById(pollId);
      if (!poll) {
        return res.status(404).json({ success: false, message: "Poll not found" });
      }

      const option = poll.outcome.id(optionId);
      if (!option) {
        return res.status(404).json({ success: false, message: "Option not found" });
      }

      // Prevent duplicate voting
      const alreadyVoted = option.voters.some(
        (voter) => voter.email === email
      );

      if (alreadyVoted) {
        return res.status(400).json({ success: false, message: "You have already voted for this option" });
      }

      option.votes += 1;
      option.voters.push({
        username,
        email,
        votedAt: new Date(),
      });

      await poll.save();

      return res.status(200).json({ success: true, message: "Vote registered", updatedPoll: poll });

    } catch (error) {
      console.error("🔥 Server error while voting:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
};


// Show logged in user poll participation
export const showParticipatedPolls = async (req, res) => {
  try {
    // Fetch all predictions without filtering
    const polls = await Poll.find();

    res.status(200).json({ success: true, data: polls });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching predictions", error: error.message });
  }
};


// Show admin all the pending polls for approval
export const showAdminApprovalPoll = async (req, res) => {
  try {
    // Fetch all predictions without filtering
    const polls = await Poll.find();

    res.status(200).json({ success: true, data: polls });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching predictions", error: error.message });
  }
};


// admin submit pending poll for approval or rejection with rules and closing
export const showAdminUpdateStatusPoll = async (req, res) => {
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

    const updated = await Poll.findByIdAndUpdate(id, updateData, { new: true });

    if (updated) {
      return res.json({ success: true, data: updated });
    } else {
      return res.status(404).json({ success: false, message: "Poll not found" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

