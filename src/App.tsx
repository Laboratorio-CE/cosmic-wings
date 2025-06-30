import Instructions from "./components/Instructions";
import Background from './components/Background';
import OptionsToggle from './components/OptionsToggle';

function App() {

  return (
    <div className="cosmic-gradient text-cyan-50 h-screen flex flex-col items-center justify-center">
      <Background starCount={1000} />
      <OptionsToggle />
      <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-black/80 to-blue-900/90 border-2 border-cyan-400 rounded-2xl text-white font-mono shadow-2xl shadow-cyan-400/20 z-50 cursor-default">
      <Instructions />
      </div>
    </div>
  );
}

export default App
