import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import DetailContainer from "../components/DetailContainer.jsx";
import LessonContainer from "../components/LessonContainer.jsx";
import ConfirmDeleteModal from "./ConfirmDeleteModal.jsx";
import { useNavigate } from "react-router-dom";

export default function LessonDetail() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
        // Fetch lesson details
    fetch(`${import.meta.env.VITE_API_URL}/api/lessons/${id}`)
      .then((response) => response.json())
      .then((data) => setLesson(data))
      

    // Fetch all lessons
    fetch(`${import.meta.env.VITE_API_URL}/api/lessons`)
      .then((response) => response.json())
      .then((data) => setLessons(Array.isArray(data) ? data : data.lessons || []))
        }, [id]);

  useEffect(() => {
    console.log(lessons);
  }, [lessons]);



  const fetchAccount = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Erreur réseau ou autorisation");
      setUserData(await response.json());
    } catch (err) {
      (err.message);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAccount();
      } catch (err) {
        (err.message);
      }
    };
    fetchData();
  }, []);

  // Remonter en haut de la page à chaque changement de cours
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

    if (!lesson) {
    return <div className="text-center p-8"><p className="text-skill-text-primary">Chargement...</p></div>;
  }

  const suggestions = lessons
    .filter(
      (l) =>
        l.category?.name === lesson.category?.name && l.id !== lesson.id
    )
    .slice(0, 2);

  // Fonction de suppression
  const handleDelete = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/lessons/${lesson.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    setShowModal(false);
    navigate("/"); // Redirige vers l'accueil ou la liste des cours après suppression
  };

  return (
    <>
      <Header />
      <main className="flex flex-col justify-between items-center mb-4">
        <DetailContainer lesson={lesson} key={lesson.id} />

        {userData?.role?.description === "Administrateur" && (
        <div className="flex justify-center my-4 px-4">
        <button
          className="font-display text-lg sm:text-xl md:text-2xl py-2.5 sm:py-2 px-6 sm:px-8 bg-skill-secondary text-white w-full sm:w-auto min-w-[200px] sm:min-w-[250px] mx-4 rounded hover:bg-skill-accent transition-colors"
          onClick={() => navigate(`/lessons`)}
        >
          Retour au catalogue
        </button>
        </div>
        )}
        <ConfirmDeleteModal
          show={showModal}
          onCancel={() => setShowModal(false)}
          onConfirm={handleDelete}
          lessonTitle={lesson.name}
        />
        {suggestions.length > 0 && (
          <section className="w-full flex flex-col items-center my-8 px-4">
            <h2 className="font-display text-center text-xl sm:text-2xl md:text-3xl my-4">Suggestions de cours :</h2>
            <article className="w-full max-w-[650px] flex flex-col sm:flex-row sm:flex-nowrap justify-center items-stretch gap-3 sm:gap-4 px-2">
              {suggestions.map((suggestion) => (
                <div 
                  key={suggestion.id}
                  className="relative bg-skill-tertiary p-3 sm:p-4 border border-skill-success/50 rounded-lg flex flex-col justify-between items-center flex-shrink-0 w-full sm:w-[310px] h-auto min-h-[320px] sm:min-h-[350px] shadow-md hover:shadow-lg transition-shadow"
                >
                  <Link to={`/lesson/${suggestion.id}`} className="no-underline text-inherit w-full flex-shrink-0">
                    <div className="w-full h-[120px] sm:h-[140px] overflow-hidden border border-black my-2 shadow-[2px_2px_rgb(122,122,122)] rounded">
                      {suggestion.media_url ? (
                        suggestion.media_url.startsWith('/uploads/') ? (
                          <img
                            className="w-full h-full object-cover object-[50%_50%]"
                            src={`${import.meta.env.VITE_API_URL}${suggestion.media_url}`}
                            alt={suggestion.media_alt || suggestion.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : suggestion.media_url.startsWith('http') ? (
                          <img
                            className="w-full h-full object-cover object-[50%_50%]"
                            src={suggestion.media_url}
                            alt={suggestion.media_alt || suggestion.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : (
                          <img
                            className="w-full h-full object-cover object-[50%_50%]"
                            src={`/Images/Photos/${suggestion.media_url}`}
                            alt={suggestion.media_alt || suggestion.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        )
                      ) : (
                        <div className="p-2 flex items-center justify-center h-full">
                          <p className="text-xs text-gray-500">Aucune image</p>
                        </div>
                      )}
                      <div className="p-2 hidden">
                        <p className="text-xs">Image non disponible</p>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="w-full flex flex-row justify-center items-center mt-1">
                    <Link to={`/categories/${suggestion.category?.id}/lessons`} className="no-underline text-inherit hover:opacity-80 transition-opacity">
                      <h5 className="font-['Raleway'] mt-1 mb-0 p-1.5 sm:p-2 bg-white border border-black rounded-md flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors text-xs sm:text-sm">
                        {suggestion.category?.name}
                      </h5>
                    </Link>
                  </div>
                  
                  <div className="flex flex-col justify-center items-start font-light w-full flex-grow mt-2">
                    <Link to={`/lesson/${suggestion.id}`} className="no-underline text-inherit w-full">
                      <h4 className="text-sm sm:text-base md:text-lg mb-2 font-display font-bold text-black text-center w-full line-clamp-2">{suggestion.title}</h4>
                    </Link>
                  </div>
                  
                  <Link to={`/lesson/${suggestion.id}`} className="no-underline text-inherit w-full flex-shrink-0">
                    <p className="px-1 sm:px-2 text-justify text-xs sm:text-sm line-clamp-2 w-full mb-2 flex-grow">{suggestion.description}</p>
                  </Link>
                </div>
              ))}
            </article>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
