function App() {

  return (
    <div className="bg-slate-800 text-cyan-50 h-screen flex flex-col items-center justify-center">
      <img
        src="/assets/images/enemy/boss-C-frame-1.png"
        alt=""
        className="animate-pulse"
        style={{ animation: "randomMove 2s infinite ease-in-out" }}
      />
      <div className="flex gap-10">
        <div>
          <img
            src="/assets/images/enemy/enemy-A-frame-1.png"
            alt=""
            className="animate-pulse"
            style={{ animation: "randomMove 2s infinite ease-in-out" }}
          />
        </div>
        <h1 className="font-bold text-4xl">Olá mundo!</h1>
        <img
          src="/assets/images/player/player-frame-1.png"
          alt=""
          className="animate-pulse"
          style={{ animation: "randomMove 2s infinite ease-in-out" }}
        />
      </div>
      <div>
        <img
          src="/assets/images/enemy/boss-B-frame-1.png"
          alt=""
          className="animate-pulse"
          style={{ animation: "randomMove 2s infinite ease-in-out" }}
        />
      </div>
    </div>
  );
}

export default App
