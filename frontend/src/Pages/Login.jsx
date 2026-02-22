import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // เพิ่ม useNavigate และ Link
import { supabase } from "../utils/supabaseClient"; // เรียกใช้ Supabase Client
import "../css/login.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // เพิ่ม State สำหรับจัดการ Loading และ Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // เคลียร์ Error เก่า

    try {
      // 1. ส่งข้อมูลไป Login กับ Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // 2. ถ้าสำเร็จ ให้เด้งไปหน้า Dashboard หรือ Home
      console.log("Login successful:", data);
      navigate("/");
    } catch (err) {
      // 3. ถ้าพลาด ให้แสดง Error Msg
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับ Google Login ผ่าน Supabase โดยตรง
  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin, // ให้เด้งกลับมาที่หน้าเว็บนี้หลังจาก Google OK
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="w-full max-w-[440px] bg-card text-card-foreground rounded-xl shadow-lg p-8 border border-border">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary">Welcome Back</h2>
            <p className="text-muted-foreground mt-1">
              Please sign in to your account
            </p>
          </div>

          {/* ส่วนแสดง Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error === "Invalid login credentials"
                ? "Invalid email or password."
                : error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <i className="fa-regular fa-envelope"></i>
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--input-background)] border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-[var(--input-background)] border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  <i
                    className={
                      showPassword
                        ? "fa-regular fa-eye-slash"
                        : "fa-regular fa-eye"
                    }
                  ></i>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Signing
                  In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium"
            >
              <img
                src="https://www.google.com/favicon.ico"
                className="w-4 h-4"
                alt="Google"
              />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium">
              <i className="fa-brands fa-github"></i>
              GitHub
            </button>
          </div>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
