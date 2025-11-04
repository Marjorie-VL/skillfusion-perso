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
    fetch(`${import.meta.env.VITE_API_URL}/api/roles`)
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

    fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}`, {

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
      <main className="flex flex-col justify-between items-center mb-4">
        <section className="flex flex-col justify-center items-center">
          <h2 className="font-['Lobster'] text-center text-2xl md:text-4xl my-8">Modifier le rôle de {user.user_name.replace(/^./, (match) => match.toUpperCase())}</h2>
        </section>

        <section className="w-screen flex flex-col md:flex-row md:flex-wrap justify-center items-center">
          <form method="post" onSubmit={(e) => handleSubmit(e)} className="w-full max-w-[850px] flex flex-col items-center">
          <div className="flex flex-col mb-2 w-3/4">
            <label htmlFor="role" className="text-xl md:text-2xl mb-1">
              Rôle (actuel : {user.role.name})
            </label>
            <select
              id="role"
              name="role"
              value={roleCurrentUser}
              onChange={(e) => setRoleCurrentUser(e.target.value)}
              required
              className="h-8 md:h-10 text-base md:text-xl p-1 my-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
            >
              <option value="">Sélectionnez un rôle</option>
              {roles.map((role) =>
              <option key={role.id} value={role.id}>{role.name}</option>
              )}
            </select>
            {errors.role && <p className="text-red-600 text-sm mt-2">{errors.role}</p>}
          </div>
            <section className="flex flex-row justify-center items-center">
              <div>
                <button 
                  type="submit" 
                  className="font-['Lobster'] text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-[20vw] m-4 rounded hover:bg-skill-accent transition-colors"
                >
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
