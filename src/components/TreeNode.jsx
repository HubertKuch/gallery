import { useState } from 'react';

function TreeNode({ node }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="ml-4">
      <div className="flex items-center">
        {node.children && (
          <button onClick={handleToggle} className="btn btn-xs btn-ghost mr-1">
            {isOpen ? '[-]' : '[+]'}
          </button>
        )}
        <span>{node.name}</span>
      </div>
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
