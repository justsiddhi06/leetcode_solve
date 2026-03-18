import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

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
You must return the response strictly as a JSON object with the following structure:
{
  "title": "Problem Number. Problem Title",
  "difficulty": "Easy, Medium, or Hard",
  "algorithm": "A brief explanation of the optimal algorithm.",
  "mermaid": "A raw mermaid code snippet (without markdown backticks) representing a visual flowchart that explains the optimal algorithm or data structure involved. IMPORTANT MERMAID SYNTAX RULES: 1. You MUST enclose all node labels and edge labels in double quotes (e.g. A[\"Initialize HashMap(num -\u003E index)\"] or A --\u003E|\"num = nums[i]\"| B). 2. Never use unquoted special characters like (, ), =, [, ], {, } in labels, as it breaks the parser.",

  "steps": {
    "english": ["Step 1 in English", "Step 2 in English"],
    "hindi": ["कदम 1 हिंदी में", "कदम 2 हिंदी में"],
    "hinglish": ["Step 1 in Hinglish", "Step 2 in Hinglish"]
  },
  "code": {
    "python": "def optimal_solution...",
    "java": "class Solution {\\n    public...",
    "c": "int* optimalSolution...",
    "cpp": "class Solution {\\npublic:..."
  }
}

Do NOT include any markdown formatting like \`\`\`json around the response. Return raw JSON only.`;

    const ai = new GoogleGenAI({});
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    let content = response.text.trim();

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
