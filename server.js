import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/solve', async (req, res) => {
  try {
    const { problemNumber } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error: Missing Gemini API Key.' });
    }

    if (!problemNumber) {
      return res.status(400).json({ error: 'Missing problem number or name.' });
    }

    const prompt = `You are a LeetCode expert. Provide the optimal solution for the following LeetCode problem: "${problemNumber}".
The solution MUST be written in Python.
You must return the response strictly as a JSON object with the following structure:
{
  "title": "Problem Number. Problem Title",
  "difficulty": "Easy, Medium, or Hard",
  "algorithm": "A brief explanation of the optimal algorithm.",
  "steps": {
    "english": ["Step 1 in English", "Step 2 in English"],
    "hindi": ["कदम 1 हिंदी में", "कदम 2 हिंदी में"],
    "hinglish": ["Step 1 in Hinglish", "Step 2 in Hinglish"]
  },
  "code": "The optimal python code solution here"
}

Do NOT include any markdown formatting like \`\`\`json around the response. Return raw JSON only.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || "Failed to fetch from Gemini" });
    }

    const data = await response.json();
    let content = data.candidates[0].content.parts[0].text.trim();

    // Clean up markdown code blocks if the model still includes them
    const cleanedContent = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    res.json(JSON.parse(cleanedContent));

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred on the server." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API Server running on port ${PORT}`);
});
