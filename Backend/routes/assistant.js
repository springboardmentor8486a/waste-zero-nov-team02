const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const axios = require('axios');

// POST /api/assistant { message }
router.post('/', protect, async (req, res) => {
  try {
    const user = req.user;
    const message = (req.body && req.body.message) ? String(req.body.message) : '';
    const settings = user.settings || {};
    // Allow user settings or fallback to 'balanced'
    const mode = settings.aiMode || req.body?.settings?.aiMode || 'balanced';

    // Construct System Prompt based on role/mode
    let systemPrompt = "You are EcoBot, a helpful AI assistant for the WasteWise platform. You help volunteers and NGOs manage waste, schedule pickups, and find opportunities. Keep answers concise and helpful.";

    if (user.role === 'ngo') {
      systemPrompt += " The user is an NGO representative. Focus on logistics, grant writing, and managing volunteers.";
    } else {
      systemPrompt += " The user is a Volunteer. Focus on safety, earning points, and finding events.";
    }

    if (mode === 'concise') systemPrompt += " Be extremely brief.";
    if (mode === 'creative') systemPrompt += " Be creative and inspiring.";

    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return res.json({ success: true, reply: "I'm sorry, I haven't been configured with an API key yet. Please contact the admin." });
    }

    // Call DeepSeek API
    const response = await axios.post('https://api.deepseek.com/chat/completions', {
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const reply = response.data?.choices?.[0]?.message?.content || "I'm having trouble thinking right now.";
    const suggestions = (settings.suggestionsEnabled ?? true) ? ['How do I earn points?', 'Schedule a pickup', 'Find nearby events'] : [];

    return res.json({ success: true, reply, suggestions });

  } catch (e) {
    // CAPTURE API ERROR DETAILS
    const apiError = e.response?.data?.error?.message || e.message || "Unknown error";
    console.error("AI Error:", apiError);

    // Return the error as a bot message so user can see it
    return res.json({
      success: true,
      reply: `Using DeepSeek Failed: ${apiError}. Please check your API Key and Balance.`
    });
  }
});

module.exports = router;
