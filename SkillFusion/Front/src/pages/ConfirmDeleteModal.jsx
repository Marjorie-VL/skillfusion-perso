import React from "react";

export default function ConfirmDeleteModal({ 
  show, 
  onCancel, 
  onConfirm, 
  title = "Êtes-vous sûr ?", 
  message = "Voulez-vous vraiment supprimer cet élément ?",
  confirmText = "Supprimer",
  cancelText = "Annuler"
}) {
  if (!show) return null;

  // Fermer la modale si on clique sur le fond
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  // Fermer avec Échap
  React.useEffect(() => {
    if (!show) return;
    
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [show, onCancel]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full transform transition-all animate-in fade-in zoom-in">
        <div className="text-center">
          <div className="mb-4">
            <svg 
              className="mx-auto h-12 w-12 text-red-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h3 className="font-['Lobster'] text-2xl md:text-3xl mb-4 text-gray-900">{title}</h3>
          <p className="mb-6 text-gray-700 text-lg">{message}</p>
          <div className="flex justify-center gap-4">
            <button 
              className="bg-gray-400 text-white py-2 px-6 rounded-lg cursor-pointer hover:bg-gray-500 transition-colors font-medium" 
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button 
              className="bg-red-600 text-white py-2 px-6 rounded-lg cursor-pointer hover:bg-red-700 transition-colors font-medium" 
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}