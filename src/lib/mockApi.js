export const solveProblem = async (problemNumber) => {
  try {
    const response = await fetch('/api/solve', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ problemNumber })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch from server");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(error.message || "Failed to communicate with the server.");
  }
};

export const sendChatMessage = async (messages, context) => {
  try {
    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages, context })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch from chat API");
    }

    return await response.json();
  } catch (error) {
    console.error("Chat API Error:", error);
    throw new Error(error.message || "Failed to communicate with the chat server.");
  }
};
