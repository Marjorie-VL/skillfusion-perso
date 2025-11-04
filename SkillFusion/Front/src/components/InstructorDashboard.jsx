import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../services/api.jsx";
import { lessonService } from "../services/lessonService.js";
import { userService } from "../services/userService.js";
import { categoryService } from "../services/categoryService.js";
import { uploadService } from "../services/uploadService.js";
import ConfirmDeleteModal from "../pages/ConfirmDeleteModal";
import api from "../services/axios.js";

export default function InstructorDashboard() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [myLessons, setMyLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("cours"); // Onglet par défaut : Gestion des Cours
  
  // États pour le formulaire de profil
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  
  // États pour le formulaire de création de cours
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
  
  // États pour les modales de suppression
  const [showDeleteLessonModal, setShowDeleteLessonModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDeleteAccountConfirmModal, setShowDeleteAccountConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  // Initialiser les valeurs du formulaire avec les données utilisateur
  useEffect(() => {
    if (user) {
      setUsername(user.user_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Charger les leçons de l'instructeur (publiés + brouillons)
  useEffect(() => {
    const fetchMyLessons = async () => {
      try {
        // Récupérer tous les cours de l'instructeur (publiés + brouillons)
        const data = await lessonService.getAllLessons({ user_id: user.id });
        setMyLessons(data || []);
      } catch (error) {
        console.error("Erreur chargement leçons:", error);
        toast.error("Erreur lors du chargement de vos cours");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyLessons();
    }
  }, [user]);

  // Récupération des catégories pour le formulaire de création
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

    if (activeTab === "creer") {
      fetchCategories();
    }
  }, [activeTab]);

  // Gestion du matériel pour le formulaire de création
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

  // Gestion des étapes pour le formulaire de création
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

  // Soumission du formulaire de création de cours
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
        ? "Leçon créée et publiée avec succès !" 
        : "Leçon sauvegardée en brouillon !";
      toast.success(successMessage);
      
      // Reset du formulaire
      setSelectedCategory("");
      setLessonTitle("");
      setMediaUrl("");
      setMediaAlt("");
      setLessonContent("");
      setMaterials([{ name: "", quantity: 1 }]);
      setSteps([{ title: "", description: "", mediaUrl: "", mediaAlt: "" }]);
      
      // Recharger les cours pour mettre à jour la liste
      const data = await lessonService.getAllLessons({ user_id: user.id });
      setMyLessons(data || []);
      
      // Changer d'onglet pour voir le cours créé
      setActiveTab("cours");
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

  // Supprimer une leçon
  const deleteLesson = (lessonId) => {
    const targetLesson = myLessons.find(l => l.id === lessonId);
    setDeleteTargetId(lessonId);
    setDeleteTargetName(targetLesson?.title || "ce cours");
    setShowDeleteLessonModal(true);
  };

  const confirmDeleteLesson = async () => {
    try {
      await lessonService.deleteLesson(deleteTargetId);
      setMyLessons(prev => prev.filter(lesson => lesson.id !== deleteTargetId));
      toast.success("Cours supprimé avec succès !");
      setShowDeleteLessonModal(false);
    } catch (error) {
      console.error("Erreur suppression cours:", error);
      toast.error("Erreur lors de la suppression du cours");
      setShowDeleteLessonModal(false);
    }
  };

  // Publier/Dépublier une leçon
  const togglePublishStatus = async (lessonId, currentStatus) => {
    try {
      await lessonService.updateLesson(lessonId, { is_published: !currentStatus });
      
      setMyLessons(prev => prev.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, is_published: !currentStatus }
          : lesson
      ));
      
      toast.success(`Cours ${!currentStatus ? 'publié' : 'mis en brouillon'} !`);
    } catch (error) {
      console.error("Erreur modification statut:", error);
      toast.error("Erreur lors de la modification du statut");
    }
  };

  // Supprimer le compte
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

  // Séparer les cours publiés et brouillons
  const publishedLessons = myLessons.filter(lesson => lesson.is_published);
  const draftLessons = myLessons.filter(lesson => !lesson.is_published);

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Chargement de vos cours...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="font-['Lobster'] text-center text-4xl mb-4">Tableau de Bord Instructeur</h1>
      <p className="text-center text-xl mb-8">Bienvenue, {user.user_name?.replace(/^./, (match) => match.toUpperCase()) || user.user_name} !</p>

      {/* Barre d'onglets */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-skill-secondary/30">
        <button
          onClick={() => setActiveTab("cours")}
          className={`font-['Lobster'] text-lg md:text-xl py-3 px-6 rounded-t-lg transition-colors ${
            activeTab === "cours"
              ? "bg-skill-secondary text-white border-b-2 border-skill-secondary"
              : "bg-skill-primary/20 text-skill-text-primary hover:bg-skill-primary/30"
          }`}
        >
          Gestion des Cours
        </button>
        <button
          onClick={() => setActiveTab("creer")}
          className={`font-['Lobster'] text-lg md:text-xl py-3 px-6 rounded-t-lg transition-colors ${
            activeTab === "creer"
              ? "bg-skill-secondary text-white border-b-2 border-skill-secondary"
              : "bg-skill-primary/20 text-skill-text-primary hover:bg-skill-primary/30"
          }`}
        >
          Créer un Cours
        </button>
        <button
          onClick={() => setActiveTab("profil")}
          className={`font-['Lobster'] text-lg md:text-xl py-3 px-6 rounded-t-lg transition-colors ${
            activeTab === "profil"
              ? "bg-skill-secondary text-white border-b-2 border-skill-secondary"
              : "bg-skill-primary/20 text-skill-text-primary hover:bg-skill-primary/30"
          }`}
        >
          Profil
        </button>
        </div>

      {/* Contenu de l'onglet Gestion des Cours */}
      {activeTab === "cours" && (
        <>
      {/* Statistiques */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-skill-secondary/20 p-6 rounded-lg text-center border border-skill-secondary/40 shadow-md">
              <h3 className="m-0 text-3xl text-skill-text-primary font-['Lobster'] font-bold">{myLessons.length}</h3>
              <p className="m-0 text-skill-text-primary font-medium">Total des cours</p>
        </div>
            <div className="bg-skill-success/20 p-6 rounded-lg text-center border border-skill-success/50 shadow-md">
              <h3 className="m-0 text-3xl text-skill-text-primary font-['Lobster'] font-bold">{publishedLessons.length}</h3>
              <p className="m-0 text-skill-text-primary font-medium">Cours publiés</p>
        </div>
            <div className="bg-skill-warning/20 p-6 rounded-lg text-center border border-skill-warning/50 shadow-md">
              <h3 className="m-0 text-3xl text-skill-text-primary font-['Lobster'] font-bold">{draftLessons.length}</h3>
              <p className="m-0 text-skill-text-primary font-medium">Brouillons</p>
        </div>
      </section>

      {/* Cours publiés */}
      <section className="mb-8">
            <h2 className="font-['Lobster'] text-center text-2xl md:text-3xl my-4">Mes cours publiés</h2>
        {publishedLessons.length === 0 ? (
              <div className="text-center p-8 bg-skill-primary/10 rounded-lg border-2 border-dashed border-skill-secondary/30">
                <p className="mb-4 text-skill-text-primary">Aucun cours publié pour le moment.</p>
                <button 
                  onClick={() => setActiveTab("creer")}
                  className="font-['Lobster'] text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white rounded hover:bg-skill-accent transition-colors"
                >
              Créer votre premier cours
                </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publishedLessons.map((lesson) => (
                  <div key={lesson.id} className="border border-skill-success/40 bg-skill-success/15 rounded-lg p-6 shadow-md">
                <div className="flex justify-between items-start mb-2">
                      <h3 className="m-0 text-lg text-skill-text-primary font-['Lobster'] font-semibold">{lesson.title}</h3>
                      <span className="bg-skill-success text-white py-1 px-2 rounded text-xs font-['Lobster'] font-semibold">
                    Publié
                  </span>
                </div>
                    <p className="text-skill-text-secondary text-sm mb-4 line-clamp-3">
                  {lesson.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                      <span className="bg-skill-primary text-skill-text-primary py-1 px-2 rounded text-xs border border-skill-secondary">
                    {lesson.category?.name || "Sans catégorie"}
                  </span>
                  <Link 
                    to={`/lesson/${lesson.id}`} 
                        className="text-skill-secondary no-underline font-['Lobster'] font-bold hover:text-skill-accent"
                  >
                    Voir →
                  </Link>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link 
                    to={`/edit-lesson/${lesson.id}`}
                        className="bg-skill-secondary text-white border-none py-2 px-4 rounded no-underline text-sm cursor-pointer hover:bg-skill-accent transition-colors font-['Lobster']"
                  >
                        Modifier
                  </Link>
                  <button
                    onClick={() => togglePublishStatus(lesson.id, lesson.is_published)}
                        className="bg-skill-warning text-white border-none py-2 px-4 rounded text-sm cursor-pointer hover:bg-orange-600 transition-colors font-['Lobster']"
                  >
                        Brouillon
                  </button>
                  <button
                    onClick={() => deleteLesson(lesson.id)}
                        className="bg-skill-danger text-white border-none py-2 px-4 rounded text-sm cursor-pointer hover:bg-red-700 transition-colors font-['Lobster']"
                  >
                        Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Brouillons */}
      <section className="mb-8">
            <h2 className="font-['Lobster'] text-center text-2xl md:text-3xl my-4">Mes brouillons</h2>
        {draftLessons.length === 0 ? (
              <div className="text-center p-8 bg-skill-primary/10 rounded-lg border-2 border-dashed border-skill-secondary/30">
                <p className="text-skill-text-primary">Aucun brouillon pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {draftLessons.map((lesson) => (
                  <div key={lesson.id} className="border border-skill-warning/40 bg-skill-warning/15 rounded-lg p-4 shadow-md">
                <div className="flex justify-between items-start mb-2">
                      <h3 className="m-0 text-lg text-skill-text-primary font-['Lobster'] font-semibold">{lesson.title}</h3>
                      <span className="bg-skill-warning text-white py-1 px-2 rounded text-xs font-['Lobster'] font-semibold">
                        BROUILLON
                  </span>
                </div>
                    <p className="text-skill-text-secondary text-sm mb-4 line-clamp-3">
                  {lesson.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                      <span className="bg-skill-primary text-skill-text-primary py-1 px-2 rounded text-xs border border-skill-secondary">
                    {lesson.category?.name || "Sans catégorie"}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link 
                    to={`/edit-lesson/${lesson.id}`}
                        className="bg-skill-secondary text-white border-none py-2 px-4 rounded no-underline text-sm cursor-pointer hover:bg-skill-accent transition-colors font-['Lobster']"
                  >
                        Modifier
                  </Link>
                  <button
                    onClick={() => togglePublishStatus(lesson.id, lesson.is_published)}
                        className="bg-skill-success text-white border-none py-2 px-4 rounded text-sm cursor-pointer hover:bg-green-600 transition-colors font-['Lobster']"
                      >
                        Publier
                      </button>
                      <button
                        onClick={() => deleteLesson(lesson.id)}
                        className="bg-skill-danger text-white border-none py-2 px-4 rounded text-sm cursor-pointer hover:bg-red-700 transition-colors font-['Lobster']"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Contenu de l'onglet Créer un Cours */}
      {activeTab === "creer" && (
        <>
          <section className="mb-8">
            <h2 className="font-['Lobster'] text-center text-2xl md:text-3xl my-8">Créer un nouveau cours</h2>
            
            <div className="w-full max-w-[900px] mx-auto px-4">
              <div className="bg-skill-tertiary/30 border-2 border-skill-success/30 rounded-lg p-6 md:p-8 shadow-lg">
                <form onSubmit={handleLessonSubmit} className="w-full flex flex-col items-center">
                  {/* Catégorie */}
                  <div className="flex flex-col mb-4 w-3/4">
                    <label htmlFor="category" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-['Lobster'] font-semibold">Catégorie :</label>
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
                    <label htmlFor="title" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-['Lobster'] font-semibold">Titre :</label>
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
                    <label htmlFor="resul_img" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-['Lobster'] font-semibold">Image du résultat :</label>
                    
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
                        className="mt-2 py-1 px-2 bg-red-600 text-white border-none rounded cursor-pointer text-xs hover:bg-red-700 transition-colors font-['Lobster']"
                      >
                        Supprimer l'image
                      </button>
                    )}
                  </div>

                  {/* Description */}
                  <div className="flex flex-col mb-4 w-3/4">
                    <label htmlFor="lesson-desc" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-['Lobster'] font-semibold">Description :</label>
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
                    <label className="text-xl md:text-2xl mb-1 text-skill-text-primary font-['Lobster'] font-semibold">Matériel :</label>
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
                            className="bg-red-600 text-white border-none py-2 px-3 rounded cursor-pointer hover:bg-red-700 transition-colors font-['Lobster']"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-end w-full">
                      <button 
                        className="h-6 text-sm font-bold py-2 px-3 bg-skill-secondary rounded flex flex-col justify-center items-center hover:bg-skill-accent transition-colors font-['Lobster']" 
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
                      <label htmlFor={`step-title-${i}`} className="text-xl md:text-2xl mb-1 text-skill-text-primary font-['Lobster'] font-semibold">Etape {i + 1} :</label>
                      <input
                        className="h-8 md:h-10 text-base md:text-xl p-2 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                        type="text"
                        id={`step-title-${i}`}
                        placeholder="Titre de l'étape"
                        value={step.title}
                        onChange={e => updateStep(i, "title", e.target.value)}
                      />
                      <label htmlFor={`step-desc-${i}`} className="text-xl md:text-2xl mb-1 mt-2 text-skill-text-primary font-['Lobster'] font-semibold">Description :</label>
                      <textarea
                        id={`step-desc-${i}`}
                        placeholder="Description de l'étape"
                        value={step.description}
                        onChange={e => updateStep(i, "description", e.target.value)}
                        className="h-20 text-base md:text-xl p-2 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent resize-y"
                      />
                      <label htmlFor={`step-media-${i}`} className="text-xl md:text-2xl mb-1 mt-2 text-skill-text-primary font-['Lobster'] font-semibold">Média de l'étape :</label>
                      
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
                          className="mb-2 py-1 px-2 bg-red-600 text-white border-none rounded cursor-pointer text-xs hover:bg-red-700 transition-colors font-['Lobster']"
                        >
                          Supprimer le média
                        </button>
                      )}
                      <label htmlFor={`step-media-alt-${i}`} className="text-xl md:text-2xl mb-1 mt-2 text-skill-text-primary font-['Lobster'] font-semibold">Description du média :</label>
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
                            className="h-6 text-sm font-bold py-2 px-3 bg-skill-secondary rounded flex flex-col justify-center items-center hover:bg-skill-accent transition-colors font-['Lobster']" 
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
                        className={`font-['Lobster'] text-xl md:text-2xl py-3 px-6 rounded text-white border-none cursor-pointer transition-colors ${
                          submitLoading ? 'bg-gray-500 cursor-not-allowed opacity-60' : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                      >
                        {submitLoading ? "Sauvegarde..." : "Enregistrer en brouillon"}
                      </button>
                      
                      <button 
                        type="button" 
                        onClick={(e) => handleLessonSubmit(e, true)}
                        disabled={submitLoading}
                        className={`font-['Lobster'] text-xl md:text-2xl py-3 px-6 rounded text-white border-none cursor-pointer transition-colors ${
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
                <h3 className="mt-0 mb-6 text-green-600 font-['Lobster'] text-xl md:text-2xl">
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
                    className="py-3 px-6 bg-gray-600 text-white border-none rounded cursor-pointer text-base hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-['Lobster']"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={categoryLoading || !newCategoryName.trim()}
                    className={`py-3 px-6 text-white border-none rounded cursor-pointer text-base transition-colors font-['Lobster'] ${
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
      )}

      {/* Contenu de l'onglet Profil */}
      {activeTab === "profil" && (
        <section className="mb-8">
          <h2 className="font-['Lobster'] text-center text-2xl md:text-3xl my-8">Mon Profil</h2>
          
          <div className="w-full max-w-[900px] mx-auto px-4">
            <div className="bg-skill-tertiary/30 border-2 border-skill-success/30 rounded-lg p-6 md:p-8 shadow-lg">
              <form method="post" onSubmit={async (e) => {
                e.preventDefault();
                setProfileErrors({});

                // Vérification qu'au moins un champ est modifié
                if (!username && !email && !password) {
                  toast.error("Veuillez modifier au moins un champ");
                  return;
                }

                // Préparer les données à envoyer (seulement les champs modifiés)
                const updateData = {};
                if (username && username !== user.user_name) updateData.user_name = username;
                if (email && email !== user.email) updateData.email = email;
                if (password) updateData.password = password;

                if (Object.keys(updateData).length === 0) {
                  toast.error("Veuillez modifier au moins un champ");
                  return;
                }

                try {
                  await api.patch(`/users/${user.id}`, updateData);
                  
                  // Récupérer les données utilisateur mises à jour
                  const updatedUserResponse = await api.get('/me');
                  const updatedUserData = updatedUserResponse.data;

                  // Mettre à jour le contexte
                  setUser(updatedUserData);
                  localStorage.setItem('user', JSON.stringify(updatedUserData));

                  // Message de succès
                  const modifiedFields = [];
                  if (updateData.user_name) modifiedFields.push("nom d'utilisateur");
                  if (updateData.email) modifiedFields.push("email");
                  if (updateData.password) modifiedFields.push("mot de passe");
                  
                  const message = `Modification réussie ! ${modifiedFields.join(", ")} ${modifiedFields.length > 1 ? "ont été" : "a été"} mis à jour ✅`;
                  toast.success(message);

                  // Réinitialiser le mot de passe
                  setPassword("");

                } catch (error) {
                  if (error.response) {
                    const { status, data } = error.response;
                    
                    if (status === 400 && data.errors) {
                      setProfileErrors(data.errors);
                    } else if (data.message) {
                      toast.error(data.message);
                    } else {
                      toast.error("Erreur lors de la modification du profil");
                    }
                  } else {
                    toast.error("Erreur lors de la modification du profil");
                  }
                }
              }} className="w-full flex flex-col items-center">
                <div className="flex flex-col mb-4 w-3/4">
                  <label htmlFor="username" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-['Lobster'] font-semibold">Nom d'utilisateur :</label>
                  <input
                    className="h-8 md:h-10 text-base md:text-xl p-2 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                    type="text"
                    placeholder={user?.user_name || ""}
                    name="username"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  {profileErrors.user_name && <p className="text-red-600 text-sm mt-2">{profileErrors.user_name}</p>}
                </div>

                <div className="flex flex-col mb-4 w-3/4">
                  <label htmlFor="email" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-['Lobster'] font-semibold">E-mail :</label>
                  <input
                    className="h-8 md:h-10 text-base md:text-xl p-2 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                    type="email"
                    placeholder={user?.email || ""}
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {profileErrors.email && <p className="text-red-600 text-sm mt-2">{profileErrors.email}</p>}
                </div>

                <div className="flex flex-col mb-4 w-3/4">
                  <label htmlFor="password" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-['Lobster'] font-semibold">Nouveau mot de passe :</label>
                  <div className="relative">
                    <input
                      className="h-8 md:h-10 text-base md:text-xl p-2 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent pr-10"
                      type={showPassword ? "text" : "password"}
                      placeholder="Laissez vide pour ne pas changer"
                      name="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-skill-text-primary hover:text-skill-secondary transition-colors cursor-pointer"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {profileErrors.password && <p className="text-red-600 text-sm mt-2">{profileErrors.password}</p>}
                </div>

                <div className="flex flex-row justify-center items-center mt-4">
                  <button 
                    type="submit" 
                    className="font-['Lobster'] text-xl md:text-2xl py-2 px-6 bg-skill-secondary text-white rounded hover:bg-skill-accent transition-colors"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </form>

              {/* Bouton supprimer le compte */}
              <section className="mt-8 text-center border-t border-skill-secondary/30 pt-6">
        <button
          onClick={deleteAccount}
          disabled={deleteLoading}
                  className="bg-skill-danger text-white border-none py-2 px-4 rounded cursor-pointer text-sm font-['Lobster'] hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
                  {deleteLoading ? "Suppression en cours..." : "Supprimer mon compte"}
        </button>
      </section>
            </div>
          </div>
        </section>
      )}

      {/* Modales de confirmation suppression */}
      <ConfirmDeleteModal
        show={showDeleteLessonModal}
        onCancel={() => setShowDeleteLessonModal(false)}
        onConfirm={confirmDeleteLesson}
        title="Supprimer le cours"
        message={`Voulez-vous vraiment supprimer le cours "${deleteTargetName}" ?`}
      />

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
    </div>
  );
}
