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
CRITICAL INSTRUCTION: MAXIMIZE GENERATION SPEED. DO NOT write any code comments. Keep the algorithm explanation extremely brief (under 3 sentences). Provide a detailed, line-by-line breakdown of the optimal Python 3 solution in the "interactive_explanation" array, where "code" is the exact line of code and "explanation" is a natural, conversational spoken script explaining that line. You ONLY need to provide the "python3" solution in the "code" object. Do NOT provide all languages initially to maximize speed.
You must return the response strictly as a JSON object with the following structure:
{
  "title": "Problem Number. Problem Title",
  "difficulty": "Easy, Medium, or Hard",
  "algorithm": "A brief explanation of the optimal algorithm.",
  "interactive_explanation": [
    {
      "code": "class Solution:",
      "explanation": "This line defines the main class for our solution."
    },
    {
      "code": "    def twoSum(self, nums, target):",
      "explanation": "We define a function that takes an array of numbers and our target sum."
    }
  ],

  "steps": {
    "english": ["Step 1 in English", "Step 2 in English"],
    "hindi": ["कदम 1 हिंदी में", "कदम 2 हिंदी में"],
    "hinglish": ["Step 1 in Hinglish", "Step 2 in Hinglish"]
  },
  "code": {
    "python3": "class Solution:\\n..."
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

app.post('/api/explain', async (req, res) => {
  try {
    const { title, language, code, spokenLanguage = 'english' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: 'Missing Gemini API Key.' });
    if (!title || !language) return res.status(400).json({ error: 'Missing required fields.' });

    let prompt = '';
    
    if (code) {
      prompt = `You are a LeetCode tutor.
Problem: "${title}"
Code Language: ${language}
Explanation Spoken Language: ${spokenLanguage}

CODE:
${code}

Provide a detailed, line-by-line spoken-word breakdown of this exact code in the requested Explanation Spoken Language (${spokenLanguage}).
Return strictly as a JSON object with this exact structure:
{
  "interactive_explanation": [
    {
      "code": "exact line of code here",
      "explanation": "natural spoken breakdown of what this line does in ${spokenLanguage}"
    }
  ]
}
Do NOT wrap the response in markdown \`\`\`json blocks. Return raw JSON.`;
    } else {
      prompt = `You are a LeetCode tutor.
Problem: "${title}"
Target Code Language: ${language}
Explanation Spoken Language: ${spokenLanguage}

1. Provide the optimal working solution for this problem in ${language}.
2. Provide a detailed, line-by-line spoken-word breakdown of your generated code in the requested Explanation Spoken Language (${spokenLanguage}).

Return strictly as a JSON object with this exact structure:
{
  "code": "exact generated code here",
  "interactive_explanation": [
    {
      "code": "exact line of code here",
      "explanation": "natural spoken breakdown of what this line does in ${spokenLanguage}"
    }
  ]
}
Do NOT wrap the response in markdown \`\`\`json blocks. Return raw JSON.`;
    }

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
    const cleanedContent = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    res.json(JSON.parse(cleanedContent));

  } catch (error) {
    console.error("Explain endpoint error:", error);
    res.status(500).json({ error: "Failed to generate interactive explanation." });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: 'Missing Gemini API Key.' });
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Missing or invalid messages array.' });

    // Format previous messages for the prompt
    const chatHistory = messages.map(m => `${m.role === 'user' ? 'Student' : 'AI'}: ${m.content}`).join('\n');
    
    // Add LeetCode problem context if available
    const problemContextSource = context && context.title ? `You are a friendly, expert Computer Science tutor helping a student understand a LeetCode problem.
Current Problem context: ${context.title}
Current Code Context:
\`\`\`
${context.code || 'None yet'}
\`\`\`
` : 'You are a friendly, expert Computer Science tutor helping a student learn coding.';

    const systemPrompt = `CRITICAL INSTRUCTION: You MUST respond in either English or Hinglish (Hindi written using the English alphabet). Do NOT use the Devanagari script (e.g. do not use words like 'क्या', use 'kya' instead). Make your explanation concise, extremely clear, and encouraging.

${problemContextSource}

Chat History:
${chatHistory}

AI (respond in Hinglish or English):`;

    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
      config: {
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text.trim() });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({ error: "Failed to generate chat response." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API Server running on port ${PORT}`);
});
