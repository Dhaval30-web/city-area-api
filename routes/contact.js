const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Contact = require("../models/Contact");

// Reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST /api/contact -> save message + send mail
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // 1. Save to MongoDB (with who & when)
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();

    // 2. Send mail to your inbox
    const mailOptions = {
      from: `"Charbhuja Store Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // dhavalpra96@gmail.com
      replyTo: email, // direct reply jaye user ko
      subject: `New Contact Message: ${subject}`,
      html: `
        <h3>New message from Charbhuja Store Contact Form</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b><br/>${message}</p>
        <hr/>
        <p><b>Submitted At:</b> ${new Date(newContact.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Mail send error:", err);
        // Mail fail ho to bhi user ko success bolenge, kyunki DB me save ho chuka hai
      } else {
        console.log("Mail sent:", info.response);
      }
    });

    return res.status(201).json({
      success: true,
      message: "Message saved successfully.",
      data: newContact,
    });
  } catch (err) {
    console.error("Contact save error:", err);
    return res.status(500).json({ success: false, message: "Server error, please try again." });
  }
});

// GET /api/contact -> fetch all messages (admin panel)
router.get("/", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: messages });
  } catch (err) {
    console.error("Contact fetch error:", err);
    return res.status(500).json({ success: false, message: "Server error, please try again." });
  }
});

module.exports = router;