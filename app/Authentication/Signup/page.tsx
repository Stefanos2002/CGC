"use client";
import { FormEvent, useState } from "react";
import bcrypt from "bcryptjs";
import { FaGoogle, FaGithub } from "react-icons/fa";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function Signup() {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [incoming, setIncoming] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRe, setShowPasswordRe] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessages([]);

    const formData = new FormData(event.target as HTMLFormElement);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    let password = formData.get("password") as string;
    let passwordre = formData.get("passwordre") as string;

    const errors: string[] = [];

    const usernameRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W]{10,}$/;
    if (!usernameRegex.test(username)) {
      errors.push(
        "Username must be at least 10 characters, include one capital letter and one number.",
      );
    }

    const passwordRegex = /^(?=.*[A-Z])[A-Za-z\d\W]{10,}$/;
    if (!passwordRegex.test(password)) {
      errors.push(
        "Password must be at least 10 characters and include one capital letter.",
      );
    }

    if (password !== passwordre) {
      errors.push("Passwords do not match.");
    }

    if (errors.length > 0) {
      setErrorMessages(errors);
      setIncoming("");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const data = { username, email, password: hashedPassword };

    setIncoming("");
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setLoading(false);
        setIncoming("");
        setErrorMessages([result.message]);
      } else {
        setLoading(false);
        setIncoming("A verification message has been sent to your email.");
      }
    } catch (error) {
      console.error("Error during user addition:", error);
      setIncoming("");
      setErrorMessages(["An unexpected error occurred."]);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full overflow-auto bg-[url('/assets/images/dishonored.webp')] bg-cover bg-center">
      <div className="relative z-10 backdrop-blur-sm flex flex-col items-center w-full px-4 py-12">
        {/* Card */}
        <div className="w-full max-w-md bg-black/75 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-white/10">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors duration-200 mb-4"
            >
              <FiArrowLeft size={13} />
              Back to home
            </Link>
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
            <p className="text-sm text-white/50 mt-1">Join the community</p>
          </div>

          {/* Social login */}
          <div className="px-8 pt-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => signIn("github", { callbackUrl: "/" })}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/15 bg-white/8 text-white/80 text-sm font-medium hover:bg-white/15 hover:border-white/25 transition-all duration-200 cursor-pointer"
              >
                <FaGithub size={16} />
                GitHub
              </button>
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/15 bg-white/8 text-white/80 text-sm font-medium hover:bg-white/15 hover:border-white/25 transition-all duration-200 cursor-pointer"
              >
                <FaGoogle size={16} />
                Google
              </button>
            </div>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30 uppercase tracking-widest">
                or
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="px-8 pb-8 flex flex-col gap-4"
          >
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="text-xs font-medium text-white/60 uppercase tracking-wider"
              >
                Username
              </label>
              <div className="relative">
                <FiUser
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                  size={15}
                />
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="At least 10 chars, 1 capital, 1 number"
                  className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/30 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-violet-500/70 focus:bg-white/12 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-white/60 uppercase tracking-wider"
              >
                Email
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                  size={15}
                />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/30 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-violet-500/70 focus:bg-white/12 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-white/60 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                  size={15}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min 10 chars, 1 capital letter"
                  className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/30 text-sm rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-violet-500/70 focus:bg-white/12 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="passwordre"
                className="text-xs font-medium text-white/60 uppercase tracking-wider"
              >
                Confirm Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                  size={15}
                />
                <input
                  id="passwordre"
                  type={showPasswordRe ? "text" : "password"}
                  name="passwordre"
                  placeholder="Repeat your password"
                  className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/30 text-sm rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-violet-500/70 focus:bg-white/12 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordRe((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                  aria-label={
                    showPasswordRe ? "Hide password" : "Show password"
                  }
                >
                  {showPasswordRe ? (
                    <FiEyeOff size={15} />
                  ) : (
                    <FiEye size={15} />
                  )}
                </button>
              </div>
            </div>

            {/* Error messages */}
            {errorMessages.length > 0 && (
              <div className="flex flex-col gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                {errorMessages.map((message, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-red-400 text-sm"
                  >
                    <FiAlertCircle className="mt-0.5 shrink-0" size={14} />
                    <span>{message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Success message */}
            {incoming && (
              <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm">
                <FiCheckCircle className="mt-0.5 shrink-0" size={14} />
                <span>{incoming}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40 disabled:cursor-not-allowed text-white font-semibold text-sm tracking-wide transition-all duration-200 cursor-pointer shadow-lg shadow-violet-900/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Sign in link */}
            <p className="text-center text-sm text-white/40 mt-1">
              Already have an account?{" "}
              <Link
                href="/Authentication/Signin"
                className="text-violet-400 hover:text-violet-300 transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
