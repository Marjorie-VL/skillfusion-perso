import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../services/api.jsx";
import { userService } from "../../services/userService.js";
import ConfirmDeleteModal from "../../pages/ConfirmDeleteModal.jsx";

/**
 * Composant réutilisable pour la section de suppression de compte
 * Gère les deux modales de confirmation
 */
export default function DeleteAccountSection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDeleteAccountConfirmModal, setShowDeleteAccountConfirmModal] = useState(false);

  const deleteAccount = () => {
    setShowDeleteAccountModal(true);
  };

  const confirmDeleteAccount = () => {
    setShowDeleteAccountModal(false);
    setShowDeleteAccountConfirmModal(true);
  };

  const finalConfirmDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await userService.deleteUser(user.id);
      toast.success("Compte supprimé avec succès");
      logout();
      navigate("/");
    } catch (error) {
      console.error("Erreur suppression compte:", error);
      toast.error("Erreur lors de la suppression du compte");
      setShowDeleteAccountConfirmModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <section className="mt-8 text-center border-t border-skill-secondary/30 pt-6">
        <button
          onClick={deleteAccount}
          disabled={deleteLoading}
          className="bg-skill-danger text-white border-none py-2 px-4 rounded cursor-pointer text-sm font-display hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {deleteLoading ? "Suppression en cours..." : "Supprimer mon compte"}
        </button>
      </section>

      {/* Modales de confirmation suppression de compte */}
      <ConfirmDeleteModal
        show={showDeleteAccountModal}
        onCancel={() => setShowDeleteAccountModal(false)}
        onConfirm={confirmDeleteAccount}
        title="Supprimer votre compte"
        message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
      />

      <ConfirmDeleteModal
        show={showDeleteAccountConfirmModal}
        onCancel={() => setShowDeleteAccountConfirmModal(false)}
        onConfirm={finalConfirmDeleteAccount}
        title="Dernière confirmation"
        message="Voulez-vous vraiment supprimer définitivement votre compte ? Cette action est irréversible et ne peut pas être annulée."
        confirmText="Oui, supprimer définitivement"
      />
    </>
  );
}

