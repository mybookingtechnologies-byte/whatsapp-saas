"use client";
"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Input from "../ui/input";
import Button from "../ui/button";
import Toast from "../ui/toast";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-2">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-xl p-8 sm:p-10 flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">Admin Login</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="w-full"
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="w-full"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!!loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          {error && (
            <div className="w-full">
              <Toast message={error} type="error" onClose={() => setError("")} />
            </div>
          )}
        </div>
        <div className="text-center text-xs text-gray-400 mt-4">
          &copy; {new Date().getFullYear()} Admin Panel. All rights reserved.
        </div>
      </div>
    </div>
  );
}
