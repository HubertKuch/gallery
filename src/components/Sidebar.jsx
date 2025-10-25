import { useState } from 'react';
import { SettingsIcon } from '@proicons/react';
import TreeNode from './TreeNode';
import useViewStore from '../stores/viewStore.js';
import useAlbumStore from '../stores/albumStore.js';

function Sidebar() {
  const [width] = useState(256);
  const { openSettings } = useViewStore();
  const { tree } = useAlbumStore();

  return (
    <aside
      className="bg-base-200/30 p-4 border-r border-base-300/50 max-h-[calc(100%-3rem)] flex flex-col"
      style={{ width: `${width}px` }}
    >
      <h2 className="text-lg font-bold px-2 mb-4">Albums</h2>
      <div className="flex-1 max-h-[calc(100%-3rem)] overflow-y-auto">
        {tree && <TreeNode node={tree} />}
      </div>
      <div>
        <button className="btn btn-ghost btn-sm" onClick={openSettings}>
          <SettingsIcon />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
