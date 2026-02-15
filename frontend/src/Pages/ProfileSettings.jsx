import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import axios from "axios";
import {
  User,
  Lock,
  ShieldCheck,
  GraduationCap,
  Camera,
  Loader2,
  Save,
  AlertCircle,
} from "lucide-react";

// Helper Component for the Verified Badge
const CheckBadge = () => (
  <span className="h-5 w-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] ml-2">
    ✓
  </span>
);

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState("email");

  // State: Personal Information
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    student_id: "",
    phone_number: "",
    backup_email: "",
    faculty: "",
    department: "",
    year_level: "",
  });

  // State: Password
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // State: CMU Email Verify (OTP)
  const [cmuEmail, setCmuEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isCmuVerified, setIsCmuVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);
      setProvider(user.app_metadata.provider || "email");

      // ตั้งค่าเริ่มต้น email ใน input (อำนวยความสะดวก user)
      const isCmuEmailString = user.email?.endsWith("@cmu.ac.th");
      setCmuEmail(isCmuEmailString ? user.email : "");

      // ดึงข้อมูลจากตาราง profiles รวมถึงสถานะ cmu_verified
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          student_id: data.student_id || "",
          phone_number: data.phone_number || "",
          backup_email: data.backup_email || "",
          faculty: data.faculty || "",
          department: data.department || "",
          year_level: data.year_level || "",
        });

        // ใช้ค่าจาก Database เป็นหลัก
        setIsCmuVerified(data.cmu_verified === true);
      }
    } catch (error) {
      console.error("Error loading user data!", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Update Profile Data
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        ...profile,
        updated_at: new Date(),
      });

      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Error updating profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // 3. Update / Create Password
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (passwords.newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword,
      });

      if (error) throw error;
      alert("Password updated successfully!");
      setPasswords({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      alert("Error updating password: " + error.message);
    }
  };

  // 4. CMU Email Verification Logic
  const handleSendOtp = async () => {
    if (!cmuEmail.endsWith("@cmu.ac.th")) {
      alert("Please enter a valid @cmu.ac.th email address.");
      return;
    }

    setVerifying(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      await axios.post(
        "http://localhost:8000/api/auth/send-otp",
        { email: cmuEmail },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      alert(`OTP has been sent to ${cmuEmail}`);
      setOtpSent(true);
    } catch (error) {
      console.error("Send OTP Error:", error);
      const msg = error.response?.data?.detail || error.message;
      alert(`Failed to send OTP: ${msg}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      alert("Please enter a 6-digit code.");
      return;
    }

    setVerifying(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      // ยิงไปหา Backend (Backend จะเป็นคนแก้ DB profiles -> cmu_verified = true)
      await axios.post(
        "http://localhost:8000/api/auth/verify-otp",
        { email: cmuEmail, code: otpCode },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      // ถ้า Verify ผ่าน Backend แล้ว
      // 1. อัปเดต Email ใน Supabase Auth
      const { error: supabaseError } = await supabase.auth.updateUser({
        email: cmuEmail,
      });
      if (supabaseError) throw supabaseError;

      alert("Email verified successfully!");

      // 2. อัปเดต State หน้าเว็บทันที
      setIsCmuVerified(true);
      setOtpSent(false);
      setOtpCode("");
    } catch (error) {
      console.error("Verify OTP Error:", error);
      const msg = error.response?.data?.detail || error.message;
      alert(`Verification failed: ${msg}`);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <User size={32} className="text-blue-600" />
        Profile Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-blue-100 mx-auto flex items-center justify-center text-blue-600 text-3xl font-bold overflow-hidden border-4 border-white shadow-sm">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (
                    profile.first_name?.[0] ||
                    user?.email?.[0] ||
                    "U"
                  ).toUpperCase()
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md">
                <Camera size={14} />
              </button>
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-sm text-gray-500 mb-3">{user.email}</p>
            <div className="flex justify-center">
              {isCmuVerified ? (
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-medium">
                  <ShieldCheck size={12} /> CMU Student
                </span>
              ) : (
                <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-medium">
                  <AlertCircle size={12} /> Not Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* 1. Academic & Personal Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
              <GraduationCap className="text-blue-600" size={24} />
              Academic & Personal Info
            </h3>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.first_name}
                    onChange={(e) =>
                      setProfile({ ...profile, first_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.last_name}
                    onChange={(e) =>
                      setProfile({ ...profile, last_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={profile.student_id}
                    onChange={(e) =>
                      setProfile({ ...profile, student_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="640xxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year Level
                  </label>
                  <select
                    value={profile.year_level}
                    onChange={(e) =>
                      setProfile({ ...profile, year_level: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">Select Year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faculty
                  </label>
                  <input
                    type="text"
                    value={profile.faculty}
                    onChange={(e) =>
                      setProfile({ ...profile, faculty: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Engineering"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) =>
                      setProfile({ ...profile, department: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Computer Engineering"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone_number}
                    onChange={(e) =>
                      setProfile({ ...profile, phone_number: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="08x-xxx-xxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Email
                  </label>
                  <input
                    type="email"
                    value={profile.backup_email}
                    onChange={(e) =>
                      setProfile({ ...profile, backup_email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="secondary@email.com"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* 2. Security Settings */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-8">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b pb-4">
              <Lock className="text-blue-600" size={24} />
              Security Settings
            </h3>

            {/* Password Management */}
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">
                {provider === "google" ? "Create Password" : "Change Password"}
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                {provider === "google"
                  ? "Create a password to enable email/password login."
                  : "Update your password to keep your account secure."}
              </p>

              <form
                onSubmit={handlePasswordUpdate}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end"
              >
                <input
                  type="password"
                  placeholder="New Password (min 6 chars)"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>

            {/* CMU Email Verification */}
            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                Verify CMU Email
                {isCmuVerified && <CheckBadge />}
              </h4>

              {isCmuVerified ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 text-green-800">
                  <div className="bg-green-200 p-2 rounded-full">
                    <ShieldCheck size={20} className="text-green-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Account Verified</p>
                    <p className="text-xs text-green-700 opacity-80">
                      Linked to {user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Connect your academic email (@cmu.ac.th) to access student
                    privileges.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={cmuEmail}
                      onChange={(e) => setCmuEmail(e.target.value)}
                      placeholder="student@cmu.ac.th"
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                      disabled={otpSent || verifying}
                    />
                    {!otpSent && (
                      <button
                        onClick={handleSendOtp}
                        disabled={verifying}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap text-sm font-medium transition-colors disabled:bg-blue-400 flex items-center gap-2"
                      >
                        {verifying ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          "Send OTP"
                        )}
                      </button>
                    )}
                  </div>

                  {otpSent && (
                    <div className="animate-in fade-in slide-in-from-top-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <label className="block text-sm text-blue-800 mb-2 font-medium">
                        Enter 6-digit code sent to your email
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength="6"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest font-mono text-lg"
                          placeholder="000000"
                          disabled={verifying}
                        />
                        <button
                          onClick={handleVerifyOtp}
                          disabled={verifying}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap text-sm font-medium transition-colors flex items-center gap-2 disabled:bg-green-400"
                        >
                          {verifying ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            "Verify"
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode("");
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-3 block"
                      >
                        &larr; Change email or Resend
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
