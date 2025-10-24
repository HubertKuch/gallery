import Layout from "./components/Layout";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import Topbar from "./components/Topbar";
import WindowMenu from "./components/WindowMenu.jsx";

function App() {
    return (<>
            <WindowMenu/>
            <Layout>
                <Sidebar/>
                <div className="flex flex-col flex-1">
                    <Topbar/>
                    <MainContent/>
                </div>
            </Layout></>);
}

export default App;