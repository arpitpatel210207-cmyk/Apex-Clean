"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    setError("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) return setError("Email is required");
    if (!emailRegex.test(normalizedEmail)) return setError("Invalid email format");
    if (!gmailRegex.test(normalizedEmail))
      return setError("Use a Google email only (example@gmail.com)");
    if (!password) return setError("Password is required");
    if (!passwordRegex.test(password)) {
      return setError(
        "Password must be at least 8 characters with uppercase, lowercase, number and special character"
      );
    }

    toast.success("Login successful");
    setTimeout(() => (window.location.href = "/dashboard"), 800);
  }

  return (
    <Card className="flex min-h-screen items-center justify-center bg-bg px-3 py-6 sm:px-6">
        
      <CardContent className="surface w-full max-w-sm space-y-4 p-5 sm:p-8">

        <h1 className="page-heading text-brand text-3xl sm:text-4xl">
          Login
        </h1>

        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <p className="text-danger text-sm">{error}</p>}
        {/* <p className="text-xs text-mutetext">
          Use your Gmail and a strong password.
        </p> */}

       <button
  onClick={handleSubmit}
  className="w-full rounded-xl bg-[#6fc4e7] text-[#121212] border border-[#6fc4e7]/60 py-2.5 font-medium hover:bg-[#6fc4e7]/90 transition"
>
  Login
</button>


        <p className="text-center text-sm text-mutetext">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-brand hover:underline">
            Sign up
          </a>
        </p>

      </CardContent>
    </Card>
  );
}
