import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateArtistProfile, fuseArtists } from '../services/gemini';
import { getRounds } from '../services/api';
import ArtistCard from './ArtistCard';

const CastingPhase = () => {
    const { artists, setArtists, setGameState, updateArtist } = useGameStore();
    const [loading, setLoading] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [showVeteranModal, setShowVeteranModal] = useState(false);
    const [veterans, setVeterans] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [fusionMode, setFusionMode] = useState(false);
    const [fusionSelection, setFusionSelection] = useState([]);

    useEffect(() => {
        const fetchArtists = async () => {
            if (artists.length > 0) {
                setRevealed(true);
                return;
            }

            setLoading(true);
            try {
                const promises = Array(4).fill(null).map(() => generateArtistProfile());
                const newArtists = await Promise.all(promises);
                setArtists(newArtists);
                setTimeout(() => setRevealed(true), 500);
            } catch (error) {
                console.error("Failed to generate artists", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArtists();
    }, [artists.length, setArtists]);

    const handleOpenVeteranModal = async (slotIndex) => {
        setSelectedSlot(slotIndex);
        setShowVeteranModal(true);
        if (veterans.length === 0) {
            const rounds = await getRounds();
            // Extract all unique artists from rounds
            const allArtists = rounds.flatMap(r => r.artists);
            // Remove duplicates by name (simple check)
            const uniqueVeterans = Array.from(new Map(allArtists.map(a => [a.name, a])).values());
            setVeterans(uniqueVeterans);
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

            {loading ? (
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
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-5xl w-full p-8 space-y-6 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-white">Select a Veteran Artist</h3>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => { setFusionMode(!fusionMode); setFusionSelection([]); }}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${fusionMode ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                >
                                    {fusionMode ? 'Fusion Mode Active' : 'Enable Fusion'}
                                </button>
                                <button onClick={() => setShowVeteranModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                            </div>
                        </div>

                        {fusionMode && (
                            <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30 flex justify-between items-center">
                                <p className="text-purple-200 text-sm">Select 2 artists to fuse into a new entity.</p>
                                <button
                                    disabled={fusionSelection.length !== 2}
                                    onClick={handleFuse}
                                    className={`px-6 py-2 rounded-full font-bold transition-all ${fusionSelection.length === 2 ? 'bg-purple-500 text-white hover:bg-purple-400' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                >
                                    Fuse Selected ({fusionSelection.length}/2)
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto p-2">
                            {veterans.map((veteran) => (
                                <div
                                    key={veteran.id}
                                    onClick={() => handleSelectVeteran(veteran)}
                                    className={`cursor-pointer relative group rounded-xl overflow-hidden border-2 transition-all ${fusionSelection.find(v => v.id === veteran.id)
                                            ? 'border-purple-500 ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900'
                                            : 'border-gray-700 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="h-32 bg-gray-800">
                                        <img src={veteran.avatar} alt={veteran.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-3 bg-gray-800">
                                        <h4 className="font-bold text-white text-sm truncate">{veteran.name}</h4>
                                        <p className="text-xs text-gray-400 truncate">{veteran.artistic_style}</p>
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
