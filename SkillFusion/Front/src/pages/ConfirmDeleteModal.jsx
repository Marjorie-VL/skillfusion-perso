import React from "react";

export default function ConfirmDeleteModal({ show, onCancel, onConfirm, lessonTitle }) {
  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Êtes-vous sûr ?</h3>
        <p>Voulez-vous vraiment supprimer {lessonTitle ? `"${lessonTitle}"` : "cet élément"} ?</p>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel}>Annuler</button>
          <button className="modal-confirm" onClick={onConfirm}>Supprimer</button>
        </div>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.4); z-index: 9999; display: flex; align-items: center; justify-content: center;
        }
        .modal-content {
          background: #fff; padding: 2rem; border-radius: 8px; text-align: center; min-width: 300px;
        }
        .modal-actions { margin-top: 1.5rem; }
        .modal-cancel, .modal-confirm {
          margin: 0 10px; padding: 0.5rem 1.2rem; border-radius: 4px; border: none; cursor: pointer;
        }
        .modal-cancel { background: #ccc; }
        .modal-confirm { background: #e74c3c; color: #fff; }
      `}</style>
    </div>
  );
}