import React from 'react';

const ContextMenu = ({ menuItems, position, title }) => {
    if (!position) {
        return null;
    }

    return (
        <ul
            className="menu bg-base-100 w-56 rounded-box absolute z-20"
            style={{ top: position.y, left: position.x }}
        >
            {title && <li className="menu-title p-2 text-xs">{title}</li>}
            {menuItems.map((menuItem) => (
                <li key={menuItem.name} onClick={menuItem.action}>
                    <a>{menuItem.name}</a>
                </li>
            ))}
        </ul>
    );
};

export default ContextMenu;