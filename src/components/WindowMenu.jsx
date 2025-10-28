import { getCurrentWindow,  } from '@tauri-apps/api/window';
import useViewStore from '../stores/viewStore.js';
import { safe } from '../utils.js';
import { useState } from 'react';
import {invoke} from "@tauri-apps/api/core";

function WindowMenu() {
  const { openSettings } = useViewStore();
  const [cameras, setCameras] = useState([]);

  const handleGetCameras = async () => {
    try {
      const cameraList = await invoke('list_cameras');
      setCameras(cameraList);
    } catch (error) {
      console.error('Failed to list cameras:', error);
    }
  };

  const menuConfig = [
    {
      name: 'File',
      children: [
        {
          name: 'Settings',
          action: () => {
            openSettings();
          },
        },
        {
          name: 'Exit',
          action: (window) => {
            window.close().then();
          },
        },
      ],
    },
    {
      name: 'Import',
      onOpen: handleGetCameras,
      children: [
        ...cameras.map((camera) => ({
          name: camera.name,
          action: () => {
            // const webview = new WebviewWindow(`camera_${camera.port.replace(/\W/g, '_')}` , {
            //   url: `/camera?port=${encodeURIComponent(camera.port)}&name=${encodeURIComponent(camera.name)}`,
            //   title: `Camera: ${camera.name}`,
            //   width: 800,
            //   height: 600,
            // });
            // webview.once('tauri://created', function () {
            //   // webview window successfully created
            // });
            // webview.once('tauri://error', function (e) {
            //   // an error occurred during webview window creation
            // });
          },
        })),
        ...(cameras.length > 0 ? [{ isDivider: true }] : []),
        {
          name: 'Import from folder',
          action: () => console.log('Import from folder'),
        },
      ],
    },
    {
      name: 'Export',
    },
  ];
  return (
    <div className="flex items-center gap-2">
      {menuConfig.map((menu) => (
        <div key={menu.name} className="dropdown" onMouseEnter={menu.onOpen}>
          <div tabIndex={0} role="button" className="btn btn-ghost">{menu.name}</div>
          {menu.children && (
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              {menu.children.map((child, index) => (
                child.isDivider ? <div key={`divider-${index}`} className="divider m-0"></div> :
                <li key={child.name}>
                  <a onClick={() => child.action(safe(getCurrentWindow))}>{child.name}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default WindowMenu;
