import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function ErrorPage({code = 404, message = "Page introuvable"}) {

  console.log(Error) 
  return (
      <>
      <Header />
      <div>
        <h2> {code} - {message}</h2>
      </div>
       <Footer />
       </>
    );
  }