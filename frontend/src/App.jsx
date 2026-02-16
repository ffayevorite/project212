import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import Components
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

// Import Pages
import Home from "./Pages/Home";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import Catalog from "./Pages/Catalog";
import AuthSuccess from "./Pages/AuthSuccess";
import AuthCallback from "./Pages/AuthCallback";
import ProfileSettings from "./Pages/ProfileSettings";
import AdminDashboard from "./Pages/AdminDashboard";
import { CssVarsProvider } from "@mui/joy/styles";

export default function App() {
  return (
    <CssVarsProvider>
      <Router>
        {/* ใช้ Flexbox เพื่อจัดการ Layout:
        - min-h-screen: ให้ความสูงเต็มจอเสมอ
        - flex-col: เรียงบนลงล่าง
      */}
        <div className="flex flex-col min-h-screen bg-gray-50">
          {/* Header อยู่บนสุด แสดงทุกหน้า */}
          <Header />

          {/* Main Content: flex-grow จะดัน Footer ลงไปข้างล่างสุด */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth-success" element={<AuthSuccess />} />
              <Route path="/auth-callback" element={<AuthCallback />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          {/* Footer อยู่ล่างสุด แสดงทุกหน้า */}
          <Footer />
        </div>
      </Router>
    </CssVarsProvider>
  );
}
