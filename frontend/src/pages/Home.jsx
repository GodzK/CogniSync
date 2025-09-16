import React, { useEffect, useState } from "react";

export default function Home({ token, onLogout }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(() => setProfile(null));
  }, [token]);

  return (
    <div className="max-w-lg mx-auto bg-green-100 p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold">Home Page</h2>
      {profile ? (
        <div className="mt-4">
          <p>Welcome, {profile.user.email}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
      <button
        onClick={onLogout}
        className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
