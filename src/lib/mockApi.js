export const solveProblem = async (problemNumber) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error("Missing or placeholder Gemini API Key. Please update your .env file.");
  }

  const num = parseInt(problemNumber, 10);
  if (isNaN(num)) {
    throw new Error("Invalid problem number. Please enter a valid number.");
  }

  const prompt = `You are a LeetCode expert. Provide the optimal solution for LeetCode problem number ${num}.
The solution MUST be written in Python.
You must return the response strictly as a JSON object with the following structure:
{
  "title": "Problem Number. Problem Title",
  "difficulty": "Easy, Medium, or Hard",
  "algorithm": "A brief explanation of the optimal algorithm.",
  "steps": ["Step 1", "Step 2", ...],
  "code": "The optimal python code solution here"
}

Do NOT include any markdown formatting like \`\`\`json around the response. Return raw JSON only.`;

  try {
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
      throw new Error(errorData.error?.message || "Failed to fetch from Gemini");
    }

    const data = await response.json();
    let content = data.candidates[0].content.parts[0].text.trim();

    // Clean up markdown code blocks if the model still includes them
    const cleanedContent = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(error.message || "Failed to fetch the problem solution. Check API key and quota.");
  }
};
