import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
    return <div className="text-center p-8"><p>Chargement...</p></div>;
  }

  const suggestions = lessons
    .filter(
      (l) =>
        l.category?.name === lesson.category?.name && l.name !== lesson.title
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
        <div className="flex justify-center my-4">
        <button
          className="font-['Lobster'] text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-[20vw] m-4 rounded hover:bg-skill-accent transition-colors"
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
        <section className="w-full flex flex-col items-center my-8">
        <h2 className="font-['Lobster'] text-center text-2xl md:text-4xl my-4">Suggestion de cours :</h2>
          <article className="w-screen flex flex-col md:flex-row md:flex-wrap justify-center items-center">
            <LessonContainer lessons={suggestions} />
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
