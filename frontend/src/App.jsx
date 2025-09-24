import React, { useState, useEffect } from "react";
import axios from "./axios";
import { jwtDecode } from "jwt-decode";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [tel, setTel] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  
  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setUser({
        id: decoded.id,
        role: decoded.role,
        username: decoded.username,
      }); // Set basic ก่อน
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchMe(); // Fetch full info
    }
  }, [token]);

  const fetchMe = async () => {
    try {
      const res = await axios.get("/me");
      setUser(res.data); // Update ด้วย full info รวม firstname, lastname, tel
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/login", { username, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user); // Set basic info ก่อน
      fetchMe(); // Fetch full info ทันที
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password || !firstname || !lastname || !tel) {
      alert(
        "Please fill in all required fields: username, password, firstname, lastname, and tel."
      );
      return;
    }
    if (!["user", "manager"].includes(role)) {
      alert("Invalid role selected.");
      return;
    }
    // Relaxed phone number validation
    if (!/^.{1,20}$/.test(tel)) {
      alert("Phone number must be 1-20 characters.");
      return;
    }
    try {
      await axios.post("/register", {
        username,
        password,
        role,
        firstname,
        lastname,
        tel,
      });
      alert("Registered. Now login.");
      setIsLogin(true);
    } catch (err) {
      alert(err.response?.data?.error || "Error during registration");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  if (!user) {
    return (
      <div
        className="flex justify-center items-center min-h-screen flex-col bg-background px-4"
        style={{ backgroundColor: "var(--background)" }}
      >
        <h2 className="text-3xl font-bold mb-6">
          {isLogin ? "Login" : "Register"}
        </h2>
        <form
          onSubmit={isLogin ? handleLogin : handleRegister}
          className="w-full max-w-md"
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
          />
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Firstname"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="Lastname"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="Tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
              />
            </>
          )}
          {!isLogin && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
            </select>
          )}

          <button
            type="submit"
            className="bg-primary text-[var(--primary-text)] p-3 w-full rounded-lg text-lg font-semibold hover:bg-opacity-90"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-primary text-lg underline hover:text-opacity-80"
        >
          {isLogin ? "Switch to Register" : "Switch to Login"}
        </button>
      </div>
    );
  }

  return <TaskManager user={user} logout={logout} />;
}

