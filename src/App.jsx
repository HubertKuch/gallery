function App() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-primary">Photo Management App</h1>
      <p className="text-secondary my-4">Your photos at a glance.</p>
      <button className="btn btn-primary">Import Photos</button>
      {import.meta.env.DEV && <p className="text-xs text-base-content/50 mt-4">Running in development mode.</p>}
    </main>
  );
}

export default App;