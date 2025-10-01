import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../services/api.jsx";
import { categoryService } from "../services/categoryService.js";
import { lessonService } from "../services/lessonService.js";
import { uploadService } from "../services/uploadService.js";

export default function EditLesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // États pour les catégories, le chargement et les erreurs
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  // États pour le formulaire
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaAlt, setMediaAlt] = useState("");
  const [content, setContent] = useState("");
  const [materials, setMaterials] = useState([{ name: "", quantity: 1 }]);
  const [steps, setSteps] = useState([{ title: "", description: "", mediaUrl: "", mediaAlt: "" }]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [errors, setErrors] = useState({});

  // Charger les données de la leçon existante
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const lesson = await lessonService.getLessonById(id);
        
        // Pré-remplir le formulaire
        setSelectedCategory(lesson.category_id.toString());
        setTitle(lesson.title);
        setMediaUrl(lesson.media_url || "");
        setMediaAlt(lesson.media_alt || "");
        setContent(lesson.description);
        
        // Matériaux
        if (lesson.materials && lesson.materials.length > 0) {
          setMaterials(lesson.materials.map(m => ({ name: m.name, quantity: m.quantity || 1 })));
        } else {
          setMaterials([{ name: "", quantity: 1 }]);
        }
        
        // Étapes
        if (lesson.steps && lesson.steps.length > 0) {
          setSteps(lesson.steps.map(s => ({ 
            title: s.title, 
            description: s.description, 
            mediaUrl: s.media_url || "", 
            mediaAlt: s.media_alt || "" 
          })));
        } else {
          setSteps([{ title: "", description: "", mediaUrl: "", mediaAlt: "" }]);
        }
      } catch (error) {
        console.error("Erreur chargement leçon:", error);
        toast.error("Erreur lors du chargement de la leçon");
        navigate("/lessons");
      }
    };

    fetchLesson();
  }, [id, navigate]);

  // Récupération des catégories
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
      await lessonService.updateLesson(id, lessonData);

      // Succès
      const successMessage = publishNow 
        ? "Leçon modifiée et publiée avec succès ! 🎉" 
        : "Leçon sauvegardée en brouillon ! 📝";
      toast.success(successMessage);
      
      // Redirection
      navigate(`/lesson/${id}`);
    } catch (err) {
      console.error("❌ Erreur modification leçon →", err);
      
      if (err.response && err.response.data) {
        const { data } = err.response;
        
        if (data.errors) {
          setErrors(data.errors);
          toast.error("Veuillez corriger les erreurs dans le formulaire");
        } else if (data.error) {
          toast.error(data.error);
        } else {
          toast.error("Erreur lors de la modification de la leçon");
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
          <h2>Modifier la leçon</h2>
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
                  setSelectedCategory(e.target.value);
                }}
                disabled={loading || !!categoriesError}
                required
              >
                <option value="">--Choisissez votre catégorie--</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
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
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  className="search-bar input-bar"
                  type="text"
                  id="resul_img"
                  placeholder="URL de l'image"
                  value={mediaUrl}
                  onChange={e => setMediaUrl(e.target.value)}
                  style={{ flex: 1 }}
                />
                <span style={{ color: '#666' }}>OU</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        try {
                          const data = await uploadService.uploadFile(file);
                          setMediaUrl(data.url);
                          toast.success("Image uploadée avec succès !");
                        } catch (error) {
                          console.error("Erreur upload:", error);
                          toast.error("Erreur lors de l'upload de l'image");
                        }
                    }
                  }}
                  style={{ flex: 1 }}
                />
              </div>
              <input
                className="search-bar input-bar"
                type="text"
                placeholder="Description de l'image (optionnel)"
                value={mediaAlt}
                onChange={e => setMediaAlt(e.target.value)}
              />
              {/* Prévisualisation de l'image principale */}
              {mediaUrl && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Aperçu :</p>
                  <div style={{ 
                    maxWidth: '300px', 
                    maxHeight: '200px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    {mediaUrl.startsWith('/uploads/') ? (
                      <img 
                        src={`${import.meta.env.VITE_API_URL}${mediaUrl}`} 
                        alt={mediaAlt || "Aperçu de l'image"}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : (
                      <img 
                        src={mediaUrl} 
                        alt={mediaAlt || "Aperçu de l'image"}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    )}
                    <div style={{ 
                      display: 'none', 
                      padding: '20px', 
                      textAlign: 'center', 
                      color: '#999',
                      backgroundColor: '#f5f5f5'
                    }}>
                      Image non disponible
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMediaUrl("")}
                    style={{ 
                      marginTop: '5px',
                      background: '#e74c3c', 
                      color: 'white', 
                      border: 'none', 
                      padding: '5px 10px', 
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    Supprimer l'image
                  </button>
                </div>
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
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    className="search-bar input-bar"
                    type="text"
                    id={`step-media-${i}`}
                    placeholder="URL de l'image ou vidéo"
                    value={step.mediaUrl}
                    onChange={e => updateStep(i, "mediaUrl", e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <span style={{ color: '#666' }}>OU</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                          try {
                            const data = await uploadService.uploadFile(file);
                            updateStep(i, "mediaUrl", data.url);
                            toast.success("Média uploadé avec succès !");
                          } catch (error) {
                            console.error("Erreur upload:", error);
                            toast.error("Erreur lors de l'upload du média");
                          }
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                </div>
                <label htmlFor={`step-media-alt-${i}`}>Description du média :</label>
                <input
                  className="search-bar input-bar"
                  type="text"
                  id={`step-media-alt-${i}`}
                  placeholder="Description de l'image ou vidéo"
                  value={step.mediaAlt}
                  onChange={e => updateStep(i, "mediaAlt", e.target.value)}
                />
                {/* Prévisualisation du média de l'étape */}
                {step.mediaUrl && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Aperçu :</p>
                    <div style={{ 
                      maxWidth: '300px', 
                      maxHeight: '200px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      {step.mediaUrl.startsWith('/uploads/') ? (
                        <img 
                          src={`${import.meta.env.VITE_API_URL}${step.mediaUrl}`} 
                          alt={step.mediaAlt || "Aperçu du média"}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : (
                        <img 
                          src={step.mediaUrl} 
                          alt={step.mediaAlt || "Aperçu du média"}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      )}
                      <div style={{ 
                        display: 'none', 
                        padding: '20px', 
                        textAlign: 'center', 
                        color: '#999',
                        backgroundColor: '#f5f5f5'
                      }}>
                        Média non disponible
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateStep(i, "mediaUrl", "")}
                      style={{ 
                        marginTop: '5px',
                        background: '#e74c3c', 
                        color: 'white', 
                        border: 'none', 
                        padding: '5px 10px', 
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      Supprimer le média
                    </button>
                  </div>
                )}
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
    </>
  );
}
