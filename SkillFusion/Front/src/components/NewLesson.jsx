import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

export default function NewLesson() {
  // États pour les catégories, le chargement et les erreurs
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({});

  // États pour le formulaire
  const [selectedCategory, setSelectedCategory] = useState("");
  const [name, setName] = useState("");
  const [media, setMedia] = useState("");
  const [text,setText] = useState("");
  const [materials, setMaterials] = useState([""]);
  const [steps, setSteps] = useState([{ title: "", description: "", media: "" }]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const navigate = useNavigate();
  


  // Récupération des catégories au chargement
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/categories`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des catégories");
        }
        return response.json();
      })
      .then((data) => {
        setCategories(Array.isArray(data) ? data : data.categories || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Gestion du matériel
  const addMaterial = () => setMaterials([...materials, ""]);
  const updateMaterial = (i, value) => {
    const newMaterials = [...materials];
    newMaterials[i] = value;
    setMaterials(newMaterials);
  };

  // Gestion des étapes
  const addStep = () => setSteps([...steps, { title: "", description: "", media: "" }]);
  const updateStep = (i, field, value) => {
    const newSteps = [...steps];
    newSteps[i][field] = value;
    setSteps(newSteps);
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);

    // Construction de la payload
    const userId = localStorage.getItem("userId");
    console.log("userId récupéré:", userId);

    const lessonData = {
      category_id: selectedCategory,
      name,
      media,
      text,
      users_id: userId,
      materials: materials.filter((m) => m.trim() !== ""),
      steps: steps.filter((s) => s.title.trim() || s.description.trim() || s.media.trim()),
    };
    console.log("Payload envoyée :", lessonData);

    try {
      const response = await fetch("http://localhost:3000/lesson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(lessonData),
      });
      console.log(localStorage.getItem("token"));
      console.log("Réponse du serveur :", response);
      const data = await response.json();
      console.log("Contenu retourné :", data);
      console.log("Status :", response.status);


      if (!response.ok) throw new Error("Erreur lors de la création de la leçon");

      // Reset et redirection
      setSelectedCategory("");
      setName("");
      setMedia("");
      setText("");
      setMaterials([""]);
      setSteps([{ title: "", description: "", media: "" }]);
      navigate("/"); // Redirection après succès
    } catch (err) {
      setSubmitError(err.message);
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
              {error && <div style={{ color: "red" }}>Erreur : {error}</div>}
              <select
                className="search-bar input-bar"
                id="category"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                disabled={loading || !!error}
                required
              >
                <option value="">--Choisissez votre catégorie--</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            {/* Titre */}
            <div className="form">
              <label htmlFor="title">Titre :</label>
              <input
                className="search-bar input-bar"
                type="text"
                id="title"
                placeholder="Titre du cours"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            {/* Image résultat */}
            <div className="form">
              <label htmlFor="resul_img">Image du résultat :</label>
              <input
                className="search-bar input-bar"
                type="text"
                id="resul_img"
                placeholder="URL de l'image"
                value={media}
                onChange={e => setMedia(e.target.value)}
              />
            </div>
            {/* Description */}
            <div className="form">
              <label htmlFor="lesson-desc">Description :</label>
              <textarea
                id="lesson-desc"
                placeholder="Description du cours"
                value={text}
                onChange={e => setText(e.target.value)}
                required
              />
            </div>
            {/* Matériel */}
            <div className="form">
              <label>Matériel :</label>
              {materials.map((mat, i) => (
                <input
                  key={i}
                  className="search-bar input-bar"
                  type="text"
                  placeholder="Outil, matériaux, etc."
                  value={mat}
                  onChange={e => updateMaterial(i, e.target.value)}
                />
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
                <label htmlFor={`step-media-${i}`}>Média éventuel :</label>
                <input
                  className="search-bar input-bar"
                  type="text"
                  id={`step-media-${i}`}
                  placeholder="URL de l'image ou de la vidéo"
                  value={step.media}
                  onChange={e => updateStep(i, "media", e.target.value)}
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
            {/* Bouton d'envoi */}
            <section className="see-more">
              <button type="submit" className="main-button" disabled={submitLoading}>
                {submitLoading ? "Envoi..." : "Envoyer"}
              </button>
              {submitError && <div style={{ color: "red" }}>{submitError}</div>}
            </section>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
