import { create } from 'zustand';

export const useGameStore = create((set) => ({
    gameState: 'casting', // casting, creation, vernissage, library
    artists: [],
    roundId: null,

    setGameState: (state) => set({ gameState: state }),
    setArtists: (artists) => set({ artists }),
    setRoundId: (id) => set({ roundId: id }),

    updateArtist: (id, updates) => set((state) => ({
        artists: state.artists.map((artist) =>
            artist.id === id ? { ...artist, ...updates } : artist
        )
    })),

    resetGame: () => set({
        gameState: 'casting',
        artists: [],
        roundId: null
    })
}));
