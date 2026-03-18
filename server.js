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
CRITICAL INSTRUCTION: MAXIMIZE GENERATION SPEED. DO NOT write any code comments. Keep the algorithm explanation extremely brief (under 3 sentences).
You must return the response strictly as a JSON object with the following structure:
{
  "title": "Problem Number. Problem Title",
  "difficulty": "Easy, Medium, or Hard",
  "algorithm": "A brief explanation of the optimal algorithm.",
  "mermaid": "A raw mermaid code snippet (without markdown backticks) for a flowchart. MUST start with 'graph TD' in exact lowercase. CRITICAL: Keep all node text and edge text extremely simple. Use ONLY alphanumeric letters and spaces. DO NOT use ANY special characters like =, (, ), [, ], {, }, -, > in any label because it breaks the flowchart parser.",

  "steps": {
    "english": ["Step 1 in English", "Step 2 in English"],
    "hindi": ["कदम 1 हिंदी में", "कदम 2 हिंदी में"],
    "hinglish": ["Step 1 in Hinglish", "Step 2 in Hinglish"]
  },
  "code": {
    "cpp": "class Solution {\\npublic:...",
    "java": "class Solution {\\n    public...",
    "python3": "class Solution:\\n...",
    "python": "class Solution(object):\\n...",
    "javascript": "var optimalSolution = function...",
    "typescript": "function optimalSolution...",
    "csharp": "public class Solution {...",
    "c": "int* optimalSolution...",
    "go": "func optimalSolution...",
    "kotlin": "class Solution {...",
    "swift": "class Solution {...",
    "rust": "impl Solution {...",
    "ruby": "def optimal_solution...",
    "php": "class Solution {...",
    "dart": "class Solution {...",
    "scala": "object Solution {...",
    "elixir": "defmodule Solution do...",
    "erlang": "-module(solution)...",
    "racket": "(define/contract..."
  }
}

Do NOT include any markdown formatting like \`\`\`json around the response. Return raw JSON only.`;

    const ai = new GoogleGenAI({});
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
