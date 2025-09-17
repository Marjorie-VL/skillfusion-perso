import React, {useState} from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../services/api.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ContainerCategories({ categories }) {
  const navigate = useNavigate();
  const [categoryList,setCategoryList] = useState(
      categories?.categories || categories || []
  );

  // Récupération des données utilisateur
  const {user} = useAuth();
  if (!categoryList.length){
    return <div>Aucune catégorie trouvée.</div>;
  }
  // Supprimer une catégorie
    const handleClickDelete = async (categoryId) => { 
    let isSure = confirm("Etes-vous sûr(e) ?");
    if(!isSure){
      return
    }else{
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/${categoryId}`,{
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        // body: JSON.stringify({user }),
        });
          if (!response.ok) {
            throw new Error("Erreur lors de la suppression de la catégorie");
          }
          // Mise à jour de la liste locale après suppression
            setCategoryList((prev) =>
            prev.filter((category) => category.id !== categoryId)
          );
          toast.success("Suppression de la catégorie réussie !");
      } catch (err) {
        (err.message);
      }
    }
  }
  /// Modifier une catégorie
  function handleClickUpdate() {
    navigate(`/erreurMaintenance`);
    // Ou navigate(`/categories/${categoryId}/edit`);
  }
  return (
    <section className="list-category" aria-label="Liste des catégories">
      {categoryList.map((category) => (
        <section className="category-box" key={category.name}>
          <div className="category-box__desc">
            <p> </p>
            <Link
              to={`/categories/${category.id}/lessons` }
              style={{ textDecoration: "none", color: "inherit" }}
              key={category.id}
              >
              <h3>{category.name.replace(/^./, (match) => match.toUpperCase())}</h3>
            </Link>
            {/* Affiche les boutons de CRUD si l'utilisateur a les droits d'admin  ou affiche les boutons 'CRU' s'il est prof*/}
            {user ? (
              <div className="crud">
                <a onClick={() => handleClickUpdate(category.id)} style={{ cursor: 'pointer' }}>
                  <h4>{((user.role_id === 1|| user.role_id === 2)) ?("\ud83d\udcdd"):(" ")}</h4>
                </a>
                <a onClick={() => handleClickDelete(category.id)} style={{ cursor: 'pointer' }}>
                    <h4>{((user.role_id === 1)) ?("\ud83d\uddd1"):(" ")}</h4>
                </a>
              </div>
              ):(
              <p></p>
              )
            }
          </div>
        </section>
          
      ))}

      {/* Affiche le bouton 'ajouter' si l'utilisateur a les droits d'admin ou prof*/}

      <div className="see-more"></div>
      {user && Number(user.role_id) <3 ?
        (
        <Link to="/newcategory">
          <button type="submit" className="main-button">Nouvelle catégorie
          </button>
        </Link>
        ):(
        <p></p>
        )
      }
    </section>
  );
}