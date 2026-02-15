// React: AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase client จะจับ session จาก URL hash ให้อัตโนมัติ
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Login สำเร็จ! เก็บ state หรือ redirect
        navigate("/");
      }
    });
  }, []);

  return <div>Loading...</div>;
};

export default AuthCallback;
