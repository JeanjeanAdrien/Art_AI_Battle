import React from 'react';

const ArtistCard = ({ artist, reveal = false, className = '' }) => {
    if (!artist) return null;

    return (
        <div className={`relative group rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:-translate-y-2 h-[500px] w-full ${className}`}>
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
                {artist.avatar && (
                    <img
                        src={artist.avatar}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    />
                )}
            </div>

            {/* Glass Content Area */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-6 bg-gradient-to-t from-gray-900/90 to-transparent pt-20">
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4 transform transition-all duration-300 group-hover:bg-white/10">
                    <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">{artist.name}</h3>
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-sm font-medium mb-3 uppercase tracking-wider">
                        {artist.artistic_style}
                    </p>

                    <div className={`space-y-3 overflow-hidden transition-all duration-500 ${reveal ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0 group-hover:max-h-60 group-hover:opacity-100'}`}>
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-500/50 to-transparent" />

                        <p className="text-gray-300 text-sm italic leading-relaxed">"{artist.personality_tone}"</p>

                        <div className="bg-black/20 rounded-lg p-2">
                            <span className="text-gray-500 uppercase tracking-widest text-[10px] block mb-1">Obsession</span>
                            <span className="text-gray-200 text-xs">{artist.obsession}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Border Highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    );
};

export default ArtistCard;
