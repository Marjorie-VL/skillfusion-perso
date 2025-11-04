import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { categoryService } from "../../services/categoryService.js";
import { uploadService } from "../../services/uploadService.js";
import { lessonService } from "../../services/lessonService.js";

/**
 * Composant réutilisable pour le formulaire de création de cours
 * @param {Object} user - Objet utilisateur
 * @param {function} onSuccess - Callback appelé après la création réussie
 * @param {function} onCancel - Callback appelé pour annuler (optionnel)
 */
export default function CourseCreationForm({ user, onSuccess, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaAlt, setMediaAlt] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [materials, setMaterials] = useState([{ name: "", quantity: 1 }]);
  const [steps, setSteps] = useState([{ title: "", description: "", mediaUrl: "", mediaAlt: "" }]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [lessonErrors, setLessonErrors] = useState({});
  
  // États pour la modale de nouvelle catégorie
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Récupération des catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        const categoriesList = Array.isArray(data) ? data : data.categories || [];
        setCategories(categoriesList);
        setCategoriesLoading(false);
        
        if (categoriesList.length === 0) {
          toast.warning("Aucune catégorie disponible");
        }
      } catch (err) {
        console.error("❌ Erreur récupération catégories:", err);
        setCategoriesError(err.message);
        setCategoriesLoading(false);
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

      setCategories(prev => [...prev, newCategory]);
      setSelectedCategory(newCategory.id.toString());
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
  const handleLessonSubmit = async (e, publishNow = false) => {
    e.preventDefault();
    setSubmitLoading(true);
    setLessonErrors({});

    if (!selectedCategory || !lessonTitle || !lessonContent) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      setSubmitLoading(false);
      return;
    }

    const lessonData = {
      category_id: parseInt(selectedCategory),
      title: lessonTitle,
      description: lessonContent,
      user_id: user.id,
      is_published: publishNow,
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

      const successMessage = publishNow 
        ? "Leçon créée et publiée avec succès ! 🎉" 
        : "Leçon sauvegardée en brouillon ! 📝";
      toast.success(successMessage);
      
      // Reset du formulaire
      setSelectedCategory("");
      setLessonTitle("");
      setMediaUrl("");
      setMediaAlt("");
      setLessonContent("");
      setMaterials([{ name: "", quantity: 1 }]);
      setSteps([{ title: "", description: "", mediaUrl: "", mediaAlt: "" }]);
      
      // Appeler le callback de succès
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("❌ Erreur création leçon →", err);
      
      if (err.response && err.response.data) {
        const { data } = err.response;
        
        if (data.errors) {
          setLessonErrors(data.errors);
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
      <section className="mb-8">
        <h2 className="font-display text-center text-2xl md:text-3xl my-8">Créer un nouveau cours</h2>
        
        <div className="w-full max-w-[900px] mx-auto px-4">
          <div className="bg-skill-tertiary/30 border-2 border-skill-success/30 rounded-lg p-6 md:p-8 shadow-lg">
            <form onSubmit={handleLessonSubmit} className="w-full flex flex-col items-center">
              {/* Catégorie */}
              <div className="flex flex-col mb-4 w-3/4">
                <label htmlFor="category" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-display font-semibold">Catégorie :</label>
                <select
                  className="h-8 md:h-10 text-base md:text-xl p-2 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent disabled:opacity-50"
                  id="category"
                  value={selectedCategory}
                  onChange={e => {
                    if (e.target.value === "new-category") {
                      setShowCategoryModal(true);
                      setSelectedCategory("");
                    } else {
                      setSelectedCategory(e.target.value);
                    }
                  }}
                  disabled={categoriesLoading || !!categoriesError}
                  required
                >
                  <option value="">--Choisissez votre catégorie--</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                  <option value="new-category" className="font-bold text-green-600">
                    + Nouvelle catégorie
                  </option>
                </select>
                {categoriesLoading && <p className="text-blue-600 text-sm mt-2">Chargement des catégories...</p>}
                {categoriesError && <p className="text-red-600 text-sm mt-2">Erreur: {categoriesError}</p>}
              </div>

              {/* Titre */}
              <div className="flex flex-col mb-4 w-3/4">
                <label htmlFor="title" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-display font-semibold">Titre :</label>
                <input
                  className="h-8 md:h-10 text-base md:text-xl p-2 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                  type="text"
                  id="title"
                  placeholder="Titre du cours"
                  value={lessonTitle}
                  onChange={e => setLessonTitle(e.target.value)}
                  required
                />
              </div>

              {/* Image résultat */}
              <div className="flex flex-col mb-4 w-3/4">
                <label htmlFor="resul_img" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-display font-semibold">Image du résultat :</label>
                
                {mediaUrl && (
                  <div className="mb-2 p-2 border border-skill-secondary rounded">
                    <p className="text-xs text-gray-600 mb-1">Aperçu :</p>
                    <img 
                      src={mediaUrl.startsWith('http') ? mediaUrl : `${import.meta.env.VITE_API_URL}${mediaUrl}`}
                      alt="Aperçu"
                      className="max-w-[200px] max-h-[150px] object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <p className="hidden text-red-600 text-xs">Impossible de charger l'aperçu</p>
                  </div>
                )}
                
                <div className="flex gap-2 items-center mb-2">
                  <input
                    className="h-8 md:h-10 text-base md:text-xl p-2 my-2 flex-1 border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                    type="text"
                    id="resul_img"
                    placeholder="URL de l'image (ex: https://example.com/image.jpg)"
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                  />
                  <span className="text-gray-600 text-sm">OU</span>
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error("Le fichier est trop volumineux (max 10MB)");
                            return;
                          }
                          
                          try {
                            const data = await uploadService.uploadFile(file);
                            setMediaUrl(data.url);
                            toast.success(`Image "${file.name}" uploadée avec succès !`);
                          } catch (error) {
                            console.error("❌ Erreur upload:", error);
                            toast.error("Erreur lors de l'upload de l'image");
                          }
                        }
                      }}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-600 mt-1">
                      Formats acceptés: JPG, PNG, GIF (max 10MB)
                    </div>
                  </div>
                </div>
                
                <input
                  className="h-8 md:h-10 text-base md:text-xl p-2 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                  type="text"
                  placeholder="Description de l'image (optionnel)"
                  value={mediaAlt}
                  onChange={e => setMediaAlt(e.target.value)}
                />
                
                {mediaUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setMediaUrl("");
                      setMediaAlt("");
                      toast.info("Image supprimée");
                    }}
                    className="mt-2 py-1 px-2 bg-red-600 text-white border-none rounded cursor-pointer text-xs hover:bg-red-700 transition-colors font-display"
                  >
                    Supprimer l'image
                  </button>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col mb-4 w-3/4">
                <label htmlFor="lesson-desc" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-display font-semibold">Description :</label>
                <textarea
                  id="lesson-desc"
                  placeholder="Description du cours"
                  value={lessonContent}
                  onChange={e => setLessonContent(e.target.value)}
                  required
                  className="h-20 text-base md:text-xl p-2 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent resize-y"
                />
              </div>

              {/* Matériel */}
              <div className="flex flex-col mb-4 w-3/4">
                <label className="text-xl md:text-2xl mb-1 text-skill-text-primary font-display font-semibold">Matériel :</label>
                {materials.map((mat, i) => (
                  <div key={i} className="flex gap-2 items-center mb-2">
                    <input
                      className="h-8 md:h-10 text-base md:text-xl p-2 my-2 flex-[2] border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                      type="text"
                      placeholder="Nom du matériel"
                      value={mat.name}
                      onChange={e => updateMaterial(i, 'name', e.target.value)}
                    />
                    <input
                      className="h-8 md:h-10 text-base md:text-xl p-2 my-2 flex-1 max-w-[100px] border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
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
                        className="bg-red-600 text-white border-none py-2 px-3 rounded cursor-pointer hover:bg-red-700 transition-colors font-display"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                ))}
                <div className="flex justify-end w-full">
                  <button 
                    className="h-6 text-sm font-bold py-2 px-3 bg-skill-secondary rounded flex flex-col justify-center items-center hover:bg-skill-accent transition-colors font-display" 
                    type="button" 
                    onClick={addMaterial}
                  >
                    Ajouter un matériel
                  </button>
                </div>
              </div>

              {/* Étapes */}
              {steps.map((step, i) => (
                <div className="flex flex-col mb-4 w-3/4" key={i}>
                  <label htmlFor={`step-title-${i}`} className="text-xl md:text-2xl mb-1 text-skill-text-primary font-display font-semibold">Etape {i + 1} :</label>
                  <input
                    className="h-8 md:h-10 text-base md:text-xl p-2 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                    type="text"
                    id={`step-title-${i}`}
                    placeholder="Titre de l'étape"
                    value={step.title}
                    onChange={e => updateStep(i, "title", e.target.value)}
                  />
                  <label htmlFor={`step-desc-${i}`} className="text-xl md:text-2xl mb-1 mt-2 text-skill-text-primary font-display font-semibold">Description :</label>
                  <textarea
                    id={`step-desc-${i}`}
                    placeholder="Description de l'étape"
                    value={step.description}
                    onChange={e => updateStep(i, "description", e.target.value)}
                    className="h-20 text-base md:text-xl p-2 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent resize-y"
                  />
                  <label htmlFor={`step-media-${i}`} className="text-xl md:text-2xl mb-1 mt-2 text-skill-text-primary font-display font-semibold">Média de l'étape :</label>
                  
                  {step.mediaUrl && (
                    <div className="mb-2 p-2 border border-skill-secondary rounded">
                      <p className="text-xs text-gray-600 mb-1">Aperçu :</p>
                      {step.mediaUrl.match(/\.(mp4|mov|avi|webm)$/i) ? (
                        <video 
                          src={step.mediaUrl.startsWith('http') ? step.mediaUrl : `${import.meta.env.VITE_API_URL}${step.mediaUrl}`}
                          controls
                          className="max-w-[200px] max-h-[150px]"
                        />
                      ) : (
                        <img 
                          src={step.mediaUrl.startsWith('http') ? step.mediaUrl : `${import.meta.env.VITE_API_URL}${step.mediaUrl}`}
                          alt="Aperçu"
                          className="max-w-[200px] max-h-[150px] object-cover"
                        />
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2 items-center mb-2">
                    <input
                      className="h-8 md:h-10 text-base md:text-xl p-2 my-2 flex-1 border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                      type="text"
                      id={`step-media-${i}`}
                      placeholder="URL de l'image ou vidéo"
                      value={step.mediaUrl}
                      onChange={e => updateStep(i, "mediaUrl", e.target.value)}
                    />
                    <span className="text-gray-600 text-sm">OU</span>
                    <div className="flex-1 relative">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
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
                        className="w-full"
                      />
                      <div className="text-xs text-gray-600 mt-1">
                        Images: JPG, PNG, GIF | Vidéos: MP4, MOV, AVI (max 10MB)
                      </div>
                    </div>
                  </div>
                  
                  {step.mediaUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        updateStep(i, "mediaUrl", "");
                        updateStep(i, "mediaAlt", "");
                        toast.info("Média supprimé");
                      }}
                      className="mb-2 py-1 px-2 bg-red-600 text-white border-none rounded cursor-pointer text-xs hover:bg-red-700 transition-colors font-display"
                    >
                      Supprimer le média
                    </button>
                  )}
                  <label htmlFor={`step-media-alt-${i}`} className="text-xl md:text-2xl mb-1 mt-2 text-skill-text-primary font-display font-semibold">Description du média :</label>
                  <input
                    className="h-8 md:h-10 text-base md:text-xl p-2 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                    type="text"
                    id={`step-media-alt-${i}`}
                    placeholder="Description de l'image ou vidéo"
                    value={step.mediaAlt}
                    onChange={e => updateStep(i, "mediaAlt", e.target.value)}
                  />
                  {i === steps.length - 1 && (
                    <div className="flex justify-end w-full">
                      <button 
                        className="h-6 text-sm font-bold py-2 px-3 bg-skill-secondary rounded flex flex-col justify-center items-center hover:bg-skill-accent transition-colors font-display" 
                        type="button" 
                        onClick={addStep}
                      >
                        Ajouter une étape
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Erreurs de validation */}
              {Object.keys(lessonErrors).length > 0 && (
                <div className="text-red-600 mb-5 w-3/4">
                  <h4 className="font-semibold mb-2">Erreurs de validation :</h4>
                  {Object.entries(lessonErrors).map(([field, message]) => (
                    <p key={field}>• {message}</p>
                  ))}
                </div>
              )}

              {/* Boutons d'envoi */}
              <section className="flex flex-row justify-center items-center mt-4">
                <div className="flex gap-4 justify-center flex-wrap">
                  <button 
                    type="button" 
                    onClick={(e) => handleLessonSubmit(e, false)}
                    disabled={submitLoading}
                    className={`font-display text-xl md:text-2xl py-3 px-6 rounded text-white border-none cursor-pointer transition-colors ${
                      submitLoading ? 'bg-gray-500 cursor-not-allowed opacity-60' : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {submitLoading ? "Sauvegarde..." : "Enregistrer en brouillon"}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={(e) => handleLessonSubmit(e, true)}
                    disabled={submitLoading}
                    className={`font-display text-xl md:text-2xl py-3 px-6 rounded text-white border-none cursor-pointer transition-colors ${
                      submitLoading ? 'bg-gray-500 cursor-not-allowed opacity-60' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {submitLoading ? "Publication..." : "Publier maintenant"}
                  </button>
                </div>
              </section>
            </form>
          </div>
        </div>
      </section>

      {/* Modale pour créer une nouvelle catégorie */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-[500px] w-[90%] max-h-[80vh] overflow-auto">
            <h3 className="mt-0 mb-6 text-green-600 font-display text-xl md:text-2xl">
              + Créer une nouvelle catégorie
            </h3>
            
            <div className="mb-4">
              <label htmlFor="new-category-name" className="block mb-2 font-bold text-lg">
                Nom de la catégorie : *
              </label>
              <input
                id="new-category-name"
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Cuisine, Bricolage, Informatique..."
                className="w-full p-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-skill-accent disabled:opacity-50"
                disabled={categoryLoading}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="new-category-description" className="block mb-2 font-bold text-lg">
                Description (optionnel) :
              </label>
              <textarea
                id="new-category-description"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Décrivez brièvement cette catégorie..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded text-base resize-y focus:outline-none focus:ring-2 focus:ring-skill-accent disabled:opacity-50"
                disabled={categoryLoading}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName("");
                  setNewCategoryDescription("");
                }}
                disabled={categoryLoading}
                className="py-3 px-6 bg-gray-600 text-white border-none rounded cursor-pointer text-base hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-display"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={categoryLoading || !newCategoryName.trim()}
                className={`py-3 px-6 text-white border-none rounded cursor-pointer text-base transition-colors font-display ${
                  categoryLoading || !newCategoryName.trim() 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
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

