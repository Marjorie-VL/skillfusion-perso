import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/api"; 
import { toast } from "react-toastify";

export default function LoginForm() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth(); // 👈
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mail, password }),
    })
    .then((res) => {
      if (!res.ok) throw new Error("Identifiants invalides");
      return res.json();
    })
    .then((data) => {
      localStorage.setItem("token", data.token);
      return fetch(`${import.meta.env.VITE_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
    })
    .then(res => res.json())
    .then(userData => {
      setUser(userData); // 👈 mise à jour du contexte global
      toast.success("Inscription réussie !");
      navigate("/");
    })
    .catch((err) => {
      toast.error(err.message || "Erreur lors de la connexion ");
    });
  };
  return (
    <>
      <section className="lessons">
        <form onSubmit={handleSubmit} action="#" method="post">
          <div className="form">
            <label htmlFor="mail">E-mail :</label>
            <input
              className="search-bar input-bar"
              placeholder="E-mail"
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              required
            />
          </div>
          <div className="form">
            <label htmlFor="password">Mot de passe :</label>
            <input
              className="search-bar input-bar"
              placeholder="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <section className="see-more">
        <button type="submit" className="main-button">
          Connexion
        </button>
      </section>
        </form>
      </section>
      
    </>
  );
}
