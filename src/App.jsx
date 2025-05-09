import "./styles.css";
import Router from "./Router/routes.jsx";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Router />
      <ToastContainer/>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
