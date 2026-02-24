"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");

  function handleChange(key: string, value: string) {
    setForm({ ...form, [key]: value });
  }

  function handleSubmit() {
    setError("");
    const normalizedEmail = form.email.trim().toLowerCase();

    if (!form.name) return setError("Full name required");
    if (!emailRegex.test(normalizedEmail)) return setError("Invalid email");
    if (!gmailRegex.test(normalizedEmail))
      return setError("Use a Google email only (example@gmail.com)");
    if (!passwordRegex.test(form.password))
      return setError(
        "Password must be at least 8 characters with uppercase, lowercase, number and special character"
      );
    if (form.confirm !== form.password)
      return setError("Passwords do not match");

    toast.success("Account created");
    setTimeout(() => (window.location.href = "/dashboard"), 800);
  }

  return (
    <Card className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="surface w-full max-w-sm p-8 space-y-4">

        <h1 className="page-heading text-brand">
          Sign Up
        </h1>

        <input
          className="input"
          placeholder="Full Name"
          value={form.name}
          onChange={e => handleChange("name", e.target.value)}
        />

        <input
          className="input"
          placeholder="Email"
          value={form.email}
          onChange={e => handleChange("email", e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => handleChange("password", e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Confirm Password"
          value={form.confirm}
          onChange={e => handleChange("confirm", e.target.value)}
        />

        {error && <p className="text-danger text-sm">{error}</p>}
        <p className="text-xs text-mutetext">
          Use your Gmail and a strong password.
        </p>

        <button
          onClick={handleSubmit}
          className="w-full rounded-xl bg-[#6fc4e7] text-[#121212] border border-[#6fc4e7]/60 py-2.5 font-medium hover:bg-[#6fc4e7]/90 transition"
        >
          Create Account
        </button>

        <p className="text-center text-sm text-mutetext">
          Already have an account?{" "}
          <a href="/login" className="text-brand hover:underline">
            Login
          </a>
        </p>

      </div>
    </Card>
  );
}
