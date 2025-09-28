import React, { useState, useEffect } from "react";
import axios from "./axios";
import swal from "sweetalert";
import Chart from "./components/Chart";
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
  console.log("Current user:", user);
}, [user]);

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
      console.log("Login CLick");
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
        style={{
          backgroundColor: "var(--background)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2
          className="text-3xl font-bold mb-6"
          aria-label={isLogin ? "Login form" : "Register form"}
        >
          {isLogin ? "Login" : "Register"}
        </h2>
        <form
          onSubmit={isLogin ? handleLogin : handleRegister}
          className="w-full max-w-md space-y-4"
          aria-labelledby={isLogin ? "login-heading" : "register-heading"}
        >
          <div>
            <label
              htmlFor="username"
              className="block text-lg mb-2 font-medium"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 p-4 w-full rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-primary"
              aria-required="true"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-lg mb-2 font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 p-4 w-full rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-primary"
              aria-required="true"
            />
          </div>
          {!isLogin && (
            <>
              <div>
                <label
                  htmlFor="firstname"
                  className="block text-lg mb-2 font-medium"
                >
                  First Name
                </label>
                <input
                  id="firstname"
                  type="text"
                  placeholder="Enter your first name"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  className="border border-gray-300 p-4 w-full rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-primary"
                  aria-required="true"
                />
              </div>
              <div>
                <label
                  htmlFor="lastname"
                  className="block text-lg mb-2 font-medium"
                >
                  Last Name
                </label>
                <input
                  id="lastname"
                  type="text"
                  placeholder="Enter your last name"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  className="border border-gray-300 p-4 w-full rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-primary"
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="tel" className="block text-lg mb-2 font-medium">
                  Phone Number
                </label>
                <input
                  id="tel"
                  type="text"
                  placeholder="Enter your phone number"
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                  className="border border-gray-300 p-4 w-full rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-primary"
                  aria-required="true"
                />
              </div>
              <div>
                <label
                  htmlFor="role"
                  className="block text-lg mb-2 font-medium"
                >
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="border border-gray-300 p-4 w-full rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-primary"
                  aria-required="true"
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </>
          )}
          <button
            type="submit"
            className="bg-primary text-[var(--primary-text)] p-4 w-full rounded-lg text-lg font-semibold hover:bg-opacity-90 focus:ring-4 focus:ring-primary"
            aria-label={isLogin ? "Submit login" : "Submit registration"}
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-primary text-lg underline hover:text-opacity-80 focus:outline-none focus:ring-4 focus:ring-primary"
          aria-label={isLogin ? "Switch to register" : "Switch to login"}
        >
          {isLogin ? "Need to register?" : "Already have an account?"}
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
  const [fontSize, setFontSize] = useState(18);
  const [selectedTask, setSelectedTask] = useState(null);
  const [file, setFile] = useState(null);
  const [showUsersModal, setShowUsersModal] = useState(false);
const openModal = (task) => setSelectedTask(task);
const closeModal = () => setSelectedTask(null);

  const handleFileSubmit = () => {
    if (!file) {
      swal("ไม่มีงานที่จะส่ง", "คุณอย่าลืมใส่ไฟล์");
      return;
    }
swal({
  title: "Good job!",
  text: "ส่งไฟล์สำเร็จ! คุณทำงานดีดีมากๆ",
  icon: "success",
  button: "Aww yiss!",
});

    setFile(null); 
  };
  const [colorTemplate, setColorTemplate] = useState("calmBlue");
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    status: "progress",
    assignedto: "",
    isupcoming: false,
    duedate: "",
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
    let primary = "#4A90E2"; // Soft blue
    let secondary = "#A3BFFA"; // Lighter blue
    let background = "#F0F4FF"; // Very light blue
    let paper = "#F9F9F9"; // Off-white
    let primaryText = "#1A202C"; // Dark gray for contrast
    switch (colorTemplate) {
      //calm blue
      case "calmBlue":
        primary = "#4A90E2";
        secondary = "#A3BFFA";
        background = "#F0F4FF";
        paper = "#F9F9F9";
        primaryText = "#1A202C";
        break;
      case "softGreen":
        // soft green
        primary = "#68D391";
        secondary = "#B2F5EA";
        background = "#E6FFFA";
        paper = "#F0FFF4";
        primaryText = "#1A202C";
        break;
      // gentle cream
      case "gentleCream":
        primary = "#F6E05E";
        secondary = "#FEFCBF";
        background = "#FFFFF0";
        paper = "#FFF5E6";
        primaryText = "#1A202C";
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
      description: "",
      status: "progress",
      assignedto: "",
      isupcoming: false,
      duedate: "",
    });
    fetchData();
    swal({
      title: "Add Success!",
      text: "You added a new task!",
      icon: "success",
      button: "Aww yiss!",
    });
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
      swal({
      title: "Add Success!",
      text: "Schedule added successfully!",
      icon: "success",
      button: "Aww yiss!",
    });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add schedule.");
    }
  };
  const handleKeyDown = (e, setModal) => {
    if (e.key === "Escape") {
      setModal(false);
    }
  };

  const currentTasks = tasks.filter((t) => !t.isupcoming);
  const upcomingTasks = tasks.filter((t) => t.isupcoming);

  if (showSettings) {
    return (
      <div
        className="min-h-screen p-8 bg-background"
        style={{
          backgroundColor: "var(--background)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <button
          onClick={() => setShowSettings(false)}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl text-lg font-semibold mb-8 hover:bg-gray-300 focus:ring-4 focus:ring-primary"
          aria-label="Back to main page"
        >
          Back
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  <div className="bg-paper p-8 rounded-2xl shadow-md">
    <h3 className="text-2xl font-semibold mb-4" id="user-details">
      Your Profile
    </h3>
    <div className="space-y-3 text-lg" aria-labelledby="user-details">
      <p>
        <span className="font-semibold">Username:</span> {user.username}
      </p>
      <p>
        <span className="font-semibold">First Name:</span> {user.firstname}
      </p>
      <p>
        <span className="font-semibold">Last Name:</span> {user.lastname}
      </p>
      <p>
        <span className="font-semibold">Phone:</span> {user.tel}
      </p>
      <p className="pt-2 text-xl">
        <span className="font-semibold">Role:</span>{" "}
        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
      </p>

      {user.role === "user" && (
        <p className="pt-2 text-xl">
          <span className="font-semibold">วิธีการรับมือ:</span>{" "}
          ต้องพูดอย่างใจเย็น และให้กำลังใจบ่อยๆ
        </p>
      )}
    </div>
  </div>

  <div className="col-span-2 bg-paper p-8 rounded-2xl shadow-md">
    <h2 className="text-3xl font-semibold mb-6" id="settings-heading">
      Settings
    </h2>
    <div className="mb-8">
      <label htmlFor="font-size" className="block text-lg mb-2 font-medium">
        Font Size
      </label>
      <input
        id="font-size"
        type="range"
        min={12}
        max={28}
        step={1}
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
        className="w-full h-3 accent-primary"
        aria-label="Adjust font size"
      />
      <span className="text-sm text-gray-600 mt-2 block">{fontSize}px</span>
    </div>

    <div className="mb-8">
      <label
        htmlFor="color-template"
        className="block text-lg mb-2 font-medium"
      >
        Color Theme
      </label>
      <select
        id="color-template"
        value={colorTemplate}
        onChange={(e) => setColorTemplate(e.target.value)}
        className="border border-gray-300 p-4 w-full rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-primary"
        aria-label="Select color theme"
      >
        <option value="calmBlue">Calm Blue</option>
        <option value="softGreen">Soft Green</option>
        <option value="gentleCream">Gentle Cream</option>
      </select>
    </div>

    {user.role === "user" && (
      <>
        <h3 className="text-2xl font-semibold mb-4">Work Overview</h3>
        <div className="w-full min-h-[300px] bg-gray-100 rounded-xl p-4 shadow-inner">
  <Chart />
</div>

      </>
    )}
  </div>
</div>

      </div>
    );
  }

  return (
    <div
      className="flex flex-col lg:flex-row min-h-screen bg-background"
      style={{
        backgroundColor: "var(--background)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div className="flex-1 p-8">
        <div className="flex items-center mb-8">
          <span
            className="text-2xl font-semibold"
            aria-label={`Welcome, ${user.username}`}
          >
            {user.username || "User"}
          </span>
          <button
            onClick={() => setShowSettings(true)}
            className="ml-auto p-3 text-gray-600 hover:text-primary focus:ring-4 focus:ring-primary"
            aria-label="Open settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button
            onClick={logout}
            className="ml-4 bg-violet-300 text-white p-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 focus:ring-4 focus:ring-primary"
            aria-label="Log out"
          >
            Log Out
          </button>
        </div>
       {user.role === "manager" && (
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setShowTaskModal(true)}
              className="bg-primary text-[var(--primary-text)] p-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 focus:ring-4 focus:ring-primary w-full sm:w-auto"
              aria-label="Add a new task"
            >
              Add Task
            </button>
            <button
  onClick={() => setShowUsersModal(true)}
  className="bg-primary text-[var(--primary-text)] p-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 focus:ring-4 focus:ring-primary w-full sm:w-auto"
  aria-label="View users"
>
  View Users
</button>
{showUsersModal && (
  <div
    className="fixed inset-0 bg-gray-200 bg-opacity-30 flex items-center justify-center z-50 p-4"
    onKeyDown={(e) => handleKeyDown(e, setShowUsersModal)}
  >
    <div className="bg-paper px-4 py-6 w-full sm:max-w-3xl max-w-full rounded-2xl shadow-lg overflow-y-auto max-h-screen">
      <h3 className="text-2xl font-semibold mb-6" id="view-users-heading">
        View Users
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {usersList
          .filter((u) => u.role === "user")
          .map((u) => (
            <div
              key={u.id}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <h4 className="text-xl font-semibold mb-4">
                {u.username}
              </h4>
              <div className="space-y-2 text-lg">
                <p>
                  <span className="font-semibold">First Name:</span>{" "}
                  {u.firstname}
                </p>
                <p>
                  <span className="font-semibold">Last Name:</span>{" "}
                  {u.lastname}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span> {u.tel}
                </p>
                <p>
                  <span className="font-semibold">คำเเนะนำ  :</span> {u.rule}
                </p>
              </div>
            </div>
          ))}
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={() => setShowUsersModal(false)}
          className="bg-gray-200 text-gray-800 p-4 rounded-lg text-lg font-semibold hover:bg-gray-300 focus:ring-4 focus:ring-primary"
          aria-label="Close users modal"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
          </div>
        )}
        <div className="space-y-8">
          <div>
  <h2 className="text-2xl font-bold mb-4" id="current-tasks">
    Current Tasks
  </h2>
  {currentTasks.length === 0 ? (
    <div className="bg-paper rounded-xl shadow-md p-6 text-center text-gray-600 text-lg">
      No Current Tasks Available
    </div>
  ) : (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {currentTasks.filter((task) => !task.checked).map((task) => (
        <div
          key={task.id}
          className="bg-paper rounded-xl shadow-md p-6 flex flex-col gap-4"
        >
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id={`task-${task.id}`}
              checked={task.checked}
              onChange={(e) => handleCheck(task.id, e.target.checked)}
              className="w-8 h-8 accent-primary mt-1"
              aria-label={`Mark task ${task.name} as completed`}
            />
            <label
              htmlFor={`task-${task.id}`}
              className="flex-1 text-lg font-semibold leading-snug break-words"
            >
              {task.name}
              <div className="text-gray-700 text-sm line-clamp-3">
                {task.description.includes("[ai]")
                  ? "รายละเอียดงาน : เราอยากจะให้คุณช่วยเช็คไฟล์ excel โดย ให้คุณเช็ค 2 อย่างคือ 1.ความถูกต้องของชื่อ 2.ความซ้ำกันของรายการ โดยถ้าทำเสร็จให้ส่งมาที่ todoนี้ได้ทันที"
                  : task.description}
              </div>
              {task.description.length > 2 && (
                <button
                  onClick={() => openModal(task)}
                  className="text-primary underline text-sm self-start"
                >
                  ดูเพิ่มเติม
                </button>
              )}
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-base">
            <span
              className={`px-3 py-1 rounded-lg text-white font-medium ${
                task.status === "progress"
                  ? "bg-blue-300"
                  : task.status === "approved"
                  ? "bg-green-300"
                  : task.status === "review"
                  ? "bg-yellow-300"
                  : "bg-red-300"
              }`}
              aria-label={`Status: ${task.status}`}
            >
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
            <span className="flex-1">
              Assigned:{" "}
              {usersList.find((u) => u.id === task.assignedto)?.username ||
                "Unknown"}
            </span>
            <span className="text-gray-600">
              Due: {task.duedate || "None"}
            </span>
            {user.role === "user" && (
              <div className="bg-paper rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-2">แนบไฟล์</h2>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary p-1"
                />
                {file && (
                  <p className="mt-1 text-gray-500 text-xs">
                    ไฟล์ที่เลือก: {file.name}
                  </p>
                )}
                <button
                  onClick={handleFileSubmit}
                  className="mt-2 px-3 py-1 text-sm bg-primary text-black rounded-md hover:bg-primary/90 transition"
                >
                  ส่งไฟล์
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

          <div>
            <h2 className="text-2xl font-bold mb-4" id="upcoming-tasks">
              Upcoming Tasks
            </h2>
            {upcomingTasks.length === 0 ? (
              <div className="bg-paper rounded-xl shadow-md p-6 text-center text-gray-600 text-lg">
                No Upcoming Tasks
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-paper rounded-xl shadow-md p-6 flex flex-col gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        id={`task-${task.id}`}
                        checked={task.checked}
                        onChange={(e) => handleCheck(task.id, e.target.checked)}
                        className="w-8 h-8 accent-primary mt-1"
                        aria-label={`Mark task ${task.name} as completed`}
                      />
                      <label
                        htmlFor={`task-${task.id}`}
                        className="flex-1 text-lg font-semibold leading-snug break-words"
                      >
                        {task.name}
                      </label>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-base">
                      <span
                        className={`px-3 py-1 rounded-lg text-white font-medium ${
                          task.status === "progress"
                            ? "bg-blue-300"
                            : task.status === "approved"
                            ? "bg-green-300"
                            : task.status === "review"
                            ? "bg-yellow-300"
                            : "bg-red-300"
                        }`}
                        aria-label={`Status: ${task.status}`}
                      >
                        {task.status.charAt(0).toUpperCase() +
                          task.status.slice(1)}
                      </span>
                      <span className="flex-1">
                        Assigned:{" "}
                        {usersList.find((u) => u.id === task.assignedto)
                          ?.username || "Unknown"}
                      </span>
                      <span className="text-gray-600">
                        Due: {task.duedate || "None"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/3 p-8 bg-paper border-t lg:border-l lg:border-t-0">
        <div className="flex items-center mb-8">
          <p className="text-2xl font-semibold" id="schedule-heading">
            Schedule
          </p>
          {selectedTask && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
      <button
        onClick={closeModal}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
      <h3 className="text-xl font-bold mb-4">Task : {selectedTask.name}</h3>
      <p className="text-gray-800 whitespace-pre-line break-words">
        Description : {selectedTask.description}
      </p>
       <span
                      className={`px-3 py-1 rounded-lg text-white font-medium ${
                        selectedTask.status === "progress"
                          ? "bg-blue-300"
                          : selectedTask.status === "approved"
                          ? "bg-green-300"
                          : selectedTask.status === "review"
                          ? "bg-yellow-300"
                          : "bg-red-300"
                      }`}
                      aria-label={`Status: ${selectedTask.status}`}
                    >
                      {selectedTask.status.charAt(0).toUpperCase() +
                        selectedTask.status.slice(1)}
                    </span>
    </div>
  </div>
)}

          {user.role === "manager" && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="ml-auto bg-blue-200 text-[var(--primary-text)] p-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 focus:ring-4 focus:ring-primary"
              aria-label="Add a new schedule"
            >
              Add Schedule
            </button>
          )}
        </div>
        <div className="space-y-6" aria-labelledby="schedule-heading">
          {schedules.map((s) => (
            <div key={s.id} className="p-6 rounded-xl bg-paper shadow-md">
              <div className="mb-4">
                <div className="text-gray-600 text-base">{s.time}</div>
                <div className="text-xl font-semibold">{s.name}</div>
              </div>
              <div className="flex flex-wrap gap-4">
                {s.members.map((mId) => {
                  const u = usersList.find((u) => u.id === mId);
                  return u ? (
                    <div key={u.id} className="flex items-center">
                      <img
                        src={u.avatar}
                        alt={`Avatar of ${u.username}`}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <span>{u.username}</span>
                    </div>
                  ) : (
                    <div key={mId} className="text-gray-600">
                      Unknown User
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {showTaskModal && (
        <div
          className="fixed inset-0 bg-gray-200 bg-opacity-30 flex items-center justify-center z-50 p-4"
          onKeyDown={(e) => handleKeyDown(e, setShowTaskModal)}
        >
          <div className="bg-paper px-4 py-6 w-full sm:max-w-lg max-w-full rounded-2xl shadow-lg overflow-y-auto max-h-screen">
  <form onSubmit={addTask}>
    <h3 className="text-2xl font-semibold mb-6" id="add-task-heading">
      Add New Task
    </h3>
    <div className="space-y-4">
      {/* Task Name */}
      <div>
        <label htmlFor="task-name" className="block text-lg mb-2 font-medium">
          Task Name
        </label>
        <input
          id="task-name"
          type="text"
          value={newTask.name}
          onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
          required
          className="border border-gray-300 p-4 w-full rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-primary"
          placeholder="Enter task name"
          aria-required="true"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="task-description" className="block text-lg mb-2 font-medium">
          Description
        </label>
        <textarea
          id="task-description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          className="border border-gray-300 p-4 w-full rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-primary"
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      {/* Status */}
      <div>
        <label htmlFor="task-status" className="block text-lg mb-2 font-medium">
          Status
        </label>
        <select
          id="task-status"
          value={newTask.status}
          onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
          className="border border-gray-300 p-4 w-full rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-primary"
          aria-label="Select task status"
        >
          <option value="progress">In Progress</option>
          <option value="approved">Approved</option>
          <option value="review">Review</option>
          <option value="waiting">Waiting</option>
        </select>
      </div>

      {/* Assign To */}
      <div>
        <label htmlFor="assign-to" className="block text-lg mb-2 font-medium">
          Assign To
        </label>
        <select
          id="assign-to"
          value={newTask.assignedto}
          onChange={(e) => setNewTask({ ...newTask, assignedto: e.target.value })}
          required
          className="border border-gray-300 p-4 w-full rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-primary"
          aria-required="true"
          aria-label="Assign task to user"
        >
          <option value="">Select User</option>
          {usersList
            .filter((u) => u.role === "user")
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
        </select>
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="due-date" className="block text-lg mb-2 font-medium">
          Due Date
        </label>
        <input
          id="due-date"
          type="date"
          value={newTask.duedate}
          onChange={(e) => setNewTask({ ...newTask, duedate: e.target.value })}
          className="border border-gray-300 p-4 w-full rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-primary"
          aria-label="Select due date"
        />
      </div>

      {/* Upcoming Task */}
      <div className="flex items-center">
        <input
          id="upcoming-task"
          type="checkbox"
          checked={newTask.isupcoming}
          onChange={(e) => setNewTask({ ...newTask, isupcoming: e.target.checked })}
          className="w-6 h-6 accent-primary mr-3"
          aria-label="Mark as upcoming task"
        />
        <label htmlFor="upcoming-task" className="text-lg">
          Upcoming Task
        </label>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
        <button
          type="submit"
          className="bg-primary text-[var(--primary-text)] p-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 focus:ring-4 focus:ring-primary flex-1"
          aria-label="Add task"
        >
          Add
        </button>
        <button
          onClick={() => setShowTaskModal(false)}
          className="bg-gray-200 text-gray-800 p-4 rounded-lg text-lg font-semibold hover:bg-gray-300 focus:ring-4 focus:ring-primary flex-1"
          aria-label="Cancel adding task"
        >
          Cancel
        </button>
      </div>
    </div>
  </form>
</div>

        </div>
      )}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
  <div className="bg-white w-full max-w-full sm:max-w-md md:max-w-lg rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
    <form onSubmit={addSchedule}>
      <h3 className="text-xl sm:text-2xl font-semibold mb-6" id="add-schedule-heading">
        Add New Schedule
      </h3>
              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label
                    htmlFor="schedule-date"
                    className="block text-base sm:text-lg mb-2 font-medium"
                  >
                    Date
                  </label>
                  <input
                    id="schedule-date"
                    type="date"
                    value={newSchedule.date}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, date: e.target.value })
                    }
                    required
                    className="border border-gray-300 p-3 sm:p-4 w-full rounded-lg text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-primary"
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label
                    htmlFor="start-time"
                    className="block text-base sm:text-lg mb-2 font-medium"
                  >
                    Start Time
                  </label>
                  <input
                    id="start-time"
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        startTime: e.target.value,
                      })
                    }
                    required
                    className="border border-gray-300 p-3 sm:p-4 w-full rounded-lg text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-primary"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label
                    htmlFor="end-time"
                    className="block text-base sm:text-lg mb-2 font-medium"
                  >
                    End Time
                  </label>
                  <input
                    id="end-time"
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        endTime: e.target.value,
                      })
                    }
                    required
                    className="border border-gray-300 p-3 sm:p-4 w-full rounded-lg text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-primary"
                  />
                </div>

                {/* Schedule Name */}
                <div>
                  <label
                    htmlFor="schedule-name"
                    className="block text-base sm:text-lg mb-2 font-medium"
                  >
                    Schedule Name
                  </label>
                  <input
                    id="schedule-name"
                    type="text"
                    value={newSchedule.name}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, name: e.target.value })
                    }
                    required
                    className="border border-gray-300 p-3 sm:p-4 w-full rounded-lg text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-primary"
                    placeholder="Enter schedule name"
                  />
                </div>

                {/* Members */}
                <div>
                  <label
                    htmlFor="members"
                    className="block text-base sm:text-lg mb-2 font-medium"
                  >
                    Members
                  </label>
                  <select
                    id="members"
                    multiple
                    value={newSchedule.members}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        members: Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value
                        ),
                      })
                    }
                    className="border border-gray-300 p-3 sm:p-4 w-full rounded-lg text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-primary"
                  >
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label
                    htmlFor="schedule-color"
                    className="block text-base sm:text-lg mb-2 font-medium"
                  >
                    Color
                  </label>
                  <select
                    id="schedule-color"
                    value={newSchedule.color}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, color: e.target.value })
                    }
                    className="border border-gray-300 p-3 sm:p-4 w-full rounded-lg text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-primary"
                  >
                    <option value="yellow">Yellow</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                  <button
                    type="submit"
                    className="bg-primary text-[var(--primary-text)] p-3 sm:p-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-opacity-90 focus:ring-4 focus:ring-primary w-full sm:flex-1"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    type="button"
                    className="bg-gray-200 text-gray-800 p-3 sm:p-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-300 focus:ring-4 focus:ring-primary w-full sm:flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
