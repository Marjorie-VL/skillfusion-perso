import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/api.jsx";

export default function ProfilChange() {
  const [username, setUsername] = useState("");
  const [email, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  // Récupération des données utilisateur
  const {user} = useAuth();
 
  const navigate = useNavigate();

  // Fonction pour l'envoi du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // ✅ Vérification des champs vides
    if (!username || !email || !password) {
      toast.error("Tous les champs sont obligatoires");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}`, {

      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ username, email, password }),
    })
    .then(async (res) => {
      const data = await res.json();

     if (!res.ok) {
        // S'il y a un objet d'erreurs côté backend, on le récupère
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.message) {
          toast.error(data.message);
        } 
        throw new Error("Erreur lors de l'inscription");
      }
      return data;

    })
      .then((data) => {
        console.log(data); // Affiche les données retournées par le serveur (succès de l'inscription)

        toast.success("Modification réussie! ✅");
        navigate("/"); // Redirection
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };
  return (
    <>
      <Header />
      <main>
        <section className="head-banner">
          <h2>Modifier mon profil</h2>
        </section>

        <section className="lessons">
          <form method="post" onSubmit={(e) => handleSubmit(e)}>
            <div className="form">
              <label htmlFor="username">User Name :</label>
              <input
                className="search-bar input-bar"
                type="text"
                placeholder="Username"
                name="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && <p style={{ color: "red" }}>{errors.username}</p>}            
              </div>
            <div className="form">
              <label htmlFor="mail">E-mail :</label>
              <input
                className="search-bar input-bar"
                type="email"
                placeholder="E-mail"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setMail(e.target.value)}
              />
            {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}            
              </div>
            <div className="form">
              <label htmlFor="password">Mot de passe :</label>
              <input
                className="search-bar input-bar"
                type="password"
                placeholder="Mot de passe"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
             {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
            </div>
            <section className="see-more">
              <div>
                <button type="submit" className="main-button">
                  Enregistrer
                </button>
              </div>
            </section>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}

