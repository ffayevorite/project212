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
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Catalog from "./Pages/Catalog";
import Cart from "./Pages/Cart";
import AuthSuccess from "./Pages/AuthSuccess";
import AuthCallback from "./Pages/AuthCallback";
import Settings from "./Pages/Settings";
import Profile from "./Pages/Profile";
import Admin from "./Pages/Admin";
import { CssVarsProvider } from "@mui/joy/styles";

import { CartProvider } from "./contexts/CartContext"; // path ตามที่คุณสร้าง
export default function App() {
  return (
    <CartProvider>
      <CssVarsProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth-success" element={<AuthSuccess />} />
                <Route path="/auth-callback" element={<AuthCallback />} />
                <Route path="/setting" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CssVarsProvider>
    </CartProvider>
  );
}
