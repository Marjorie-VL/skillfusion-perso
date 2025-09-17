import LessonContainer from "../components/LessonContainer.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useEffect, useState } from "react";


export default function Lessons() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/lessons`)
      .then((response) => response.json())
      .then((data) => setLessons(Array.isArray(data) ? data : data.lessons || []))
      .catch((error) => console.error("Erreur API:", error))
  }, []);

  return (
    <>
      <Header />
      <main>
        <section className="home__articles">
          
          <h2>Nos cours</h2>

          <article className="lessons">
              <LessonContainer lessons={lessons} />
          </article>
        </section>
      </main>

      <Footer />
    </>
  );
}


