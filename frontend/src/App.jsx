import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./Pages/Home";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import Catalog from "./Pages/Catalog";
import AuthSuccess from "./Pages/AuthSuccess";
import AuthCallback from "./Pages/AuthCallback";
import ProfileSettings from "./Pages/ProfileSettings";

export default function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  );
}
