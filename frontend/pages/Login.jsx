import React, { useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/login", { username, password });
      setToken(res.data.token);
      setUserRole(res.data.role);
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  if (token) {
    return <Dashboard token={token} userRole={userRole} />;
  }

  return (
    <div style={{ padding: "50px" }}>
      <h2>Login to CogniSync</h2>
      <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
