import Layout from "./components/Layout";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import Topbar from "./components/Topbar";

function App() {
  return (
    <Layout>
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <MainContent />
      </div>
    </Layout>
  );
}

export default App;