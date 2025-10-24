import {getCurrentWindow} from '@tauri-apps/api/window';
import useViewStore from "../stores/viewStore.js";
import {safe} from "../utils.js";

const WindowMenu = () => {
    const {openSettings} = useViewStore();

    const menuConfig = [
        {
            name: "File",
            children: [
                {
                    name: "Settings",
                    action: (window) => {
                        openSettings();
                    }
                },
                {
                    name: "Exit",
                    action: (window) => {
                        window.close().then();
                    }
                }
            ]
        },
        {
            name: "Import"
        },
        {
            name: "Export"
        }
    ];
    return (
        <div className="flex items-center gap-2">
            {menuConfig.map((menu) => (
                <div key={menu.name} className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost">{menu.name}</div>
                    {menu.children && (
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                            {menu.children.map((child) => (
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
};

export default WindowMenu;