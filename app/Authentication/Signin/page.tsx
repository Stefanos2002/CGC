"use client";
import { FormEvent, useEffect, useState, Suspense } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function Signin() {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "EmailInUse") {
      setErrorMessages([
        "This email is already associated with another account. Please use a different email or log in with the existing credentials.",
      ]);
    }
  }, [error]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessages([]);

    const formData = new FormData(event.target as HTMLFormElement);
    const email = formData.get("email") as string;
    let password = formData.get("password") as string;

    const response = await fetch(`/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error("Failed to check email existence");
    }

    if (
      result.data.provider === "google" ||
      result.data.provider === "github" ||
      result.data.provider === "facebook"
    ) {
      setLoading(false);
      setErrorMessages([
        `This email is already associated with another provider: ${result.data.provider}`,
      ]);
      return;
    }

    setLoading(true);
    try {
      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/",
      });

      if (signInResult?.error) {
        setLoading(false);
        setErrorMessages(["Email or password is incorrect."]);
      } else {
        router.push(signInResult?.url || "/");
      }
    } catch (err) {
      setLoading(false);
      console.error("Error during credentials' check:", err);
      setErrorMessages(["An unexpected error occurred."]);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full overflow-auto bg-[url('/assets/images/moon-knight.webp')] bg-cover bg-center">
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
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-sm text-white/50 mt-1">
              Sign in to your account
            </p>
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
                  className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/30 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-violet-500/70 transition-all duration-200"
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
                  placeholder="Your password"
                  className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/30 text-sm rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-violet-500/70 transition-all duration-200"
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
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Sign up link */}
            <p className="text-center text-sm text-white/40 mt-1">
              Don&apos;t have an account?{" "}
              <Link
                href="/Authentication/Signup"
                className="text-violet-400 hover:text-violet-300 transition-colors duration-200"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SigninFallBack() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Signin />
    </Suspense>
  );
}
