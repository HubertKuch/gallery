import { useState } from 'react';
import { FolderIcon, FolderOpenIcon } from '@proicons/react';

function TreeNode({ node }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="ml-4 w-full text-left items-start content-start">
      <button onClick={handleToggle} type="button" className="block pointer btn btn-sm btn-ghost mr-1 text-left w-full">
        {node.children && (isOpen ? <FolderOpenIcon className="inline" /> : <FolderIcon className="inline" />)}
        <span>{node.name}</span>
      </button>
      {isOpen && node.children && (
        <ul>
          {node.children.map((child) => (
            <li key={child.name}>
              <TreeNode node={child} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TreeNode;
