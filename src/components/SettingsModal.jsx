import { useState } from 'react';
import useViewStore from '../stores/viewStore.js';
import Appearance from './settings/Appearance.jsx';
import Albums from './settings/Albums.jsx';

function SettingsModal() {
  const { settingsOpen, closeSettings } = useViewStore();
  const [activeTab, setActiveTab] = useState('appearance');

  const renderContent = () => {
    switch (activeTab) {
      case 'appearance':
        return <Appearance />;
      case 'albums':
        return <Albums />;
      default:
        return null;
    }
  };

  return (
    settingsOpen ? (
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
        <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-4xl h-full max-h-[80vh] flex">
          <div className="w-64 bg-base-200/30 p-4 border-r border-base-300/50">
            <h2 className="text-lg font-bold mb-4">Settings</h2>
            <ul>
              <li className="mb-2">
                <a
                  href="#"
                  className={`btn btn-ghost btn-sm justify-start ${activeTab === 'appearance' ? 'btn-active' : ''}`}
                  onClick={() => setActiveTab('appearance')}
                >
                  Appearance
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className={`btn btn-ghost btn-sm justify-start ${activeTab === 'albums' ? 'btn-active' : ''}`}
                  onClick={() => setActiveTab('albums')}
                >
                  Albums
                </a>
              </li>
            </ul>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {renderContent()}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button type="button" className="btn" onClick={closeSettings}>Done</button>
            </div>
          </div>
        </div>
      </div>
    ) : null);
}

export default SettingsModal;
