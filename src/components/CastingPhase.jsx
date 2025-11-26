import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateArtistProfile, fuseArtists } from '../services/gemini';
import { getRounds } from '../services/api';
import ArtistCard from './ArtistCard';

const CastingPhase = () => {
    const { artists, setArtists, setGameState, updateArtist } = useGameStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArtists = async () => {
            if (artists.length > 0) {
                setRevealed(true);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const promises = Array(4).fill(null).map(() => generateArtistProfile());
                const newArtists = await Promise.all(promises);
                setArtists(newArtists);
                setTimeout(() => setRevealed(true), 500);
            } catch (error) {
                console.error("Failed to generate artists", error);
                setError("Failed to summon artists. The creative spirits are restless. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchArtists();
    }, [artists.length, setArtists]);

    const [revealed, setRevealed] = useState(false);
    const [showVeteranModal, setShowVeteranModal] = useState(false);
    const [veterans, setVeterans] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [fusionMode, setFusionMode] = useState(false);
    const [fusionSelection, setFusionSelection] = useState([]);

    const [showWinnersOnly, setShowWinnersOnly] = useState(true);

    const handleOpenVeteranModal = async (slotIndex) => {
        setSelectedSlot(slotIndex);
        setShowVeteranModal(true);
        if (veterans.length === 0) {
            const rounds = await getRounds();
            // Extract winners
            const winners = rounds.map(r => r.artists.find(a => a.id === r.winnerId)).filter(Boolean);
            // Extract all unique artists
            const allArtists = rounds.flatMap(r => r.artists);
            const uniqueArtists = Array.from(new Map(allArtists.map(a => [a.name, a])).values());

            // Mark winners in the unique list
            const veteransWithWinnerStatus = uniqueArtists.map(artist => ({
                ...artist,
                isWinner: winners.some(w => w.name === artist.name)
            }));

            setVeterans(veteransWithWinnerStatus);
        }
    };

    const handleSelectVeteran = (veteran) => {
        if (fusionMode) {
            if (fusionSelection.find(v => v.id === veteran.id)) {
                setFusionSelection(prev => prev.filter(v => v.id !== veteran.id));
            } else if (fusionSelection.length < 2) {
                setFusionSelection(prev => [...prev, veteran]);
            }
        } else {
            // Replace artist at selected slot
            const newArtists = [...artists];
            newArtists[selectedSlot] = { ...veteran, id: crypto.randomUUID() }; // New ID for new round
            setArtists(newArtists);
            setShowVeteranModal(false);
        }
    };

    const handleFuse = async () => {
        if (fusionSelection.length !== 2) return;

        setLoading(true);
        setShowVeteranModal(false);
        try {
            const fusedArtist = await fuseArtists(fusionSelection[0], fusionSelection[1]);
            const newArtists = [...artists];
            newArtists[selectedSlot] = fusedArtist;
            setArtists(newArtists);
            setFusionMode(false);
            setFusionSelection([]);
        } catch (error) {
            console.error("Fusion failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 relative">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    The Casting
                </h2>
                <p className="text-gray-400 max-w-lg mx-auto">
                    Four unique AI artists are being summoned. You may replace them with Veterans or fuse souls.
                </p>
            </div>

            {error ? (
                <div className="text-center space-y-4">
                    <p className="text-red-400">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-600/20 border border-red-500/50 text-red-200 rounded-full hover:bg-red-600/40 transition-colors"
                    >
                        Retry Summoning
                    </button>
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                    <p className="text-purple-400 animate-pulse">Summoning creative spirits...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    {artists.map((artist, index) => (
                        <div
                            key={artist.id}
                            className={`relative transition-all duration-700 transform ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                            style={{ transitionDelay: `${index * 200}ms` }}
                        >
                            <ArtistCard artist={artist} reveal={revealed} />
                            <button
                                onClick={() => handleOpenVeteranModal(index)}
                                className="absolute -top-3 -right-3 bg-gray-700 hover:bg-purple-600 text-white rounded-full p-2 shadow-lg transition-colors z-30"
                                title="Replace with Veteran"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {revealed && !loading && (
                <button
                    onClick={() => setGameState('creation')}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 animate-pulse"
                >
                    Start Creation
                </button>
            )}

            {/* Veteran Selection Modal */}
            {showVeteranModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
                    <div className="bg-gray-900/90 border border-gray-700 rounded-3xl max-w-6xl w-full p-8 space-y-8 max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
                        {/* Background Gradient */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

                        <div className="flex justify-between items-center z-10">
                            <div>
                                <h3 className="text-3xl font-bold text-white tracking-tight">Select a Veteran Artist</h3>
                                <p className="text-gray-400 text-sm mt-1">Choose from the archives to join the battle.</p>
                            </div>

                            <div className="flex items-center space-x-6">
                                <div className="flex bg-gray-800 rounded-full p-1 border border-gray-700">
                                    <button
                                        onClick={() => setShowWinnersOnly(false)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${!showWinnersOnly ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setShowWinnersOnly(true)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${showWinnersOnly ? 'bg-yellow-600/80 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Winners 🏆
                                    </button>
                                </div>

                                <div className="h-8 w-px bg-gray-700 mx-2" />

                                <div className="flex bg-gray-800 rounded-full p-1 border border-gray-700">
                                    <button
                                        onClick={() => { setFusionMode(false); setFusionSelection([]); }}
                                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${!fusionMode ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Single
                                    </button>
                                    <button
                                        onClick={() => { setFusionMode(true); setFusionSelection([]); }}
                                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${fusionMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Fusion
                                    </button>
                                </div>
                                <button onClick={() => setShowVeteranModal(false)} className="text-gray-400 hover:text-white text-3xl transition-colors">&times;</button>
                            </div>
                        </div>

                        {fusionMode && (
                            <div className="bg-purple-900/20 p-6 rounded-2xl border border-purple-500/30 flex justify-between items-center backdrop-blur-md">
                                <div className="flex items-center space-x-4">
                                    <div className="flex -space-x-4">
                                        {[0, 1].map(i => (
                                            <div key={i} className={`w-12 h-12 rounded-full border-2 border-gray-900 flex items-center justify-center ${fusionSelection[i] ? 'bg-transparent' : 'bg-gray-800 border-dashed border-gray-600'}`}>
                                                {fusionSelection[i] ? (
                                                    <img src={fusionSelection[i].avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <span className="text-gray-600 text-xs">?</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-purple-200 text-sm font-medium">
                                        {fusionSelection.length === 0 ? "Select 2 artists to fuse." :
                                            fusionSelection.length === 1 ? "Select 1 more artist." :
                                                "Ready for Fusion!"}
                                    </p>
                                </div>
                                <button
                                    disabled={fusionSelection.length !== 2}
                                    onClick={handleFuse}
                                    className={`px-8 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105 ${fusionSelection.length === 2 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                                >
                                    Fuse Souls
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto p-2 custom-scrollbar">
                            {veterans
                                .filter(v => !showWinnersOnly || v.isWinner)
                                .map((veteran) => (
                                    <div
                                        key={veteran.id}
                                        onClick={() => handleSelectVeteran(veteran)}
                                        className={`cursor-pointer relative group rounded-xl overflow-hidden border transition-all duration-300 ${fusionSelection.find(v => v.id === veteran.id)
                                            ? 'border-purple-500 ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900 scale-95'
                                            : 'border-gray-700 hover:border-gray-500 hover:-translate-y-1 hover:shadow-xl'
                                            }`}
                                    >
                                        <div className="h-40 bg-gray-800 relative">
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10" />
                                            <img src={veteran.avatar} alt={veteran.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

                                            {/* Winner Badge */}
                                            {veteran.isWinner && (
                                                <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-20 flex items-center gap-1">
                                                    <span>🏆</span> Winner
                                                </div>
                                            )}

                                            {fusionSelection.find(v => v.id === veteran.id) && (
                                                <div className="absolute inset-0 bg-purple-500/40 z-20 flex items-center justify-center">
                                                    <div className="bg-white text-purple-600 rounded-full p-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 bg-gray-800 relative z-20">
                                            <h4 className="font-bold text-white text-base truncate group-hover:text-purple-400 transition-colors" title={veteran.name}>{veteran.name}</h4>
                                            <p className="text-xs text-gray-400 truncate mt-1">{veteran.artistic_style}</p>
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

export default CastingPhase;
