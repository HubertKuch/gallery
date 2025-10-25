const MainContent = () => {
  return (
    <main className="flex-1 p-4 overflow-y-auto max-h-[calc(100%-3rem)]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">24 October 2025</h2>
          <p className="text-base-content/60">San Francisco, CA</p>
        </div>
        <button className="btn btn-ghost">Select</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="aspect-square bg-base-300 rounded-lg"></div>
        ))}
      </div>
      {import.meta.env.DEV && <p className="text-xs text-base-content/50 mt-4">Running in development mode.</p>}
    </main>
  );
};

export default MainContent;
