import React, { useEffect, useState } from "react";
import { clearToken, getToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ token, setToken }) {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    const decoded = JSON.parse(atob(token.split(".")[1])); // decode JWT payload
    setUser(decoded);

    const url = decoded.role === "admin"
      ? "http://localhost:3000/admin/tasks"
      : "http://localhost:3000/tasks";

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const logout = () => {
    clearToken();
    setToken(null);
    navigate("/login");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard ({user?.role})</h1>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>
      <div className="mt-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded shadow mb-2">
            <h3 className="font-bold">{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
