function Layout({ children }) {
  return (
    <div className="flex bg-base-100 font-sans h-screen max-h-[calc(100%-0rem)]">
      {children}
    </div>
  );
}

export default Layout;
