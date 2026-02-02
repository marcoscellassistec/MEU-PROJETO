import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService.js";

const AuthContext = createContext(null);

const storageKey = "assistec_auth";

const getStoredUser = () => {
  const raw = localStorage.getItem(storageKey);
  return raw ? JSON.parse(raw) : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      localStorage.setItem(storageKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [user]);

  const signInWithEmail = async (email, password) => {
    setLoading(true);
    setError("");
    try {
      if (import.meta.env.DEV) {
        console.info("[auth] login email", { email, password });
      }
      const logged = await authService.signInWithEmail(email, password);
      setUser(logged);
      return logged;
    } catch (err) {
      setError("Não foi possível autenticar. Verifique suas credenciais.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      if (import.meta.env.DEV) {
        console.info("[auth] login google");
      }
      const logged = await authService.signInWithGoogle();
      setUser(logged);
      return logged;
    } catch (err) {
      setError("Não foi possível autenticar com Google.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError("");
    try {
      if (import.meta.env.DEV) {
        console.info("[auth] logout");
      }
      await authService.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({ user, loading, error, signInWithEmail, signInWithGoogle, signOut }),
    [user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
