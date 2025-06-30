import Instructions from "./components/Instructions";
import Background from './components/Background';

function App() {

  return (
    <div className="cosmic-gradient text-cyan-50 h-screen flex flex-col items-center justify-center">
      <Background starCount={5000} />
      <Instructions />
    </div>
  );
}

export default App
