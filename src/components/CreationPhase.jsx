import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateImagePrompt } from '../services/gemini';
import ArtistCard from './ArtistCard';

const CreationPhase = () => {
    const { artists, updateArtist, setGameState } = useGameStore();
    const [progress, setProgress] = useState({});

    useEffect(() => {
        const createPrompts = async () => {
            const promises = artists.map(async (artist) => {
                if (artist.prompt) {
                    setProgress(prev => ({ ...prev, [artist.id]: 100 }));
                    return;
                }

                try {
                    // Simulate progress
                    const interval = setInterval(() => {
                        setProgress(prev => {
                            const current = prev[artist.id] || 0;
                            return { ...prev, [artist.id]: Math.min(current + Math.random() * 10, 90) };
                        });
                    }, 500);

                    const prompt = await generateImagePrompt(artist);

                    clearInterval(interval);
                    setProgress(prev => ({ ...prev, [artist.id]: 100 }));
                    updateArtist(artist.id, { prompt });
                } catch (error) {
                    console.error(`Error creating prompt for ${artist.name}:`, error);
                }
            });

            await Promise.all(promises);
            setTimeout(() => setGameState('vernissage'), 1500);
        };

        createPrompts();
    }, [artists, updateArtist, setGameState]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">
                    The Creation
                </h2>
                <p className="text-gray-400">
                    The artists are dreaming...
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                {artists.map((artist) => (
                    <div key={artist.id} className="relative">
                        <ArtistCard artist={artist} className="opacity-50 blur-sm scale-95" />

                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                            <div className="w-full max-w-[80%] bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                                    style={{ width: `${progress[artist.id] || 0}%` }}
                                />
                            </div>
                            <p className="text-white font-mono text-sm animate-bounce">
                                {progress[artist.id] === 100 ? 'Masterpiece Conceived' : 'Dreaming...'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CreationPhase;
