import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();

    if (res.ok) {
      navigate("/login");
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSignup} className="bg-white p-6 rounded shadow w-80 space-y-4">
        <h2 className="text-xl font-bold">Signup</h2>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
               className="w-full border p-2 rounded" placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
               className="w-full border p-2 rounded" placeholder="Password" required />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border p-2 rounded">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button className="w-full bg-green-500 text-white py-2 rounded">Signup</button>
        {message && <p className="text-red-500">{message}</p>}
      </form>
    </div>
  );
}
