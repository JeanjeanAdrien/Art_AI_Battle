import React from 'react';

const ArtistCard = ({ artist, reveal = false, className = '' }) => {
    if (!artist) return null;

    return (
        <div className={`relative group bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-purple-500 transition-all duration-300 ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />

            <div className="h-64 w-full bg-gray-700 relative">
                {artist.avatar && (
                    <img
                        src={artist.avatar}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-bold text-white mb-1">{artist.name}</h3>
                <p className="text-purple-400 text-sm font-medium mb-2">{artist.artistic_style}</p>

                <div className={`space-y-2 overflow-hidden transition-all duration-500 ${reveal ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100'}`}>
                    <p className="text-gray-300 text-xs italic">"{artist.personality_tone}"</p>
                    <div className="text-xs text-gray-400">
                        <span className="text-gray-500 uppercase tracking-wider text-[10px]">Obsession:</span>
                        <br />
                        {artist.obsession}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtistCard;
