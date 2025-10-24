function Topbar() {
  return (
    <div className="p-4 flex justify-between items-center bg-base-100/80 backdrop-blur-sm sticky top-0 z-10 h-16">
      <h1 className="text-xl font-bold">Photos</h1>
      <div className="flex items-center gap-4">
        <button className="btn btn-primary">Import</button>
      </div>
    </div>
  );
}

export default Topbar;
