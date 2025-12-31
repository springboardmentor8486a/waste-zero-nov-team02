const express = require("express");
const axios = require("axios");

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
      },
      { timeout: 60000 }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(500).json({
        success: false,
        message: "Empty AI response",
      });
    }

    return res.json({
      success: true,
      reply,
    });
  } catch (err) {
    console.error(
      "❌ Gemini error:",
      err.response?.data || err.message
    );

    return res.status(503).json({
      success: false,
      message: "AI unavailable",
    });
  }
});

module.exports = router;
