const HISTORY_KEY = 'leetcode_solve_history';
const MAX_HISTORY_ITEMS = 20;

export const getHistory = () => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    return [];
  }
};

export const saveHistory = (history) => {
  try {
    // Limit history length
    const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
    return limitedHistory;
  } catch (error) {
    console.error("Failed to save history to localStorage", error);
    return history;
  }
};

export const addOrUpdateHistoryItem = (newItem) => {
  const history = getHistory();
  const existingIndex = history.findIndex(item => item.id === newItem.id);
  
  let newHistory;
  if (existingIndex >= 0) {
     // Update existing, move to front
     newHistory = [...history];
     newHistory[existingIndex] = { ...newHistory[existingIndex], ...newItem, timestamp: Date.now() };
     const item = newHistory.splice(existingIndex, 1)[0];
     newHistory.unshift(item);
  } else {
     // Add new
     newHistory = [{ ...newItem, timestamp: Date.now() }, ...history];
  }
  return saveHistory(newHistory);
};
