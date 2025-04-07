export const ConfirmModal = ({ id, message, onConfirm, onCancel }) => {
    return (
      <dialog id={id} className="modal w-auto">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{message}</h3>
          <div className="modal-action">
            <button className="btn" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn btn-error" onClick={onConfirm}>
              Confirm
            </button>
          </div>
        </div>
      </dialog>
    );
  };