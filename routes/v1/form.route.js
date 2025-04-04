import express from 'express';
import Form from '../../model/form.model.js';

const router = express.Router();


router.post('/submit', async (req, res) => {
  console.log('Received form data:', req.body);
  try {
    const { username, realm, question, moreDetails, type, status } = req.body;

    // Validate required fields
    if (!username || !realm || !question) {
      return res.status(400).json({ success: false, message: "Username, realm, and question are required" });
    }

    const newForm = new Form({
      username,
      realm,
      question,
      moreDetails,
      type,
      status,
    });

    const savedForm = await newForm.save();
    console.log('Form saved:', savedForm);

    res.status(201).json({ success: true, data: savedForm });
  } catch (error) {
    console.error('Error saving form:', error);
    res.status(500).json({ success: false, message: "Error saving form", error: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 }); // Sort by newest
    res.status(200).json({ success: true, data: forms });
  } catch (error) {
    console.error('Error fetching form data:', error);
    res.status(500).json({ success: false, message: "Error fetching form data", error: error.message });
  }
});


router.put('/:id/reply', async (req, res) => {
  try {
    const { reply, username } = req.body;
    console.log("📝 Received reply request:", req.body);
    console.log("🔎 Form ID:", req.params.id);

    if (!reply || !username) {
      return res.status(400).json({ success: false, message: "Reply and username are required" });
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
      timestamp: new Date().toISOString(),
    };

    form.replies.push(newReply);
    await form.save();

    console.log("✅ Reply added successfully:", newReply);
    res.status(200).json({ success: true, message: "Reply added successfully", data: form });

  } catch (error) {
    console.error("❌ Error adding reply:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});


router.put('/:id/like', async (req, res) => {
  try {
    const { username } = req.body;
    const formId = req.params.id;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    const alreadyLiked = form.likedBy.includes(username); // Check if the user has already liked

    if (alreadyLiked) {
      // If the user has liked, remove the like
      form.likeCount -= 1;
      form.likedBy = form.likedBy.filter(user => user !== username); // Remove the user from the likedBy array
      await form.save();
      return res.status(200).json({ success: true, message: "Like removed", data: form });
    } else {
      // If the user has not liked, add the like
      form.likeCount += 1;
      form.likedBy.push(username); // Add the user to the likedBy array
      await form.save();
      return res.status(200).json({ success: true, message: "Like added", data: form });
    }
  } catch (error) {
    console.error("Error updating like:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
});


export default router;





