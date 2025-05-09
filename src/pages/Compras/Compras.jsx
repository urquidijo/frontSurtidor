// src/components/Layout.jsx
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./compras.css";
import API_URL from "../../config/config";

const Compras = () => {

  return (
    <div className="Inventario-container">
        <h2>gestionar Compras</h2>
    </div>
  );
};

export default Compras;
