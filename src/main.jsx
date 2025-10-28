import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import useSettingsStore from './stores/settingsStore';
import CameraFilesWindow from './components/CameraFilesWindow';

// Initialize settings store
useSettingsStore.getState().init();

const root = ReactDOM.createRoot(document.getElementById('root'));

let componentToRender = <App />;
if (window.location.pathname === '/camera') {
  componentToRender = <CameraFilesWindow />;
}

root.render(
  <React.StrictMode>
    {componentToRender}
  </React.StrictMode>,
);
