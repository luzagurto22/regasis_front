import axios from "axios";

export default function AuthorizedUser() {
  // Obtener el token de autenticación desde el almacenamiento local
  const getToken = () => {
    const tokenString = JSON.parse(localStorage.getItem("token"));
    return tokenString;
  };

  // Guardar el token en el almacenamiento local
  const saveToken = (token) => {
    localStorage.setItem("token", JSON.stringify(token));
  };

  // Eliminar el token del almacenamiento local
  const deleteToken = () => {
    localStorage.removeItem("token");
  };

  // Crear la instancia de Axios con la configuración base
  const http = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:5000", // Base URL de la API
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`, // Si tu API usa autenticación
    },
  });

  return {
    getToken,
    saveToken,
    deleteToken,
    http,
  };
}