import React, { useEffect, useState } from "react";
import "../style/Dashboard.css";
import axios from "axios";
import { FaTasks, FaCog, FaQuestionCircle, FaCalendarAlt } from "react-icons/fa";

const Dashboard = ({ token }) => {
  const [tasks, setTasks] = useState([]);
  const [settings, setSettings] = useState({ theme: "light", font_size: "medium" });
  const [helpMessage, setHelpMessage] = useState("");
  const [meetingTranscript, setMeetingTranscript] = useState("");
  const [meetingSummary, setMeetingSummary] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchSettings();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/api/tasks", { headers: { Authorization: `Bearer ${token}` } });
      console.log(res)
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/settings", { headers: { Authorization: `Bearer ${token}` } });
      setSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateSettings = async () => {
    try {
      await axios.post("/api/settings", { theme: settings.theme, fontSize: settings.font_size }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Settings updated");
    } catch (err) {
      console.error(err);
    }
  };

  const sendHelp = async () => {
    try {
      await axios.post("/api/help", { message: helpMessage }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Help request sent");
      setHelpMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  const submitMeetingNotes = async () => {
    try {
      const res = await axios.post("/api/meeting-notes", { transcript: meetingTranscript }, { headers: { Authorization: `Bearer ${token}` } });
      setMeetingSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`dashboard-wrapper ${settings.theme}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>CogniSync</h2>
        <ul>
          <li><FaTasks /> Tasks</li>
          <li><FaCalendarAlt /> Calendar</li>
          <li><FaCog /> Settings</li>
          <li><FaQuestionCircle /> Help</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header>
          <h1>Welcome to CogniSync</h1>
          <p>AI Platform to Enhance Work Potential & Reduce Cognitive Load</p>
        </header>

        {/* Tasks Section */}
        <section className="tasks-section">
          <h2>My Tasks</h2>
          <div className="tasks-grid">
            {tasks.map((task) => (
              <div key={task.id} className="task-card">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>Due: {task.due ? new Date(task.due).toLocaleDateString() : "N/A"}</p>
                <span className={`status ${task.status.replace(" ", "-").toLowerCase()}`}>{task.status}</span>
                <p>Time Spent: {task.time_spent} min</p>
              </div>
            ))}
          </div>
        </section>

        {/* Settings Section */}
        <section className="settings-section">
          <h2>Sensory Settings</h2>
          <label>
            Theme:
            <select value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label>
            Font Size:
            <select value={settings.font_size} onChange={(e) => setSettings({ ...settings, font_size: e.target.value })}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </label>
          <button onClick={updateSettings}>Update Settings</button>
        </section>

        {/* Help Section */}
        <section className="help-section">
          <h2>Need Help?</h2>
          <textarea value={helpMessage} onChange={(e) => setHelpMessage(e.target.value)} placeholder="Type your message here..." />
          <button onClick={sendHelp}>Send Help Request</button>
        </section>

        {/* Meeting Notes Section */}
        <section className="meeting-section">
          <h2>Meeting Notes / AI Summary</h2>
          <textarea value={meetingTranscript} onChange={(e) => setMeetingTranscript(e.target.value)} placeholder="Paste meeting transcript..." />
          <button onClick={submitMeetingNotes}>Generate Summary</button>
          {meetingSummary && <pre className="meeting-summary">{meetingSummary}</pre>}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
