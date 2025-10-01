import React, {useState} from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../services/api.jsx";
import { toast } from "react-toastify";
import { categoryService } from "../services/categoryService.js";

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

  // Récupération des données utilisateur
  const {user} = useAuth();
  if (!categoryList.length){
    return <div>Aucune catégorie trouvée.</div>;
  }
  // Supprimer une catégorie
  const handleClickDelete = async (categoryId) => { 
    const categoryName = categoryList.find(cat => cat.id === categoryId)?.name || "cette catégorie";
    const isSure = confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ? Cette action supprimera également tous les cours associés.`);
    
    if (!isSure) {
      return;
    }

    try {
      await categoryService.deleteCategory(categoryId);
      
      // Mise à jour de la liste locale après suppression
      setCategoryList((prev) => prev.filter((category) => category.id !== categoryId));
      toast.success("Catégorie supprimée avec succès !");
    } catch (err) {
      console.error("Erreur suppression catégorie:", err);
      toast.error(err.response?.data?.error || err.message || "Erreur lors de la suppression de la catégorie");
    }
  }
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
    <section className="list-category" aria-label="Liste des catégories">
      {categoryList.map((category) => (
        <section className="category-box" key={category.name}>
          <div className="category-box__desc">
            <p> </p>
            <Link
              to={`/categories/${category.id}/lessons` }
              style={{ textDecoration: "none", color: "inherit" }}
              key={category.id}
              >
              <h3>{category.name.replace(/^./, (match) => match.toUpperCase())}</h3>
            </Link>
            {/* Affiche les boutons de CRUD si l'utilisateur a les droits d'admin ou s'il est propriétaire de la catégorie*/}
            {user ? (
              <div className="crud">
                <a onClick={() => handleClickUpdate(category.id)} style={{ cursor: 'pointer' }}>
                  <h4>{((user.role_id === 1) || (user.role_id === 2 && category.user_id === user.id)) ?("\ud83d\udcdd"):(" ")}</h4>
                </a>
                <a onClick={() => handleClickDelete(category.id)} style={{ cursor: 'pointer' }}>
                    <h4>{((user.role_id === 1) || (user.role_id === 2 && category.user_id === user.id)) ?("\ud83d\uddd1"):(" ")}</h4>
                </a>
              </div>
              ):(
              <p></p>
              )
            }
          </div>
        </section>
          
      ))}

      {/* Affiche le bouton 'ajouter' si l'utilisateur a les droits d'admin ou prof*/}

      <div className="see-more"></div>
            {user && (user.role_id === 1 || user.role_id === 2) ?
        (
        <button 
          type="button" 
          className="main-button"
          onClick={handleCreateCategory}
        >
          Nouvelle catégorie
        </button>
        ):(
        <p></p>
        )
      }

      {/* Modale pour créer/modifier une catégorie */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1976d2' }}>
              {editingCategory ? '✏️ Modifier la catégorie' : '➕ Créer une nouvelle catégorie'}
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="category-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Nom de la catégorie : *
              </label>
              <input
                id="category-name"
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ex: Cuisine, Bricolage, Informatique..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                disabled={categoryLoading}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="category-description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Description (optionnel) :
              </label>
              <textarea
                id="category-description"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Décrivez brièvement cette catégorie..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                disabled={categoryLoading}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={categoryLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: categoryLoading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                disabled={categoryLoading || !categoryName.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: categoryLoading || !categoryName.trim() ? '#ccc' : '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: categoryLoading || !categoryName.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {categoryLoading ? 'Sauvegarde...' : (editingCategory ? 'Modifier la catégorie' : 'Créer la catégorie')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}