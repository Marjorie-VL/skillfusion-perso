import React, {useState} from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../services/api.jsx";
import { toast } from "react-toastify";
import { categoryService } from "../services/categoryService.js";
import ConfirmDeleteModal from "../pages/ConfirmDeleteModal";

export default function ContainerCategories({ categories }) {
  const [categoryList,setCategoryList] = useState(
      categories?.categories || categories || []
  );

  // États pour la modale de catégorie
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null pour création, objet pour modification
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  // États pour la modale de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: null, name: "" });

  // Récupération des données utilisateur
  const {user} = useAuth();
  if (!categoryList.length){
    return <div className="text-center p-8">Aucune catégorie trouvée.</div>;
  }
  // Supprimer une catégorie
  const handleClickDelete = (categoryId) => { 
    const category = categoryList.find(cat => cat.id === categoryId);
    setDeleteTarget({ 
      id: categoryId, 
      name: category?.name || "cette catégorie" 
    });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await categoryService.deleteCategory(deleteTarget.id);
      
      // Mise à jour de la liste locale après suppression
      setCategoryList((prev) => prev.filter((category) => category.id !== deleteTarget.id));
      toast.success("Catégorie supprimée avec succès !");
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Erreur suppression catégorie:", err);
      toast.error(err.response?.data?.error || err.message || "Erreur lors de la suppression de la catégorie");
      setShowDeleteModal(false);
    }
  };
  // Modifier une catégorie
  const handleClickUpdate = (categoryId) => {
    const category = categoryList.find(cat => cat.id === categoryId);
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryDescription(category.description || "");
      setShowCategoryModal(true);
    }
  };

  // Ouvrir la modale pour créer une nouvelle catégorie
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setShowCategoryModal(true);
  };

  // Fermer la modale
  const handleCloseModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
  };

  // Sauvegarder la catégorie (création ou modification)
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Le nom de la catégorie est obligatoire");
      return;
    }

    setCategoryLoading(true);
    try {
      if (editingCategory) {
        // Modification
        const updatedCategory = await categoryService.updateCategory(editingCategory.id, {
          name: categoryName.trim(),
          description: categoryDescription.trim() || null
        });

        // Mettre à jour la liste locale
        setCategoryList(prev => prev.map(cat => 
          cat.id === editingCategory.id ? { ...cat, ...updatedCategory } : cat
        ));
        
        toast.success(`Catégorie "${categoryName}" modifiée avec succès !`);
      } else {
        // Création
        const newCategory = await categoryService.createCategory({
          name: categoryName.trim(),
          description: categoryDescription.trim() || null
        });

        // Ajouter la nouvelle catégorie à la liste
        setCategoryList(prev => [...prev, newCategory]);
        
        toast.success(`Catégorie "${categoryName}" créée avec succès !`);
      }

      handleCloseModal();
      
    } catch (error) {
      console.error("❌ Erreur sauvegarde catégorie →", error);
      
      if (error.response && error.response.data) {
        const { data } = error.response;
        
        if (data.errors) {
          toast.error("Veuillez corriger les erreurs dans le formulaire");
        } else if (data.error) {
          toast.error(data.error);
        } else {
          toast.error("Erreur lors de la sauvegarde de la catégorie");
        }
      } else if (error.request) {
        toast.error("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        toast.error("Une erreur inattendue s'est produite.");
      }
    } finally {
      setCategoryLoading(false);
    }
  };
  return (
    <section className="flex flex-col justify-center items-center" aria-label="Liste des catégories">
      {categoryList.map((category) => (
        <section className="h-32 my-4 flex flex-row justify-center items-center w-full" key={category.name}>
          <Link
            to={`/categories/${category.id}/lessons`}
            className="h-full w-[75vw] bg-skill-tertiary border border-skill-success/50 rounded mx-4 px-4 flex flex-row justify-between items-center hover:bg-skill-tertiary/70 hover:border-skill-success transition-colors cursor-pointer no-underline text-inherit"
          >
            <p className="m-0"> </p>
            <h3 className="font-display text-xl md:text-2xl mb-0">{category.name.replace(/^./, (match) => match.toUpperCase())}</h3>
            {/* Affiche les boutons de CRUD si l'utilisateur a les droits d'admin ou s'il est propriétaire de la catégorie*/}
            {user ? (
              <div className="w-14 flex flex-row justify-between" onClick={(e) => e.stopPropagation()}>
                <a onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClickUpdate(category.id);
                }} className="cursor-pointer">
                  <h4 className="text-xl mb-4 font-display font-light text-black m-0">{((user.role_id === 1) || (user.role_id === 2 && category.user_id === user.id)) ?("\ud83d\udcdd"):(" ")}</h4>
                </a>
                <a onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClickDelete(category.id);
                }} className="cursor-pointer">
                    <h4 className="text-xl mb-4 font-display font-light text-black m-0">{((user.role_id === 1) || (user.role_id === 2 && category.user_id === user.id)) ?("\ud83d\uddd1"):(" ")}</h4>
                </a>
              </div>
              ):(
              <p className="m-0"></p>
              )
            }
          </Link>
        </section>
          
      ))}

      {/* Affiche le bouton 'ajouter' si l'utilisateur a les droits d'admin ou prof*/}

      <div className="flex flex-row justify-center items-center"></div>
            {user && (user.role_id === 1 || user.role_id === 2) ?
        (
        <button 
          type="button" 
          className="font-display text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-[20vw] m-4 rounded hover:bg-skill-accent transition-colors"
          onClick={handleCreateCategory}
        >
          Nouvelle catégorie
        </button>
        ):(
        <p className="m-0"></p>
        )
      }

      {/* Modale pour créer/modifier une catégorie */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="bg-skill-primary p-8 rounded-lg shadow-lg border-2 border-skill-secondary max-w-[500px] w-[90%] max-h-[80vh] overflow-auto">
            <h3 className="mt-0 mb-6 text-skill-text-primary font-display text-xl md:text-2xl">
              {editingCategory ? '✏️ Modifier la catégorie' : '+ Créer une nouvelle catégorie'}
            </h3>
            
            <div className="mb-4">
              <label htmlFor="category-name" className="block mb-2 font-bold text-lg text-skill-text-primary">
                Nom de la catégorie : *
              </label>
              <input
                id="category-name"
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ex: Cuisine, Bricolage, Informatique..."
                className="w-full p-3 border-2 border-skill-secondary rounded bg-white text-skill-text-primary focus:outline-none focus:ring-2 focus:ring-skill-accent focus:border-skill-accent disabled:opacity-50"
                disabled={categoryLoading}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="category-description" className="block mb-2 font-bold text-lg text-skill-text-primary">
                Description (optionnel) :
              </label>
              <textarea
                id="category-description"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Décrivez brièvement cette catégorie..."
                rows={3}
                className="w-full p-3 border-2 border-skill-secondary rounded bg-white text-skill-text-primary resize-y focus:outline-none focus:ring-2 focus:ring-skill-accent focus:border-skill-accent disabled:opacity-50"
                disabled={categoryLoading}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={categoryLoading}
                className="py-3 px-6 bg-skill-secondary text-white border border-skill-secondary rounded cursor-pointer text-base font-display hover:bg-skill-accent hover:border-skill-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                disabled={categoryLoading || !categoryName.trim()}
                className={`py-3 px-6 text-white border border-skill-success rounded cursor-pointer text-base font-display transition-colors ${
                  categoryLoading || !categoryName.trim() 
                    ? 'bg-gray-400 border-gray-400 cursor-not-allowed' 
                    : 'bg-skill-success hover:bg-skill-success/90 hover:border-skill-success/90'
                }`}
              >
                {categoryLoading ? 'Sauvegarde...' : (editingCategory ? 'Modifier la catégorie' : 'Créer la catégorie')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation suppression catégorie */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Supprimer la catégorie"
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${deleteTarget.name}" ? Cette action supprimera également tous les cours associés.`}
      />
    </section>
  );
}
