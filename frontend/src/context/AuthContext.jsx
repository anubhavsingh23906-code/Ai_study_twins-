import { createContext, useEffect, useState } from "react";
import api from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("ai-study-twin-token"));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/profile");
        setProfile(data);
      } catch (error) {
        localStorage.removeItem("ai-study-twin-token");
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token]);

  const value = {
    token,
    profile,
    loading,
    async login(payload, mode = "login") {
      const endpoint = mode === "signup" ? "/signup" : "/login";
      const { data } = await api.post(endpoint, payload);
      localStorage.setItem("ai-study-twin-token", data.access_token);
      setToken(data.access_token);
      const profileResponse = await api.get("/profile", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      setProfile(profileResponse.data);
    },
    logout() {
      localStorage.removeItem("ai-study-twin-token");
      setToken(null);
      setProfile(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
