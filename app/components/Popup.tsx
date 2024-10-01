// components/Popup.tsx
import React from "react";

interface PopupProps {
  onConfirm: () => void; // Function to call when the user confirms
  onCancel: () => void; // Function to call when the user cancels
  isDeleting: boolean; // Whether the account is being deleted
}

const Popup: React.FC<PopupProps> = ({ onConfirm, onCancel, isDeleting }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white mx-6 p-6 rounded shadow-lg text-center">
        {isDeleting ? (
          <h2 className="text-lg font-semibold">
            Deleting your account... Please wait.
          </h2>
        ) : (
          <>
            <h2 className="text-lg font-semibold">
              Are you sure you want to proceed? This action cannot be undone.
            </h2>
            <div className="mt-4">
              <button
                className="bg-red-500 hover:bg-red-800 text-white py-2 px-4 rounded mr-2"
                onClick={onConfirm}
              >
                Yes
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded"
                onClick={onCancel}
              >
                No
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Popup;