import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../utils/auth";

export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      saveToken(data.token);
      setToken(data.token);
      navigate("/dashboard");
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow w-80 space-y-4">
        <h2 className="text-xl font-bold">Login</h2>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
               className="w-full border p-2 rounded" placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
               className="w-full border p-2 rounded" placeholder="Password" required />
        <button className="w-full bg-blue-500 text-white py-2 rounded">Login</button>
        {message && <p className="text-red-500">{message}</p>}
      </form>
    </div>
  );
}
