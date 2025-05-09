import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
  const getToken = () => {
    return sessionStorage.getItem("authToken");
  };
  const token = getToken();

  if (token) {
    return <Outlet />;
  } else {
    return <Navigate to="/" />;
  }
};
export default PrivateRoutes;
