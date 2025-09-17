import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function ErrorMaintenance({code = 503, message = "Page Maintenance"}) {

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