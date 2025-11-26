import React, { useEffect, useState } from 'react';
import { getRounds, BASE_URL } from '../services/api';

const Library = () => {
    const [rounds, setRounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRound, setSelectedRound] = useState(null);

    useEffect(() => {
        const fetchRounds = async () => {
            try {
                const data = await getRounds();
                setRounds(data.reverse()); // Show newest first
            } catch (error) {
                console.error("Failed to fetch rounds", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRounds();
    }, []);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        return `${BASE_URL}${url}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    The Archives
                </h2>
                <p className="text-gray-400">
                    A collection of past battles and their masterpieces.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rounds.map((round) => (
                    <div
                        key={round.id}
                        className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group"
                        onClick={() => setSelectedRound(round)}
                    >
                        <div className="h-48 bg-gray-900 relative overflow-hidden">
                            {/* Show winner image or first image */}
                            {(() => {
                                const winner = round.artists.find(a => a.id === round.winnerId);
                                const displayImage = winner?.generatedImage || round.artists[0]?.generatedImage;
                                return displayImage ? (
                                    <img src={getImageUrl(displayImage)} alt="Round Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                                );
                            })()}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white font-bold">View Round</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-500">{new Date(round.timestamp).toLocaleDateString()}</span>
                                <span className="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded-full">
                                    {round.artists.length} Artists
                                </span>
                            </div>
                            <h3 className="font-bold text-white truncate">
                                Winner: {round.artists.find(a => a.id === round.winnerId)?.name || 'Unknown'}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Round Details */}
            {selectedRound && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedRound(null)}>
                    <div className="bg-gray-900 rounded-2xl max-w-6xl w-full p-8 space-y-8 relative" onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
                            onClick={() => setSelectedRound(null)}
                        >
                            &times;
                        </button>

                        <div className="text-center">
                            <h3 className="text-3xl font-bold text-white mb-2">Round Details</h3>
                            <p className="text-gray-400 text-sm">{new Date(selectedRound.timestamp).toLocaleString()}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {selectedRound.artists.map((artist) => (
                                <div key={artist.id} className={`bg-gray-800 rounded-xl overflow-hidden border ${artist.id === selectedRound.winnerId ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'border-gray-700'}`}>
                                    <div className="h-48 bg-gray-900 relative">
                                        <img src={getImageUrl(artist.generatedImage)} alt={artist.name} className="w-full h-full object-cover" />
                                        {artist.id === selectedRound.winnerId && (
                                            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                                                WINNER
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <img src={artist.avatar} alt={artist.name} className="w-8 h-8 rounded-full" />
                                            <h4 className="font-bold text-white text-sm truncate">{artist.name}</h4>
                                        </div>
                                        <p className="text-xs text-purple-400">{artist.artistic_style}</p>
                                        <div className="bg-gray-900 p-2 rounded text-xs text-gray-400 h-24 overflow-y-auto">
                                            {artist.prompt}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Library;

