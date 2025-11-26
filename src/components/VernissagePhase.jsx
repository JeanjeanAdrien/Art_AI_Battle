import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateImage } from '../services/gemini';
import { saveRound } from '../services/api';
import ArtistCard from './ArtistCard';

const VernissagePhase = () => {
    const { artists, updateArtist, setGameState, roundId, setRoundId } = useGameStore();
    const [loading, setLoading] = useState(true);
    const [selectedArtistId, setSelectedArtistId] = useState(null);
    const [voted, setVoted] = useState(false);

    useEffect(() => {
        const createImages = async () => {
            // Check if images already exist (to prevent regeneration on re-render)
            if (artists.every(a => a.generatedImage)) {
                setLoading(false);
                return;
            }

            const promises = artists.map(async (artist) => {
                if (artist.generatedImage) return;
                try {
                    const imageUrl = await generateImage(artist.prompt);
                    updateArtist(artist.id, { generatedImage: imageUrl });
                } catch (error) {
                    console.error(`Error generating image for ${artist.name}:`, error);
                }
            });

            await Promise.all(promises);
            setLoading(false);
        };

        createImages();
    }, [artists, updateArtist]);

    const handleVote = async (artistId) => {
        if (voted) return;
        setSelectedArtistId(artistId);
        setVoted(true);

        const newRoundId = crypto.randomUUID();
        setRoundId(newRoundId);

        // Save round to backend
        await saveRound(newRoundId, artists, artistId);
    };

    const handleNextRound = () => {
        useGameStore.getState().resetGame();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                <p className="text-xl text-gray-400 animate-pulse">Manifesting visions...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 pb-12">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    Le Vernissage
                </h2>
                <p className="text-gray-400">
                    {voted ? "The winner has been chosen." : "Select the masterpiece that speaks to you."}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
                {artists.map((artist) => (
                    <div
                        key={artist.id}
                        className={`relative group cursor-pointer transition-all duration-500 ${voted && selectedArtistId !== artist.id ? 'opacity-50 grayscale scale-95' : 'hover:scale-[1.02]'}`}
                        onClick={() => handleVote(artist.id)}
                    >
                        <div className="aspect-square bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-transparent hover:border-purple-500 relative">
                            {artist.generatedImage ? (
                                <img src={artist.generatedImage} alt={artist.prompt} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-600">
                                    Image Failed
                                </div>
                            )}

                            {/* Overlay for voting */}
                            {!voted && (
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="px-6 py-2 bg-white text-black font-bold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                        Vote for this Art
                                    </span>
                                </div>
                            )}

                            {/* Winner Badge */}
                            {voted && selectedArtistId === artist.id && (
                                <div className="absolute top-4 right-4 bg-yellow-500 text-black font-bold px-4 py-1 rounded-full shadow-lg animate-bounce">
                                    WINNER
                                </div>
                            )}
                        </div>

                        {/* Details Reveal */}
                        {voted && (
                            <div className="mt-4 bg-gray-800 p-6 rounded-xl border border-gray-700 animate-fadeIn">
                                <div className="flex items-center space-x-4 mb-4">
                                    <img src={artist.avatar} alt={artist.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{artist.name}</h3>
                                        <p className="text-purple-400 text-sm">{artist.artistic_style}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-gray-300 text-sm italic">"{artist.prompt}"</p>
                                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700">
                                        Obsession: {artist.obsession}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {voted && (
                <div className="flex space-x-4 animate-fadeIn">
                    <button
                        onClick={handleNextRound}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                        Next Round
                    </button>
                    <button
                        onClick={() => setGameState('library')}
                        className="px-8 py-3 bg-gray-700 rounded-full text-white font-bold text-lg hover:bg-gray-600 transition-all duration-300"
                    >
                        View Library
                    </button>
                </div>
            )}
        </div>
    );
};

export default VernissagePhase;
