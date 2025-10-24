import { Resizable } from 'react-resizable';
import { useState } from 'react';
import TreeNode from './TreeNode';

const treeData = {
  name: 'Photos',
  children: [
    {
      name: '2023',
      children: [
        { name: 'Holiday' },
        { name: 'Work' },
      ],
    },
    {
      name: '2024',
      children: [
        { name: 'Vacation' },
        { name: 'Projects', children: [{ name: 'Project 1' }] },
      ],
    },
  ],
};

const Sidebar = () => {
  const [width, setWidth] = useState(256);

  return (
    <Resizable
      width={width}
      height={Infinity}
      onResize={(e, { size }) => setWidth(size.width)}
      axis="x"
      minConstraints={[200, Infinity]}
      maxConstraints={[500, Infinity]}
    >
      <aside
        className="bg-base-200/30 p-4 border-r border-base-300/50 h-full"
        style={{ width: `${width}px` }}
      >
        <h2 className="text-lg font-bold px-2 mb-4">Albums</h2>
        <TreeNode node={treeData} />
      </aside>
    </Resizable>
  );
};

export default Sidebar;