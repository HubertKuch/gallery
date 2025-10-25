import useModal from '../stores/modalStore';

function MessageModal() {
  const {
    isOpen, title, message, closeModal,
  } = useModal();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="p-4">
          <p>{message}</p>
        </div>
        <div className="p-4 border-t flex justify-end">
          <button type="button" className="btn" onClick={closeModal}>
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageModal;
