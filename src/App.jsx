import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import CastingPhase from './components/CastingPhase';
import CreationPhase from './components/CreationPhase';
import VernissagePhase from './components/VernissagePhase';
import Library from './components/Library';

function App() {
  const { gameState, setGameState } = useGameStore();

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse delay-2000" />
      </div>

      <header className="p-6 flex justify-between items-center border-b border-white/10 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50 relative">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent cursor-pointer" onClick={() => setGameState('casting')}>
          Art Battle IA
        </h1>
        <nav className="space-x-4">
          <button
            onClick={() => useGameStore.getState().resetGame()}
            className={`px-4 py-2 rounded-full transition-all ${gameState === 'casting' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            New Battle
          </button>
          <button
            onClick={() => setGameState('library')}
            className={`px-4 py-2 rounded-full transition-all ${gameState === 'library' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Library
          </button>
        </nav>
      </header>

      <main className="container mx-auto p-6">
        {gameState === 'casting' && <CastingPhase />}
        {gameState === 'creation' && <CreationPhase />}
        {gameState === 'vernissage' && <VernissagePhase />}
        {gameState === 'library' && <Library />}
      </main>
    </div>
  );
}

export default App;
