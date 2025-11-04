import LessonContainer from "../components/LessonContainer.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useEffect, useState } from "react";
import axios from "axios";


export default function Home() {
  const [lessons, setLessons] = useState([]);
  
  console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);

  useEffect(() => {
    console.log('🌐 Fetching lessons from:', `${import.meta.env.VITE_API_URL}/api/lessons`);
    
    axios.get(`${import.meta.env.VITE_API_URL}/api/lessons`)
      .then((response) => {
        console.log('📡 Response status:', response.status);
        console.log('📡 Response data:', response.data);
        // S'adapte à la structure {lessons: [...]} ou directement [...]
        const lessonsData = Array.isArray(response.data) ? response.data : response.data.lessons || [];
        console.log('📚 Processed lessons:', lessonsData.length);
        setLessons(lessonsData);
      })
      .catch((error) => {
        console.error("❌ Erreur API:", error);
        console.error("❌ Error details:", error.message);
        if (error.response) {
          console.error("❌ Response error:", error.response.data);
          console.error("❌ Status:", error.response.status);
        }
      });
  }, []);

  // Tri par date descendante
  const latestLessons = [...lessons]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">   
      <Header />
      <main className="flex flex-col justify-between items-center mb-4 flex-grow">
        {/* Section Introduction avec background-image */}
        <section className="relative p-4 md:p-[6rem_10rem] text-lg md:text-2xl font-medium">
          {/* Background image avec ::before effect */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.53] -z-10 pointer-events-none"
            style={{
              backgroundImage: "url('/Images/img2accueil.png')",
              backgroundPosition: 'center top'
            }}
          ></div>
          <p className="text-justify indent-12 md:indent-12 px-4 max-w-[95vw] text-skill-text-primary">
            <strong>Bienvenue sur SkillFusion !</strong> Nous sommes une plateforme éducative dédiée à l'apprentissage du bricolage et au Do It Yourself (DIY). Elle a pour objectif de rendre le bricolage accessible à toutes et tous et à distance.
          </p>
          <p className="text-justify indent-12 md:indent-12 px-4 max-w-[95vw] text-skill-text-primary">
            Nous nous adressons aux amateurs de bricolage, aux professionnels du bâtiment, aux propriétaires de biens immobiliers, aux locataires, aux apprentis bricoleurs, etc... <strong>Tout le monde est le bienvenu ! </strong>
          </p>
          <p className="text-justify indent-12 md:indent-12 px-4 max-w-[95vw] text-skill-text-primary">
            En tant que visiteur, vous aurez accès à des cours de qualité, écrit par nos instructeurs qualifiés et expérimentés. Cependant, si vous vous inscrivez, vous aurez accès à des <strong>fonctionnalités exclusives </strong> telles que notre forum pour poser vos questions, la possibilité de gérer votre progression à l'aide de votre tableau de bord... <strong>A tout de suite !</strong>
          </p>
        </section>

        <section className="max-w-[95%] flex flex-col justify-center items-center">
          <h2 className="my-8 font-display text-center px-0 md:px-40 text-2xl md:text-4xl">Cours à la une</h2>
          <article className="w-screen flex flex-col md:flex-row md:flex-wrap justify-center items-center">
              <LessonContainer lessons={latestLessons} />
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}
