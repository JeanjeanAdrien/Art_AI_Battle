export const BASE_URL = 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

export const saveRound = async (roundId, artists, winnerId) => {
    try {
        const response = await fetch(`${API_URL}/save-round`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roundId, artists, winnerId }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error saving round:", error);
        return { success: false, error };
    }
};

export const getRounds = async () => {
    try {
        const response = await fetch(`${API_URL}/rounds`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching rounds:", error);
        return [];
    }
};
