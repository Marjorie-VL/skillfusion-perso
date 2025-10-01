import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../services/api.jsx";
import { categoryService } from "../services/categoryService.js";
import { lessonService } from "../services/lessonService.js";
import { uploadService } from "../services/uploadService.js";

export default function NewLesson() {
  // États pour les catégories, le chargement et les erreurs
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  // États pour le formulaire
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaAlt, setMediaAlt] = useState("");
  const [content,setContent] = useState("");
  const [materials, setMaterials] = useState([{ name: "", quantity: 1 }]);
  const [steps, setSteps] = useState([{ title: "", description: "", mediaUrl: "", mediaAlt: "" }]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [errors, setErrors] = useState({});
  
  // États pour la modale de nouvelle catégorie
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  


  // Récupération des catégories au chargement
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("🔍 Récupération des catégories...");
        const data = await categoryService.getAllCategories();
        console.log("📋 Catégories reçues:", data);
        
        const categoriesList = Array.isArray(data) ? data : data.categories || [];
        setCategories(categoriesList);
        setLoading(false);
        
        if (categoriesList.length === 0) {
          console.warn("⚠️ Aucune catégorie trouvée");
          toast.warning("Aucune catégorie disponible");
        }
      } catch (err) {
        console.error("❌ Erreur récupération catégories:", err);
        setCategoriesError(err.message);
        setLoading(false);
        toast.error("Erreur lors du chargement des catégories");
      }
    };

    fetchCategories();
  }, []);

  // Gestion du matériel
  const addMaterial = () => setMaterials([...materials, { name: "", quantity: 1 }]);
  const updateMaterial = (i, field, value) => {
    const newMaterials = [...materials];
    newMaterials[i][field] = field === 'quantity' ? parseInt(value) || 1 : value;
    setMaterials(newMaterials);
  };
  const removeMaterial = (i) => {
    if (materials.length > 1) {
      setMaterials(materials.filter((_, index) => index !== i));
    }
  };

  // Gestion des étapes
  const addStep = () => setSteps([...steps, { title: "", description: "", mediaUrl: "", mediaAlt: "" }]);
  const updateStep = (i, field, value) => {
    const newSteps = [...steps];
    newSteps[i][field] = value;
    setSteps(newSteps);
  };

  // Fonction pour créer une nouvelle catégorie
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Le nom de la catégorie est obligatoire");
      return;
    }

    setCategoryLoading(true);
    try {
      const newCategory = await categoryService.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || null
      });

      // Ajouter la nouvelle catégorie à la liste
      setCategories(prev => [...prev, newCategory]);
      
      // Sélectionner automatiquement la nouvelle catégorie
      setSelectedCategory(newCategory.id.toString());
      
      // Fermer la modale et reset les champs
      setShowCategoryModal(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
      
      toast.success(`Catégorie "${newCategory.name}" créée avec succès !`);
      
    } catch (error) {
      console.error("❌ Erreur création catégorie →", error);
      
      if (error.response && error.response.data) {
        const { data } = error.response;
        
        if (data.errors) {
          toast.error("Veuillez corriger les erreurs dans le formulaire");
        } else if (data.error) {
          toast.error(data.error);
        } else {
          toast.error("Erreur lors de la création de la catégorie");
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

  // Soumission du formulaire
  const handleSubmit = async (e, publishNow = false) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    setErrors({});

    // Vérification des champs obligatoires
    if (!selectedCategory || !title || !content) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      setSubmitLoading(false);
      return;
    }

    // Construction de la payload selon le format attendu par le backend
    const lessonData = {
      category_id: parseInt(selectedCategory),
      title,
      description: content,
      user_id: user.id,
      is_published: publishNow, // Ajout du statut de publication
      media_url: mediaUrl && mediaUrl.trim() !== "" ? mediaUrl : null,
      media_alt: mediaAlt && mediaAlt.trim() !== "" ? mediaAlt : null,
      materials: materials
        .filter((m) => m.name.trim() !== "")
        .map(material => ({ name: material.name, quantity: material.quantity || 1 })),
      steps: steps
        .filter((s) => s.title.trim() !== "" && s.description.trim() !== "")
        .map(step => ({
          title: step.title,
          description: step.description,
          media_url: step.mediaUrl && step.mediaUrl.trim() !== "" ? step.mediaUrl : null,
          media_alt: step.mediaAlt && step.mediaAlt.trim() !== "" ? step.mediaAlt : null
        }))
    };

    try {
      await lessonService.createLesson(lessonData);

      // Succès
      const successMessage = publishNow 
        ? "Leçon créée et publiée avec succès ! 🎉" 
        : "Leçon sauvegardée en brouillon ! 📝";
      toast.success(successMessage);
      
      // Reset du formulaire
      setSelectedCategory("");
      setTitle("");
      setMediaUrl("");
      setMediaAlt("");
      setContent("");
      setMaterials([{ name: "", quantity: 1 }]);
      setSteps([{ title: "", description: "", mediaUrl: "", mediaAlt: "" }]);
      
      // Redirection
      navigate("/lessons");
    } catch (err) {
      console.error("❌ Erreur création leçon →", err);
      
      if (err.response && err.response.data) {
        const { data } = err.response;
        
        if (data.errors) {
          setErrors(data.errors);
          toast.error("Veuillez corriger les erreurs dans le formulaire");
        } else if (data.error) {
          toast.error(data.error);
        } else {
          toast.error("Erreur lors de la création de la leçon");
        }
      } else if (err.request) {
        toast.error("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        toast.error("Une erreur inattendue s'est produite.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main>
        <section className="head-banner">
          <h2>Créer un cours</h2>
        </section>
        <section className="lessons">
          <form onSubmit={handleSubmit}>
            {/* Catégorie */}
            <div className="form">
              <label htmlFor="category">Catégorie :</label>
              <select
                className="search-bar input-bar"
                id="category"
                value={selectedCategory}
                onChange={e => {
                  console.log("🎯 Catégorie sélectionnée:", e.target.value);
                  
                  if (e.target.value === "new-category") {
                    // Ouvrir la modale pour créer une nouvelle catégorie
                    setShowCategoryModal(true);
                    setSelectedCategory(""); // Reset la sélection
                  } else {
                    setSelectedCategory(e.target.value);
                  }
                }}
                disabled={loading || !!categoriesError}
                required
              >
                <option value="">--Choisissez votre catégorie--</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
                {/* Option pour créer une nouvelle catégorie */}
                <option value="new-category" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                  ➕ Nouvelle catégorie
                </option>
              </select>
              {loading && <p style={{ color: "blue" }}>Chargement des catégories...</p>}
              {categoriesError && <p style={{ color: "red" }}>Erreur: {categoriesError}</p>}
              {!loading && !categoriesError && categories.length === 0 && (
                <p style={{ color: "orange" }}>Aucune catégorie disponible</p>
              )}
            </div>
            {/* Titre */}
            <div className="form">
              <label htmlFor="title">Titre :</label>
              <input
                className="search-bar input-bar"
                type="text"
                id="title"
                placeholder="Titre du cours"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            {/* Image résultat */}
            <div className="form">
              <label htmlFor="resul_img">Image du résultat :</label>
              
              {/* Aperçu de l'image si une URL est fournie */}
              {mediaUrl && (
                <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                  <p style={{ fontSize: '12px', color: '#666', margin: '0 0 5px 0' }}>Aperçu :</p>
                  <img 
                    src={mediaUrl.startsWith('http') ? mediaUrl : `${import.meta.env.VITE_API_URL}${mediaUrl}`}
                    alt="Aperçu"
                    style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <p style={{ display: 'none', color: 'red', fontSize: '12px' }}>Impossible de charger l'aperçu</p>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <input
                  className="search-bar input-bar"
                  type="text"
                  id="resul_img"
                  placeholder="URL de l'image (ex: https://example.com/image.jpg)"
                  value={mediaUrl}
                  onChange={e => setMediaUrl(e.target.value)}
                  style={{ flex: 1 }}
                />
                <span style={{ color: '#666', fontSize: '14px' }}>OU</span>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        console.log("📁 Fichier sélectionné:", file.name, "Taille:", file.size);
                        
                        // Vérifier la taille du fichier (10MB max)
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error("Le fichier est trop volumineux (max 10MB)");
                          return;
                        }
                        
                        try {
                          console.log("🚀 Upload de l'image:", file.name);
                          const data = await uploadService.uploadFile(file);
                          console.log("✅ Upload réussi:", data);
                          setMediaUrl(data.url);
                          toast.success(`Image "${file.name}" uploadée avec succès !`);
                        } catch (error) {
                          console.error("❌ Erreur upload:", error);
                          toast.error("Erreur lors de l'upload de l'image");
                        }
                      }
                    }}
                    style={{ width: '100%' }}
                  />
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Formats acceptés: JPG, PNG, GIF (max 10MB)
                  </div>
                </div>
              </div>
              
              <input
                className="search-bar input-bar"
                type="text"
                placeholder="Description de l'image (optionnel)"
                value={mediaAlt}
                onChange={e => setMediaAlt(e.target.value)}
              />
              
              {/* Bouton pour effacer l'image */}
              {mediaUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setMediaUrl("");
                    setMediaAlt("");
                    toast.info("Image supprimée");
                  }}
                  style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  🗑️ Supprimer l'image
                </button>
              )}
            </div>
            {/* Description */}
            <div className="form">
              <label htmlFor="lesson-desc">Description :</label>
              <textarea
                id="lesson-desc"
                placeholder="Description du cours"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
            </div>
            {/* Matériel */}
            <div className="form">
              <label>Matériel :</label>
              {materials.map((mat, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <input
                  className="search-bar input-bar"
                  type="text"
                    placeholder="Nom du matériel"
                    value={mat.name}
                    onChange={e => updateMaterial(i, 'name', e.target.value)}
                    style={{ flex: 2 }}
                  />
                  <input
                    className="search-bar input-bar"
                    type="number"
                    placeholder="Quantité"
                    min="1"
                    value={mat.quantity}
                    onChange={e => updateMaterial(i, 'quantity', e.target.value)}
                    style={{ flex: 1, maxWidth: '100px' }}
                  />
                  {materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMaterial(i)}
                      style={{ 
                        background: '#e74c3c', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 12px', 
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
              <div className="add-button">
                <button className="mini-button" type="button" onClick={addMaterial}>
                  Ajouter un matériel
                </button>
              </div>
            </div>
            {/* Étapes */}
            {steps.map((step, i) => (
              <div className="form" key={i}>
                <label htmlFor={`step-title-${i}`}>Etape {i + 1} :</label>
                <input
                  className="search-bar input-bar"
                  type="text"
                  id={`step-title-${i}`}
                  placeholder="Titre de l'étape"
                  value={step.title}
                  onChange={e => updateStep(i, "title", e.target.value)}
                />
                <label htmlFor={`step-desc-${i}`}>Description :</label>
                <textarea
                  id={`step-desc-${i}`}
                  placeholder="Description de l'étape"
                  value={step.description}
                  onChange={e => updateStep(i, "description", e.target.value)}
                />
                <label htmlFor={`step-media-${i}`}>Média de l'étape :</label>
                
                {/* Aperçu du média si une URL est fournie */}
                {step.mediaUrl && (
                  <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 5px 0' }}>Aperçu :</p>
                    {step.mediaUrl.match(/\.(mp4|mov|avi|webm)$/i) ? (
                      <video 
                        src={step.mediaUrl.startsWith('http') ? step.mediaUrl : `${import.meta.env.VITE_API_URL}${step.mediaUrl}`}
                        controls
                        style={{ maxWidth: '200px', maxHeight: '150px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : (
                      <img 
                        src={step.mediaUrl.startsWith('http') ? step.mediaUrl : `${import.meta.env.VITE_API_URL}${step.mediaUrl}`}
                        alt="Aperçu"
                        style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    )}
                    <p style={{ display: 'none', color: 'red', fontSize: '12px' }}>Impossible de charger l'aperçu</p>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <input
                    className="search-bar input-bar"
                    type="text"
                    id={`step-media-${i}`}
                    placeholder="URL de l'image ou vidéo"
                    value={step.mediaUrl}
                    onChange={e => updateStep(i, "mediaUrl", e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <span style={{ color: '#666', fontSize: '14px' }}>OU</span>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          console.log(`📁 Média étape ${i+1} sélectionné:`, file.name, "Taille:", file.size);
                          
                          // Vérifier la taille du fichier (10MB max)
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error("Le fichier est trop volumineux (max 10MB)");
                            return;
                          }
                          
                          try {
                            const data = await uploadService.uploadFile(file);
                            updateStep(i, "mediaUrl", data.url);
                            toast.success(`Média "${file.name}" uploadé avec succès !`);
                          } catch (error) {
                            console.error("Erreur upload:", error);
                            toast.error("Erreur lors de l'upload du média");
                          }
                        }
                      }}
                      style={{ width: '100%' }}
                    />
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                      Images: JPG, PNG, GIF | Vidéos: MP4, MOV, AVI (max 10MB)
                    </div>
                  </div>
                </div>
                
                {/* Bouton pour effacer le média */}
                {step.mediaUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      updateStep(i, "mediaUrl", "");
                      updateStep(i, "mediaAlt", "");
                      toast.info("Média supprimé");
                    }}
                    style={{
                      marginBottom: '10px',
                      padding: '5px 10px',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🗑️ Supprimer le média
                  </button>
                )}
                <label htmlFor={`step-media-alt-${i}`}>Description du média :</label>
                <input
                  className="search-bar input-bar"
                  type="text"
                  id={`step-media-alt-${i}`}
                  placeholder="Description de l'image ou vidéo"
                  value={step.mediaAlt}
                  onChange={e => updateStep(i, "mediaAlt", e.target.value)}
                />
                {i === steps.length - 1 && (
                  <div className="add-button">
                    <button className="mini-button" type="button" onClick={addStep}>
                      Ajouter une étape
                    </button>
                  </div>
                )}
              </div>
            ))}
            {/* Affichage des erreurs de validation */}
            {Object.keys(errors).length > 0 && (
              <div style={{ color: "red", marginBottom: "20px" }}>
                <h4>Erreurs de validation :</h4>
                {Object.entries(errors).map(([field, message]) => (
                  <p key={field}>• {message}</p>
                ))}
              </div>
            )}

            {/* Boutons d'envoi */}
            <section className="see-more">
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, false)}
                  className="main-button" 
                  disabled={submitLoading}
                  style={{ 
                    backgroundColor: '#6c757d',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '16px',
                    cursor: submitLoading ? 'not-allowed' : 'pointer',
                    opacity: submitLoading ? 0.6 : 1
                  }}
                >
                  {submitLoading ? "Sauvegarde..." : "📝 Enregistrer en brouillon"}
                </button>
                
                <button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, true)}
                  className="main-button" 
                  disabled={submitLoading}
                  style={{ 
                    backgroundColor: '#28a745',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '16px',
                    cursor: submitLoading ? 'not-allowed' : 'pointer',
                    opacity: submitLoading ? 0.6 : 1
                  }}
                >
                  {submitLoading ? "Publication..." : "🚀 Publier maintenant"}
                </button>
              </div>
              
              {submitError && <div style={{ color: "red", marginTop: "10px", textAlign: "center" }}>{submitError}</div>}
              
              <div style={{ 
                marginTop: "15px", 
                padding: "10px", 
                backgroundColor: "#f8f9fa", 
                borderRadius: "6px", 
                fontSize: "14px", 
                color: "#6c757d",
                textAlign: "center"
              }}>
                <strong>💡 Astuce :</strong> Enregistrez en brouillon pour continuer plus tard, ou publiez directement pour rendre votre cours visible aux utilisateurs.
              </div>
            </section>
          </form>
        </section>
      </main>
      <Footer />

      {/* Modale pour créer une nouvelle catégorie */}
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
              ➕ Créer une nouvelle catégorie
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="new-category-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Nom de la catégorie : *
              </label>
              <input
                id="new-category-name"
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
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
              <label htmlFor="new-category-description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Description (optionnel) :
              </label>
              <textarea
                id="new-category-description"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
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
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName("");
                  setNewCategoryDescription("");
                }}
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
                onClick={handleCreateCategory}
                disabled={categoryLoading || !newCategoryName.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: categoryLoading || !newCategoryName.trim() ? '#ccc' : '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: categoryLoading || !newCategoryName.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {categoryLoading ? 'Création...' : 'Créer la catégorie'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
