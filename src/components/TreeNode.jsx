import { useState } from 'react';
import { FolderIcon, FolderOpenIcon } from '@proicons/react';
import useAlbumStore from '../stores/albumStore';

function TreeNode({ node }) {
  const [isOpen, setIsOpen] = useState(false);
  const { setCurrentAlbum } = useAlbumStore();
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setCurrentAlbum(node);
  };

  return (
    <div>
      <div onClick={handleToggle} className="flex items-center cursor-pointer">
        {hasChildren && (isOpen ? <FolderOpenIcon className="inline" /> : <FolderIcon className="inline" />)}
        <span className="ml-2">{node.name}</span>
      </div>
      {isOpen && hasChildren && (
        <div className="ml-4">
          {node.children.map((child) => (
            <TreeNode key={child.name} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TreeNode;
