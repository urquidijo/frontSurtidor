import { useEffect, useState } from "react";
import API_URL from "../../config/config";
import { showToast } from "../../utils/toastUtils";
import {
  mostrarConfirmacion,
  mostrarExito,
  mostrarError,
} from "../../utils/alertUtils";

const SeguridadSucursal = () => {
  return (
    <div className="p-8 text-[#f1f1f1]">
      <h2 className="text-[1.8rem] mb-6 text-[#00d1b2] font-bold">
        Gestión de Seguridad
      </h2>
    </div>
  );
};

export default SeguridadSucursal;