function TaskManager({ user, logout }) {
  const [tasks, setTasks] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [colorTemplate, setColorTemplate] = useState("theme1");
  const [newTask, setNewTask] = useState({
    name: "",
    status: "progress",
    assignedto: "", // Changed to match backend field name
    isupcoming: false, // Changed to match backend field name
    duedate: "", // Changed to match backend field name
  });
  const [newSchedule, setNewSchedule] = useState({
    date: "",
    startTime: "",
    endTime: "",
    name: "",
    members: [],
    color: "yellow",
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  useEffect(() => {
    const root = document.documentElement;
    let primary = "#1976d2";
    let secondary = "#dc004e";
    let background = "#fff";
    let paper = "#fff";
    let primaryText = "#000000";
    switch (colorTemplate) {
      case "theme1":
        primary = "#87CEEB";
        secondary = "#B0E0E6";
        background = "#F0F8FF";
        paper = "#FFFACD";
        primaryText = "#000000";
        break;
      case "theme2":
        primary = "#4CAF50";
        secondary = "#8BC34A";
        background = "#9EE294";
        paper = "#FFFFFF";
        primaryText = "#FFFFFF";
        break;
      case "theme3":
        primary = "#FF5722";
        secondary = "#FF9800";
        background = "#AC7853";
        paper = "#FFFACD";
        primaryText = "#FFFFFF";
        break;
      case "theme4":
        primary = "#388E3C";
        secondary = "#66BB6A";
        background = "#5A6C5A";
        paper = "#FFFACD";
        primaryText = "#FFFFFF";
        break;
      default:
        break;
    }
    root.style.setProperty("--primary", primary);
    root.style.setProperty("--secondary", secondary);
    root.style.setProperty("--background", background);
    root.style.setProperty("--paper", paper);
    root.style.setProperty("--primary-text", primaryText);
  }, [colorTemplate]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch users first to ensure usersList is populated before tasks
      const usersRes = await axios.get("/users");
      const fetchedUsers =
        user.role === "manager"
          ? usersRes.data
          : usersRes.data.filter(
              (u) =>
                u.id === user.id || tasks.some((t) => t.assignedto === u.id)
            );
      setUsersList(fetchedUsers);
      console.log("Fetched users:", fetchedUsers); // Debugging

      const tasksRes = await axios.get("/tasks");
      setTasks(tasksRes.data);
      console.log("Fetched tasks:", tasksRes.data); // Debugging

      const schedRes = await axios.get("/schedules");
      setSchedules(schedRes.data);
      console.log("Fetched schedules:", schedRes.data); // Debugging
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleCheck = async (id, checked) => {
    try {
      await axios.put(`/tasks/${id}`, { checked });
      fetchData();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/tasks", newTask);
      setShowTaskModal(false);
      setNewTask({
        name: "",
        status: "progress",
        assignedto: "",
        isupcoming: false,
        duedate: "",
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add task");
    }
  };

  const addSchedule = async (e) => {
    e.preventDefault();
    const time = `${newSchedule.date} ${newSchedule.startTime} - ${newSchedule.endTime}`;
    try {
      await axios.post("/schedules", { ...newSchedule, time });
      setShowScheduleModal(false);
      setNewSchedule({
        date: "",
        startTime: "",
        endTime: "",
        name: "",
        members: [],
        color: "yellow",
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add schedule");
    }
  };

  const currentTasks = tasks.filter((t) => !t.isupcoming);
  const upcomingTasks = tasks.filter((t) => t.isupcoming);

  if (showSettings) {
    return (
      <div
        className="min-h-screen p-6"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* ปุ่ม Back */}
        <button
          onClick={() => setShowSettings(false)}
          className="bg-gray-300 text-gray-800 px-5 py-3 rounded-xl text-lg mb-6 shadow hover:bg-opacity-90 transition"
        >
          Back to Main
        </button>

        {/* Layout หลัก */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Details */}
          <div className="col-span-1 bg-[var(--paper)] p-6 rounded-2xl shadow-md">
            <h3 className="text-2xl font-semibold mb-4">User Details</h3>
            <div className="space-y-2 text-lg">
              <p>
                <span className="font-semibold">UserName:</span> {user.username}
              </p>
              <p>
                <span className="font-semibold">ชื่อ:</span> {user.firstname}
              </p>
              <p>
                <span className="font-semibold">นามสกุล:</span> {user.lastname}
              </p>
              <p>
                <span className="font-semibold">เบอร์โทร:</span> {user.tel}
              </p>
              <p className="pt-2 text-xl">
                <span className="font-semibold">Role:</span>{" "}
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
            </div>
          </div>

          {/* Settings */}
          <div className="col-span-2 bg-[var(--paper)] p-6 rounded-2xl shadow-md">
            <h2 className="text-3xl font-semibold mb-6">Settings</h2>

            {/* Font Size */}
            <div className="mb-6">
              <label className="block text-lg mb-2">Adjust Font Size</label>
              <input
                type="range"
                min={12}
                max={24}
                step={1}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
              <span className="text-sm text-gray-600 mt-1 block">
                {fontSize}px
              </span>
            </div>

            {/* Color Template */}
            <div className="mb-6">
              <label className="block text-lg mb-2">Color Template</label>
              <select
                value={colorTemplate}
                onChange={(e) => setColorTemplate(e.target.value)}
                className="border border-gray-300 p-3 w-full rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
              >
                <option value="theme1">Light Blue & Cream</option>
                <option value="theme2">Green & White</option>
                <option value="theme3">Dark Orange & Cream</option>
                <option value="theme4">Dark Green & Cream</option>
              </select>
            </div>

            {/* Graph */}
            <h3 className="text-2xl font-semibold mb-4">Work Graph</h3>
            <div className="h-80 w-full bg-gray-100 rounded-xl flex items-center justify-center text-lg text-gray-600 shadow-inner">
              Mock Graph (Coming Soon)
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col lg:flex-row min-h-screen bg-background"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="flex-1 p-6">
        <div className="flex items-center mb-6">
          <span className="text-2xl font-semibold">
            {user.username || "Unknown User"}
          </span>
          <button
            onClick={() => setShowSettings(true)}
            className="ml-auto p-2 text-gray-600 hover:text-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button
            onClick={logout}
            className="ml-4 bg-red-300 text-white p-3 rounded-lg text-lg hover:bg-opacity-90"
          >
            Logout
          </button>
        </div>
        {user.role === "manager" && (
          <button
            onClick={() => setShowTaskModal(true)}
            className="bg-blue-300 text-white p-3 rounded-lg text-lg hover:bg-opacity-90 mb-4 w-full sm:w-auto"
          >
            Add Task
          </button>
        )}
       <div className="space-y-8 p-6" style={{ backgroundColor: "#F5F5DC" }}>
  {/* Current Tasks */}
  <div>
    <h2 className="text-2xl font-bold mb-4">Current Tasks</h2>
    <div className="grid gap-4 sm:grid-rows-2 lg:grid-rows-3">
      {currentTasks.map((task) => (
        <div
          key={task.id}
          className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-3 hover:shadow-lg transition"
        >
          {/* Header: Checkbox + ชื่อ */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id={`item-${task.id}`}
              checked={task.checked}
              onChange={(e) => handleCheck(task.id, e.target.checked)}
              className="w-8 h-16 accent-[var(--primary)] mt-1"
            />
            <label
              htmlFor={`item-${task.id}`}
              className="flex-1 cursor-pointer text-2xl font-semibold leading-snug break-words"
            >
             {task.name}
            </label>
          </div>

          {/* Status + Details */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
            <span
              className={`px-3 py-1 rounded-lg text-white font-medium text-center ${
                task.status === "progress"
                  ? "bg-blue-300"
                  : task.status === "approved"
                  ? "bg-green-300"
                  : task.status === "review"
                  ? "bg-yellow-300"
                  : "bg-red-300"
              }`}
            >
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
            <span className="flex-1">
               Assign To :  {usersList.find((u) => u.id === task.assignedto)?.username ||
                "Unknown User"}
            </span>
            <span className="whitespace-nowrap text-gray-300">
              {task.duedate || "No due date"}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>

 <div>
  <h2 className="text-2xl font-bold mb-4">Upcoming Tasks</h2>

  {upcomingTasks.length === 0 ? (
    <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-center text-gray-300 text-lg italic">
      No Upcoming Tasks
    </div>
  ) : (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {upcomingTasks.map((task) => (
        <div
          key={task.id}
          className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-3 hover:shadow-lg transition"
        >
          {/* Task Header */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id={`item-${task.id}`}
              checked={task.checked}
              onChange={(e) => handleCheck(task.id, e.target.checked)}
              className="w-6 h-6 accent-[var(--primary)] mt-1"
            />
            <label
              htmlFor={`item-${task.id}`}
              className="flex-1 cursor-pointer text-lg font-semibold leading-snug break-words"
            >
              {task.name}
            </label>
          </div>

          {/* Task Info */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
            <span
              className={`px-3 py-1 rounded-lg text-white font-medium text-center ${
                task.status === "progress"
                  ? "bg-blue-300"
                  : task.status === "approved"
                  ? "bg-green-300"
                  : task.status === "review"
                  ? "bg-yellow-300"
                  : "bg-red-300"
              }`}
            >
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
            <span className="flex-1">
              {usersList.find((u) => u.id === task.assignedto)?.username ||
                "Unknown User"}
            </span>
            <span className="whitespace-nowrap text-gray-300">
              {task.duedate || "No due date"}
            </span>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

</div>

      </div>
      <div className="w-full lg:w-1/3 p-6 bg-paper border-t lg:border-l lg:border-t-0">
        <div className="flex items-center mb-6">
          <p className="text-2xl font-semibold">Schedule</p>
          {user.role === "manager" && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="ml-auto bg-yellow-300 text-[var(--primary-text)] p-3 rounded-lg text-lg hover:bg-opacity-90"
            style={{ color : "black"}}>
              Add Schedule
            </button>
          )}
        </div>
        <div className="space-y-4">
          {schedules.map((s) => (
            <div
              key={s.id}
              className={`p-6 border-b text-lg`}
              style={{backgroundColor:"#F5F5DC"}}
            >
              <div className="mb-4">
                <div className="text-gray-600 mb-1">{s.time}</div>
                <div className="text-xl font-semibold">{s.name}</div>
              </div>
              <div className="flex flex-wrap gap-4">
                {s.members.map((mId) => {
                  const u = usersList.find((u) => u.id === mId);
                  return u ? (
                    <div key={u.id} className="flex items-center">
                      <img
                        src={u.avatar}
                        alt={u.username}
                        className="w-10 h-10 rounded-full mr-2"
                      />
                      <span>{u.username}</span>
                    </div>
                  ) : (
                    <div key={mId}>Unknown User</div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-paper p-6 w-full max-w-md text-black">
            <form onSubmit={addTask}>
              <label className="block text-lg mb-2">Task Name</label>
              <input
                type="text"
                value={newTask.name}
                onChange={(e) =>
                  setNewTask({ ...newTask, name: e.target.value })
                }
                required
                className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
              />
              <label className="block text-lg mb-2">Status</label>
              <select
                value={newTask.status}
                onChange={(e) =>
                  setNewTask({ ...newTask, status: e.target.value })
                }
                className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
              >
                <option value="progress">Progress</option>
                <option value="approved">Approved</option>
                <option value="review">Review</option>
                <option value="waiting">Waiting</option>
              </select>
              <label className="block text-lg mb-2">Assign To</label>
              <select
                value={newTask.assignedto}
                onChange={(e) =>
                  setNewTask({ ...newTask, assignedto: e.target.value })
                }
                required
                className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
              >
                <option value="">Assign To</option>
                {usersList
                  .filter((u) => u.role === "user")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
              </select>
              <label className="block text-lg mb-2">Due Date</label>
              <input
                type="date"
                value={newTask.duedate}
                onChange={(e) =>
                  setNewTask({ ...newTask, duedate: e.target.value })
                }
                className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
              />
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={newTask.isupcoming}
                  onChange={(e) =>
                    setNewTask({ ...newTask, isupcoming: e.target.checked })
                  }
                  className="w-6 h-6 accent-primary mr-2"
                />
                <label className="text-lg">Upcoming</label>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-black text-white p-3 rounded-lg text-lg hover:bg-opacity-90 flex-1"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="bg-gray-300 text-white p-3 rounded-lg text-lg hover:bg-opacity-90 flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-paper p-6 w-full max-w-md">
            <form onSubmit={addSchedule}>
              <label className="block text-lg mb-2">Date</label>
              <input
                type="date"
                value={newSchedule.date}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, date: e.target.value })
                }
                required
                className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
              />
              <label className="block text-lg mb-2">Start Time</label>
              <input
                type="time"
                value={newSchedule.startTime}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, startTime: e.target.value })
                }
                required
                className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
              />
              <label className="block text-lg mb-2">End Time</label>
              <input
                type="time"
                value={newSchedule.endTime}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, endTime: e.target.value })
                }
                required
                className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
              />
              <label className="block text-lg mb-2">Schedule Name</label>
              <input
                type="text"
                value={newSchedule.name}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, name: e.target.value })
                }
                required
                className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
              />
              <label className="block text-lg mb-2">Members</label>
              <select
                multiple
                value={newSchedule.members}
                onChange={(e) =>
                  setNewSchedule({
                    ...newSchedule,
                    members: Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    ),
                  })
                }
                className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
              >
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
              </select>
              <label className="block text-lg mb-2">Color</label>
              <select
                value={newSchedule.color}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, color: e.target.value })
                }
                className="border border-gray-300 p-3 w-full mb-4 rounded-lg text-lg focus:outline-none focus:border-primary"
              >
                <option value="yellow">Yellow</option>
                <option value="blue">Blue</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
              </select>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-300 text-white p-3 rounded-lg text-lg hover:bg-opacity-90 flex-1"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="bg-gray-300 text-white p-3 rounded-lg text-lg hover:bg-opacity-90 flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
