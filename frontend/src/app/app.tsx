import React from "react";
import { Router } from "react-router";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header";
import "./sass/index.scss";

const app = () => {
  return (
    <div>
      <BrowserRouter>
        <Header />
        <div className="container-fluid"></div>
      </BrowserRouter>
    </div>
  );
};

export default app;
