import { useState } from 'react';
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
      <div className="flex-1">
        {tree && <TreeNode node={tree} />}
      </div>
      <div>
        <button className="btn btn-ghost btn-sm" onClick={openSettings}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
