import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/api.jsx";

export default function ProfilChange() {
  
  const [roles, setRoles] = useState([]);
  const [roleCurrentUser, setRoleCurrentUser] = useState([]);
  const [errors, setErrors] = useState({});

  // Récupération des données utilisateur
  const {user} = useAuth();
 
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/roles`)
      .then((res) => res.json())
      .then((data) => {
        setRoles(Array.isArray(data) ? data : data.roles || []);
      })
      .catch((error) => console.error('Erreur de chargement des rôles:', error));
  }, []); // [] garantit que ça ne tourne qu’une fois au montage du composant

  // Fonction pour l'envoi du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // ✅ Vérification des champs vides
    if (!roleCurrentUser) {
      toast.error("Tous les champs sont obligatoires");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/user/${user.id}`, {

      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({roleCurrentUser}),
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
        console.log(data); // Affiche les données retournées par le serveur (succès de la modification)

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
          <h2>Modifier le rôle de {user.pseudo.replace(/^./, (match) => match.toUpperCase())}</h2>
        </section>

        <section className="lessons">
          <form method="post" onSubmit={(e) => handleSubmit(e)}>
          <div className="form">
            <label htmlFor="role">
              Rôle (actuel : {user.role.description})
            </label>
            <select
              id="role"
              name="role"
              value={roleCurrentUser}
              onChange={(e) => setRoleCurrentUser(e.target.value)}
              required
            >
              <option value="">Sélectionnez un rôle</option>
              {roles.map((role) =>
              <option value={role.id}>{role.description}</option>
              )}
            </select>
            {errors.role && <p style={{ color: "red" }}>{errors.role}</p>}
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
