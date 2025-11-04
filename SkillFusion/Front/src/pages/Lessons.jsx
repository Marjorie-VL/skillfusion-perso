import LessonContainer from "../components/LessonContainer.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useEffect, useState } from "react";


export default function Lessons() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/lessons`)
      .then((response) => response.json())
      .then((data) => setLessons(Array.isArray(data) ? data : data.lessons || []))
      .catch((error) => console.error("Erreur API:", error))
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-col justify-between items-center mb-4 flex-grow">
        <section className="w-full max-w-[95%] flex flex-col justify-center items-center px-4">
          <h2 className="font-display text-center text-2xl md:text-4xl my-8 px-0 md:px-40">Nos cours</h2>

          <article className="w-full">
              <LessonContainer lessons={lessons} />
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}


