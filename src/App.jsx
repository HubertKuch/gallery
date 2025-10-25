import { getCurrentWebview } from '@tauri-apps/api/webview';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Topbar from './components/Topbar';
import WindowMenu from './components/WindowMenu.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import MessageModal from './components/MessageModal.jsx';

function App() {
  return (
    <>
      <WindowMenu />
      <Layout>
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Topbar />
          <MainContent />
        </div>
      </Layout>
      <SettingsModal />
      <MessageModal />
    </>
  );
}

export default App;
