import Form from "../model/Form.js";

// Store form data
export const submitForm = async (req, res) => {
  try {
    const { username, realm, question, moreDetails } = req.body;
    if (!username || !realm || !question) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newForm = new Form({ username, realm, question, moreDetails, type, status });
    await newForm.save();

    res.status(201).json({ success: true, message: "Form submitted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
};
