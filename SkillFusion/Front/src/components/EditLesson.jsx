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
      <main className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] mb-8">
        <section className="flex flex-col justify-center items-center">
          <h2 className="font-display text-center text-2xl md:text-4xl my-8">Modifier la leçon</h2>
        </section>
        <section className="w-full max-w-[900px] mx-auto px-4">
          <div className="bg-skill-tertiary border-2 border-skill-success/50 rounded-lg p-6 md:p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            {/* Catégorie */}
            <div className="flex flex-col mb-2 w-3/4">
              <label htmlFor="category" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-semibold">Catégorie :</label>
              <select
                className="h-8 md:h-10 text-base md:text-xl p-1 my-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent disabled:opacity-50"
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
              {loading && <p className="text-blue-600 text-sm mt-2">Chargement des catégories...</p>}
              {categoriesError && <p className="text-red-600 text-sm mt-2">Erreur: {categoriesError}</p>}
              {!loading && !categoriesError && categories.length === 0 && (
                <p className="text-orange-600 text-sm mt-2">Aucune catégorie disponible</p>
              )}
            </div>

            {/* Titre */}
            <div className="flex flex-col mb-2 w-3/4">
              <label htmlFor="title" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-semibold">Titre :</label>
              <input
                className="h-8 md:h-10 text-base md:text-xl p-1 my-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                type="text"
                id="title"
                placeholder="Titre du cours"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Image résultat */}
            <div className="flex flex-col mb-2 w-3/4">
              <label htmlFor="resul_img" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-semibold">Image du résultat :</label>
              <div className="flex gap-2 items-center mb-2">
                <input
                  className="h-8 md:h-10 text-base md:text-xl p-1 my-2 flex-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                  type="text"
                  id="resul_img"
                  placeholder="URL de l'image"
                  value={mediaUrl}
                  onChange={e => setMediaUrl(e.target.value)}
                />
                <span className="text-gray-600 text-sm">OU</span>
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
                  className="flex-1"
                />
              </div>
              <input
                className="h-8 md:h-10 text-base md:text-xl p-1 my-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                type="text"
                placeholder="Description de l'image (optionnel)"
                value={mediaAlt}
                onChange={e => setMediaAlt(e.target.value)}
              />
              {/* Prévisualisation de l'image principale */}
              {mediaUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Aperçu :</p>
                  <div className="max-w-[300px] max-h-[200px] border border-gray-300 rounded overflow-hidden">
                    {mediaUrl.startsWith('/uploads/') ? (
                      <img 
                        src={`${import.meta.env.VITE_API_URL}${mediaUrl}`} 
                        alt={mediaAlt || "Aperçu de l'image"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : (
                      <img 
                        src={mediaUrl} 
                        alt={mediaAlt || "Aperçu de l'image"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    )}
                    <div className="hidden p-5 text-center text-gray-500 bg-gray-100">
                      Image non disponible
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMediaUrl("")}
                    className="mt-1 py-1 px-2 bg-red-600 text-white border-none rounded cursor-pointer text-xs hover:bg-red-700 transition-colors"
                  >
                    Supprimer l'image
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col mb-2 w-3/4">
              <label htmlFor="lesson-desc" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-semibold">Description :</label>
              <textarea
                id="lesson-desc"
                placeholder="Description du cours"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                className="h-20 text-base md:text-xl p-1 my-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent resize-y"
              />
            </div>

            {/* Matériel */}
            <div className="flex flex-col mb-2 w-3/4">
              <label className="text-xl md:text-2xl mb-1 text-skill-text-primary font-semibold">Matériel :</label>
              {materials.map((mat, i) => (
                <div key={i} className="flex gap-2 items-center mb-2">
                  <input
                    className="h-8 md:h-10 text-base md:text-xl p-1 my-2 flex-[2] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                    type="text"
                    placeholder="Nom du matériel"
                    value={mat.name}
                    onChange={e => updateMaterial(i, 'name', e.target.value)}
                  />
                  <input
                    className="h-8 md:h-10 text-base md:text-xl p-1 my-2 flex-1 max-w-[100px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                    type="number"
                    placeholder="Quantité"
                    min="1"
                    value={mat.quantity}
                    onChange={e => updateMaterial(i, 'quantity', e.target.value)}
                  />
                  {materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMaterial(i)}
                      className="bg-red-600 text-white border-none py-2 px-3 rounded cursor-pointer hover:bg-red-700 transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
              <div className="flex justify-end w-full">
                <button 
                  className="h-6 text-sm font-bold py-2 px-3 bg-skill-secondary rounded flex flex-col justify-center items-center hover:bg-skill-accent transition-colors" 
                  type="button" 
                  onClick={addMaterial}
                >
                  Ajouter un matériel
                </button>
              </div>
            </div>

            {/* Étapes */}
            {steps.map((step, i) => (
              <div className="flex flex-col mb-2 w-3/4" key={i}>
                <label htmlFor={`step-title-${i}`} className="text-xl md:text-2xl mb-1 text-skill-text-primary font-semibold">Etape {i + 1} :</label>
                <input
                  className="h-8 md:h-10 text-base md:text-xl p-1 my-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                  type="text"
                  id={`step-title-${i}`}
                  placeholder="Titre de l'étape"
                  value={step.title}
                  onChange={e => updateStep(i, "title", e.target.value)}
                />
                <label htmlFor={`step-desc-${i}`} className="text-xl md:text-2xl mb-1 mt-2 text-skill-text-primary font-semibold">Description :</label>
                <textarea
                  id={`step-desc-${i}`}
                  placeholder="Description de l'étape"
                  value={step.description}
                  onChange={e => updateStep(i, "description", e.target.value)}
                  className="h-20 text-base md:text-xl p-1 my-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent resize-y"
                />
                <label htmlFor={`step-media-${i}`} className="text-xl md:text-2xl mb-1 mt-2 text-skill-text-primary font-semibold">Média de l'étape :</label>
                <div className="flex gap-2 items-center mb-2">
                  <input
                    className="h-8 md:h-10 text-base md:text-xl p-1 my-2 flex-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                    type="text"
                    id={`step-media-${i}`}
                    placeholder="URL de l'image ou vidéo"
                    value={step.mediaUrl}
                    onChange={e => updateStep(i, "mediaUrl", e.target.value)}
                  />
                  <span className="text-gray-600 text-sm">OU</span>
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
                    className="flex-1"
                  />
                </div>
                <label htmlFor={`step-media-alt-${i}`} className="text-xl md:text-2xl mb-1 mt-2 text-skill-text-primary font-semibold">Description du média :</label>
                <input
                  className="h-8 md:h-10 text-base md:text-xl p-1 my-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                  type="text"
                  id={`step-media-alt-${i}`}
                  placeholder="Description de l'image ou vidéo"
                  value={step.mediaAlt}
                  onChange={e => updateStep(i, "mediaAlt", e.target.value)}
                />
                {/* Prévisualisation du média de l'étape */}
                {step.mediaUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Aperçu :</p>
                    <div className="max-w-[300px] max-h-[200px] border border-gray-300 rounded overflow-hidden">
                      {step.mediaUrl.startsWith('/uploads/') ? (
                        <img 
                          src={`${import.meta.env.VITE_API_URL}${step.mediaUrl}`} 
                          alt={step.mediaAlt || "Aperçu du média"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : (
                        <img 
                          src={step.mediaUrl} 
                          alt={step.mediaAlt || "Aperçu du média"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      )}
                      <div className="hidden p-5 text-center text-gray-500 bg-gray-100">
                        Média non disponible
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateStep(i, "mediaUrl", "")}
                      className="mt-1 py-1 px-2 bg-red-600 text-white border-none rounded cursor-pointer text-xs hover:bg-red-700 transition-colors"
                    >
                      Supprimer le média
                    </button>
                  </div>
                )}
                {i === steps.length - 1 && (
                  <div className="flex justify-end w-full">
                    <button 
                      className="h-6 text-sm font-bold py-2 px-3 bg-skill-secondary rounded flex flex-col justify-center items-center hover:bg-skill-accent transition-colors" 
                      type="button" 
                      onClick={addStep}
                    >
                      Ajouter une étape
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Affichage des erreurs de validation */}
            {Object.keys(errors).length > 0 && (
              <div className="text-red-600 mb-5 w-3/4">
                <h4 className="font-semibold mb-2">Erreurs de validation :</h4>
                {Object.entries(errors).map(([field, message]) => (
                  <p key={field}>• {message}</p>
                ))}
              </div>
            )}

            {/* Boutons d'envoi */}
            <section className="flex flex-row justify-center items-center">
              <div className="flex gap-4 justify-center flex-wrap">
                <button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={submitLoading}
                  className={`font-display text-xl md:text-2xl py-3 px-6 rounded text-white border-none cursor-pointer transition-colors ${
                    submitLoading ? 'bg-gray-500 cursor-not-allowed opacity-60' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {submitLoading ? "Sauvegarde..." : "Enregistrer en brouillon"}
                </button>
                
                <button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={submitLoading}
                  className={`font-display text-xl md:text-2xl py-3 px-6 rounded text-white border-none cursor-pointer transition-colors ${
                    submitLoading ? 'bg-gray-500 cursor-not-allowed opacity-60' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {submitLoading ? "Publication..." : "Publier maintenant"}
                </button>
              </div>
              
              {submitError && <div className="text-red-600 mt-2 text-center w-full">{submitError}</div>}
              
              <div className="mt-4 p-2 bg-gray-100 rounded text-sm text-gray-600 text-center w-3/4">
                <strong>💡 Astuce :</strong> Enregistrez en brouillon pour continuer plus tard, ou publiez directement pour rendre votre cours visible aux utilisateurs.
              </div>
            </section>
          </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
