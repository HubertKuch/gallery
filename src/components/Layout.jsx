const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-base-100 font-sans">
      {children}
    </div>
  );
};

export default Layout;