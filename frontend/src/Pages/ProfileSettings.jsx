import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Building,
  Save,
  Lock,
  ShieldCheck,
  CreditCard,
  GraduationCap,
  Camera,
  Loader2,
} from "lucide-react";

export default function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState("email");

  // State ข้อมูลส่วนตัว
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

  // State สำหรับ Password
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // State สำหรับ CMU Email Verify (OTP)
  const [cmuEmail, setCmuEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isCmuVerified, setIsCmuVerified] = useState(false);

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

      if (!user) throw new Error("No user");

      setUser(user);
      setProvider(user.app_metadata.provider || "email");
      setCmuEmail(user.email.includes("@cmu.ac.th") ? user.email : "");
      setIsCmuVerified(user.email.includes("@cmu.ac.th")); // เช็คเบื้องต้น

      // ดึงข้อมูลจากตาราง profiles
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfile(data);
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

  // 4. CMU Email Verification Logic (OTP Simulation)
  const handleSendOtp = async () => {
    if (!cmuEmail.endsWith("@cmu.ac.th")) {
      alert("Please enter a valid @cmu.ac.th email address.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("You are not logged in");
      return;
    }

    await axios.post(
      "http://localhost:8000/api/auth/send-otp",
      { email: cmuEmail },
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    alert("OTP sent successfully");
    setOtpSent(true);
  };

  const handleVerifyOtp = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("You are not logged in");
      return;
    }

    await axios.post(
      "http://localhost:8000/api/auth/verify-otp",
      { email: cmuEmail, code: otpCode },
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    alert("Verified successfully");
    setIsCmuVerified(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
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
        {/* Left Column: Navigation / Quick Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-blue-100 mx-auto flex items-center justify-center text-blue-600 text-3xl font-bold overflow-hidden">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile.first_name?.[0] || user?.email?.[0]?.toUpperCase()
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                <Camera size={14} />
              </button>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-3 flex justify-center">
              {isCmuVerified ? (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} /> CMU Verified
                </span>
              ) : (
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  Wait for Verification
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* 1. Personal Information Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                    value={profile.first_name || ""}
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
                    value={profile.last_name || ""}
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
                    value={profile.student_id || ""}
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
                    value={profile.year_level || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, year_level: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                    value={profile.faculty || ""}
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
                    value={profile.department || ""}
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
                    value={profile.phone_number || ""}
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
                    value={profile.backup_email || ""}
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
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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

          {/* 2. Account Security Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-8">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Lock className="text-blue-600" size={24} />
              Security Settings
            </h3>

            {/* Password Management */}
            <div className="border-b border-gray-100 pb-6">
              <h4 className="text-md font-medium text-gray-800 mb-3">
                {provider === "google" ? "Create Password" : "Change Password"}
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                {provider === "google"
                  ? "Since you logged in via Google, you can create a password to login with email/password as well."
                  : "Update your password to keep your account secure."}
              </p>

              <form
                onSubmit={handlePasswordUpdate}
                className="space-y-3 max-w-md"
              >
                <div>
                  <input
                    type="password"
                    placeholder="New Password (min 6 chars)"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
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
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* CMU Email Verification */}
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                Verify CMU Email
                {isCmuVerified && <CheckBadge />}
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Connect your academic email (@cmu.ac.th) to access student
                privileges.
              </p>

              {!isCmuVerified ? (
                <div className="max-w-md space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={cmuEmail}
                      onChange={(e) => setCmuEmail(e.target.value)}
                      placeholder="student@cmu.ac.th"
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      disabled={otpSent}
                    />
                    {!otpSent && (
                      <button
                        onClick={handleSendOtp}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap text-sm"
                      >
                        Send OTP
                      </button>
                    )}
                  </div>

                  {/* OTP Input Section */}
                  {otpSent && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm text-gray-600 mb-1">
                        Enter 6-digit code sent to your email
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength="6"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest font-mono text-lg"
                        />
                        <button
                          onClick={handleVerifyOtp}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap text-sm"
                        >
                          Verify Code
                        </button>
                      </div>
                      <button
                        onClick={() => setOtpSent(false)}
                        className="text-xs text-blue-600 hover:underline mt-2"
                      >
                        Change email or Resend
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3 text-green-700">
                  <div className="bg-green-100 p-2 rounded-full">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Verified Account</p>
                    <p className="text-xs">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CheckBadge = () => (
  <span className="h-5 w-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px]">
    ✓
  </span>
);
