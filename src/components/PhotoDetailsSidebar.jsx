import usePhotoStore from '../stores/photoStore';

function PhotoDetailsSidebar() {
  const { selectedPhoto, closeDetailsSidebar } = usePhotoStore();

  if (!selectedPhoto) {
    return null;
  }

  return (
    <aside className="fixed top-0 right-0 h-full w-96 bg-base-200 p-4 border-l border-base-300/50 overflow-y-auto z-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Photo Details</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={closeDetailsSidebar}>
          Close
        </button>
      </div>
      <div className="overflow-x-hidden">
        <img src={selectedPhoto.url} alt="" className="w-full h-auto rounded-lg mb-4" />
        <ul>
          {Object.entries(selectedPhoto.metadata).map(([key, value]) => (
            <li key={key} title={String(value)} className="text-wrap max-w-full">
              <strong>
                {key}
                :
              </strong>
              {' '}
              {String(value)}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default PhotoDetailsSidebar;
