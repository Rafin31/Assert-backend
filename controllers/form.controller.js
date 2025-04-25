import Form from "../model/form.model.js";

export const submitForm = async (req, res) => {

  try {
    const { username, email, realm, question, moreDetails, type, status } = req.body;

    // Validate required fields
    if (!username || !email || !realm || !question) {
      return res.status(400).json({ success: false, message: "Username, realm, and question are required" });
    }

    const newForm = new Form({
      username,
      email,
      realm,
      question,
      moreDetails,
      type,
      status,
    });

    const savedForm = await newForm.save();

    res.status(201).json({ success: true, data: savedForm });
  } catch (error) {
    console.error('Error saving form:', error);
    res.status(500).json({ success: false, message: "Error saving form", error: error.message });
  }

};

export const getData = async (req, res) => {
  try {
    const { username, email } = req.body; // Assuming you send username/email to identify the user
    const forms = await Form.find().sort({ createdAt: -1 });

    // Check if the current user has liked each form and include this info
    const formsWithLikeState = forms.map(form => {
      const liked = form.likedBy.some(like => like.username === username && like.email === email);
      return { ...form.toObject(), liked };  // Add 'liked' field to the form
    });

    res.status(200).json({ success: true, data: formsWithLikeState });
  } catch (error) {
    console.error('Error fetching form data:', error);
    res.status(500).json({ success: false, message: "Error fetching form data", error: error.message });
  }
};


export const addReply = async (req, res) => {
  try {
    const { reply, username, email } = req.body;

    if (!reply || !username || !email) {
      return res.status(400).json({ success: false, message: "Reply, username, and email are required" });
    }

    // Ensure ID is correctly formatted as ObjectId
    const formId = req.params.id;
    if (!formId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error("❌ Invalid Form ID:", formId);
      return res.status(400).json({ success: false, message: "Invalid Form ID format" });
    }

    const form = await Form.findById(formId);
    if (!form) {
      console.error("❌ Form not found for ID:", formId);
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    // Add the new reply
    const newReply = {
      reply,
      username,
      email,            // Add email to the reply
      timestamp: new Date().toISOString(),
    };

    form.replies.push(newReply);
    await form.save();

    res.status(200).json({ success: true, message: "Reply added successfully", data: form });

  } catch (error) {
    console.error("❌ Error adding reply:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};


export const addLike = async (req, res) => {
  try {
    const { username, email } = req.body; // Added email to the body
    const formId = req.params.id;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    // Check if the user has already liked the post by matching both username and email
    const alreadyLiked = form.likedBy.some(like => like.username === username && like.email === email);

    if (alreadyLiked) {
      // If the user has liked, remove the like
      form.likeCount -= 1;
      form.likedBy = form.likedBy.filter(like => !(like.username === username && like.email === email)); // Remove the like
      await form.save();
      return res.status(200).json({ success: true, message: "Like removed", data: form });
    } else {
      // If the user has not liked, add the like
      form.likeCount += 1;
      const newLike = { username, email, timestamp: new Date() };
      form.likedBy.push(newLike); // Add the new like object
      await form.save();
      return res.status(200).json({ success: true, message: "Like added", data: form });
    }
  } catch (error) {
    console.error("Error updating like:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
};




// Show all forms with "pending" status for admin approval
export const showAdminApproval = async (req, res) => {
  try {
    // Fetch only forms with a "pending" status
    const pendingForms = await Form.find({ status: "pending" });
    res.status(200).json({ success: true, data: pendingForms });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching pending forms", error: error.message });
  }
};

// Update form status (approve or reject)
export const showAdminUpdateStatus = async (req, res) => {
  try {
    const formId = req.params.id;
    const { action } = req.body; // action can be "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    // Update the form status based on admin action
    if (action === "approve") {
      form.status = "approved";
    } else if (action === "reject") {
      form.status = "rejected";
    }

    await form.save();
    res.status(200).json({ success: true, message: `Form ${action}d`, data: form });
  } catch (error) {
    console.error("Error updating form status:", error);
    res.status(500).json({ success: false, message: "Error updating form status", error: error.message });
  }
};

// Show logged in user posts participation
export const showParticipatedPosts = async (req, res) => {
  try {
    // Fetch all predictions without filtering
    const posts = await Form.find();

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching posts", error: error.message });
  }
};