import React, { useState } from "react";
import { Button } from "../components/ui/Button.jsx";
import { useAuth } from "../hooks/useAuth.jsx";

export const Login = () => {
  const { signInWithEmail, signInWithGoogle, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Assistec OS</h1>
        <p className="mt-2 text-sm text-slate-500">
          Faça login para acessar a sua operação.
        </p>
        <div className="mt-6 space-y-4">
          <label className="text-sm text-slate-500">
            E-mail
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-500">
            Senha
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
              {error}
            </div>
          )}
          <Button
            className="w-full"
            onClick={() => signInWithEmail(email, password)}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={signInWithGoogle}
            disabled={loading}
          >
            Entrar com Google
          </Button>
        </div>
      </div>
    </div>
  );
};
