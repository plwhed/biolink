"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

type Mode = "login" | "register";

export default function AuthCard({
  initialMode,
  initialUsername = "",
}: {
  initialMode: Mode;
  initialUsername?: string;
}) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [username, setUsername] = useState(initialUsername);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [tos, setTos] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setError("");
    setTos(false);
    setConfirm("");
    setEmail("");
    setPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "register") {
      if (!username.trim() || !email.trim() || !password) {
        setError("Please fill in every field.");
        setLoading(false);
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setError("That email doesn't look right.");
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        setLoading(false);
        return;
      }
      if (password !== confirm) {
        setError("Passwords don't match.");
        setLoading(false);
        return;
      }
      if (!tos) {
        setError("Please accept the Terms of Service.");
        setLoading(false);
        return;
      }
    } else {
      if (!username.trim() || !password) {
        setError("Please enter your username and password.");
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = mode === "register" ? "/api/register" : "/api/login";
      const body =
        mode === "register"
          ? { username, email, password }
          : { username, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const isRegister = mode === "register";

  const inputBase = "w-full rounded-xl border bg-black/40 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/30 disabled:opacity-50 disabled:cursor-not-allowed";
  const labelBase = "mb-2 block text-sm font-medium text-white/80";

  return (
    <>
      {/* Mode Switcher - Pill Style */}
      <div className="relative w-full max-w-xs mx-auto mb-8" role="tablist" aria-label="Auth mode">
        <div className="flex gap-1 bg-white/5 rounded-full p-1 ring-1 ring-white/10">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => switchMode("login")}
            className={`relative z-10 flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
              mode === "login"
                ? "bg-pink-400 text-pink-950 shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            onClick={() => switchMode("register")}
            className={`relative z-10 flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
              isRegister
                ? "bg-pink-400 text-pink-950 shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Sign up
          </button>
        </div>
      </div>

      <motion.div
        key={mode}
        initial={reduce ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-white">
            {isRegister ? "Create your page" : "Welcome back"}
          </h1>
          <p className="mt-2 text-center text-sm text-white/50">
            {isRegister
              ? "It only takes a few seconds — no card needed."
              : "Log in to manage your links."}
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor={`${mode}-username`} className="mb-2 block text-sm font-medium text-white/80">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400/70" aria-hidden="true">@</span>
              <input
                id={`${mode}-username`}
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                placeholder="yourusername"
                autoComplete="username"
                className={`${inputBase} pl-9 border-white/10 focus:border-pink-400 focus:ring-4 focus:ring-pink-400/15`}
                disabled={loading}
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-white/80">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="you@example.com"
                autoComplete="email"
                className={`${inputBase} border-white/10 focus:border-pink-400 focus:ring-4 focus:ring-pink-400/15`}
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label htmlFor={`${mode}-password`} className="mb-2 block text-sm font-medium text-white/80">
              Password
            </label>
            <input
              id={`${mode}-password`}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={isRegister ? "new-password" : "current-password"}
              className={`${inputBase} border-white/10 focus:border-pink-400 focus:ring-4 focus:ring-pink-400/15`}
              disabled={loading}
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="register-confirm" className="mb-2 block text-sm font-medium text-white/80">
                Confirm password
              </label>
              <input
                id="register-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`${inputBase} border-white/10 focus:border-pink-400 focus:ring-4 focus:ring-pink-400/15`}
                disabled={loading}
              />
            </div>
          )}

          {isRegister && (
            <div className="flex items-start gap-3">
              <button
                type="button"
                role="checkbox"
                aria-checked={tos}
                onClick={() => setTos(!tos)}
                className={`flex h-5 w-5 shrink-0 mt-0.5 items-center justify-center rounded-md border transition-all ${
                  tos
                    ? "border-pink-400 bg-pink-400"
                    : "border-white/15 bg-white/5 hover:border-white/30"
                }`}
              >
                <svg
                  className={`h-3 w-3 text-pink-950 transition-opacity ${tos ? "opacity-100" : "opacity-0"}`}
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 6l3 3 5-5" />
                </svg>
              </button>
              <span className="text-sm text-white/60 leading-relaxed">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-medium text-pink-400 underline underline-offset-2 hover:text-pink-300"
                >
                  Terms of Service
                </Link>
                .
              </span>
            </div>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-red-400"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-full bg-pink-400 py-3.5 text-base font-semibold text-pink-950 shadow-lg shadow-pink-500/25 transition hover:bg-pink-300 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Please wait…"
              : isRegister
              ? "Create account"
              : "Log in"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(isRegister ? "login" : "register")}
            className="font-medium text-pink-400 hover:text-pink-300 underline underline-offset-2"
          >
            {isRegister ? "Log in" : "Sign up"}
          </button>
        </p>
      </motion.div>
    </>
  );
}