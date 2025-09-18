import React, { useState, useEffect } from 'react';
import './App.css'; // Paste the CSS from your HTML <style> here (convert SASS to CSS by expanding %flex etc.)
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Button, TextField, Select, MenuItem, FormControlLabel, Checkbox, Modal, Box, InputLabel, FormControl } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setUser({ id: decoded.id, role: decoded.role });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/login', { username, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/register', { username, password, role });
      alert('Registered. Now login.');
      setIsLogin(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required fullWidth margin="normal" />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth margin="normal" />
          {!isLogin && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </Select>
            </FormControl>
          )}
          <Button type="submit" variant="contained" fullWidth>{isLogin ? 'Login' : 'Register'}</Button>
        </form>
        <Button onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Switch to Register' : 'Switch to Login'}</Button>
      </Box>
    );
  }

  return <TaskManager user={user} logout={logout} />;
}

function TaskManager({ user, logout }) {
  const [tasks, setTasks] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [usersList, setUsersList] = useState([]); // For managers
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', status: 'progress', assignedTo: '', isUpcoming: false, dueDate: '' });
  const [newSchedule, setNewSchedule] = useState({ date: '', startTime: '', endTime: '', name: '', members: [], color: 'yellow' });

  useEffect(() => {
    fetchData();
    if (user.role === 'manager') {
      axios.get('/api/users').then(res => setUsersList(res.data));
    }
  }, [user]);

  const fetchData = async () => {
    const tasksRes = await axios.get('/api/tasks');
    setTasks(tasksRes.data);
    const schedRes = await axios.get('/api/schedules');
    setSchedules(schedRes.data);
  };

  const handleCheck = async (id, checked) => {
    await axios.put(`/api/tasks/${id}`, { checked });
    fetchData();
  };

  const addTask = async (e) => {
    e.preventDefault();
    await axios.post('/api/tasks', newTask);
    setShowTaskModal(false);
    setNewTask({ name: '', status: 'progress', assignedTo: '', isUpcoming: false, dueDate: '' });
    fetchData();
  };

  const addSchedule = async (e) => {
    e.preventDefault();
    const time = `${newSchedule.date} ${newSchedule.startTime} - ${newSchedule.endTime}`;
    await axios.post('/api/schedules', { ...newSchedule, time });
    setShowScheduleModal(false);
    setNewSchedule({ date: '', startTime: '', endTime: '', name: '', members: [], color: 'yellow' });
    fetchData();
  };

  const currentTasks = tasks.filter(t => !t.isUpcoming);
  const upcomingTasks = tasks.filter(t => t.isUpcoming);

  return (
    <div className="task-manager">
      <div className="left-bar">
        <div className="upper-part">
          <div className="actions">
            <div className="circle"></div>
            <div className="circle-2"></div>
          </div>
        </div>
        <div className="left-content">
          <ul className="action-list">
            <li className="item">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-inbox" viewBox="0 0 24 24">
                <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
              </svg>
              <span>Inbox</span>
            </li>
 <li className="item">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="feather feather-star">
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          <span> Today</span>
        </li>
        <li className="item">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
            strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-calendar"
            viewBox="0 0 24 24">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <path d="M16 2v4M8 2v4m-5 4h18" />
          </svg>
          <span>Upcoming</span>
        </li>
        <li className="item">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="feather feather-hash">
            <line x1="4" y1="9" x2="20" y2="9" />
            <line x1="4" y1="15" x2="20" y2="15" />
            <line x1="10" y1="3" x2="8" y2="21" />
            <line x1="16" y1="3" x2="14" y2="21" /></svg>
          <span>Important</span>
        </li>
        <li className="item">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="feather feather-users">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          <span>Meetings</span>
        </li>
        <li className="item">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
            strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-trash"
            viewBox="0 0 24 24">
            <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span>Trash</span>
        </li>
          </ul>
          <ul className="category-list">
             <li className="item">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="feather feather-users">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          <span>Family</span>
        </li>
        <li className="item">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
            strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-sun"
            viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" />
            <path
              d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          <span>Vacation</span>
        </li>
        <li className="item">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="feather feather-trending-up">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" /></svg>
          <span>Festival</span>
        </li>
        <li className="item">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="feather feather-zap">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          <span>Concerts</span>
        </li>
          </ul>
        </div>
      </div>
      <div className="page-content">
        <div className="header">Today Tasks <Button onClick={logout} variant="outlined">Logout</Button></div>
        <div className="content-categories">
         <div className="content-categories">
      <div className="label-wrapper">
        <input className="nav-item" name="nav" type="radio" id="opt-1"/>
        <label className="category" htmlFor="opt-1">All</label>
      </div>
      <div className="label-wrapper">
        <input className="nav-item" name="nav" type="radio" id="opt-2"/ >
        <label className="category" htmlFor="opt-2">Important</label>
      </div>
      <div className="label-wrapper">
        <input className="nav-item" name="nav" type="radio" id="opt-3"/>
        <label className="category" htmlFor="opt-3">Notes</label>
      </div>
      <div className="label-wrapper">
        <input className="nav-item" name="nav" type="radio" id="opt-4"/>
        <label className="category" htmlFor="opt-4">Links</label>
      </div>
    </div>
        </div>
        <div className="tasks-wrapper">
          {user.role === 'manager' && <Button onClick={() => setShowTaskModal(true)} variant="contained">Add Task</Button>}
          {currentTasks.map(task => (
            <div className="task" key={task.id}>
              <input className="task-item" name="task" type="checkbox" id={`item-${task.id}`} checked={task.checked} onChange={(e) => handleCheck(task.id, e.target.checked)} />
              <label htmlFor={`item-${task.id}`}>
                <span className="label-text">{task.name}</span>
              </label>
              <span className={`tag ${task.status}`}>{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
              {user.role === 'manager' && <span>Assigned to: {usersList.find(u => u.id === task.assignedTo)?.username}</span>}
              <span>Due: {task.dueDate}</span>
            </div>
          ))}
          <div className="header upcoming">Upcoming Tasks</div>
          {upcomingTasks.map(task => (
            <div className="task" key={task.id}>
              <input className="task-item" name="task" type="checkbox" id={`item-${task.id}`} checked={task.checked} onChange={(e) => handleCheck(task.id, e.target.checked)} />
              <label htmlFor={`item-${task.id}`}>
                <span className="label-text">{task.name}</span>
              </label>
              <span className={`tag ${task.status}`}>{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
              {user.role === 'manager' && <span>Assigned to: {usersList.find(u => u.id === task.assignedTo)?.username}</span>}
              <span>Due: {task.dueDate}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="right-bar">
        <div className="top-part">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-users">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 1 0 0 7.75" />
          </svg>
          <div className="count">{schedules.length}</div>
        </div>
        <div className="header">Schedule {user.role === 'manager' && <Button onClick={() => setShowScheduleModal(true)} variant="contained">Add Schedule</Button>}</div>
        <div className="right-content">
          {schedules.map(s => (
            <div className={`task-box ${s.color}`} key={s.id}>
              <div className="description-task">
                <div className="time">{s.time}</div>
                <div className="task-name">{s.name}</div>
              </div>
              <div className="more-button"></div>
              <div className="members">
                {s.members.map(mId => {
                  const u = usersList.find(u => u.id === mId);
                  return u ? <img src={u.avatar} alt="member" key={u.id} /> : null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Modal (manager only) */}
      <Modal open={showTaskModal} onClose={() => setShowTaskModal(false)}>
        <Box sx={style}>
          <form onSubmit={addTask}>
            <TextField label="Task Name" value={newTask.name} onChange={e => setNewTask({ ...newTask, name: e.target.value })} required fullWidth margin="normal" />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="progress">In Progress</MenuItem>
                <MenuItem value="review">In Review</MenuItem>
                <MenuItem value="waiting">Waiting</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Assign To</InputLabel>
              <Select value={newTask.assignedTo} onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })} required>
                <MenuItem value="">Assign To</MenuItem>
                {usersList.filter(u => u.role === 'user').map(u => <MenuItem key={u.id} value={u.id}>{u.username}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Due Date" type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth margin="normal" />
            <FormControlLabel control={<Checkbox checked={newTask.isUpcoming} onChange={e => setNewTask({ ...newTask, isUpcoming: e.target.checked })} />} label="Upcoming" />
            <Button type="submit" variant="contained">Add</Button>
            <Button onClick={() => setShowTaskModal(false)} variant="outlined">Cancel</Button>
          </form>
        </Box>
      </Modal>

      {/* Schedule Modal (manager only) */}
      <Modal open={showScheduleModal} onClose={() => setShowScheduleModal(false)}>
        <Box sx={style}>
          <form onSubmit={addSchedule}>
            <TextField label="Date" type="date" value={newSchedule.date} onChange={e => setNewSchedule({ ...newSchedule, date: e.target.value })} InputLabelProps={{ shrink: true }} required fullWidth margin="normal" />
            <TextField label="Start Time" type="time" value={newSchedule.startTime} onChange={e => setNewSchedule({ ...newSchedule, startTime: e.target.value })} InputLabelProps={{ shrink: true }} required fullWidth margin="normal" />
            <TextField label="End Time" type="time" value={newSchedule.endTime} onChange={e => setNewSchedule({ ...newSchedule, endTime: e.target.value })} InputLabelProps={{ shrink: true }} required fullWidth margin="normal" />
            <TextField label="Schedule Name" value={newSchedule.name} onChange={e => setNewSchedule({ ...newSchedule, name: e.target.value })} required fullWidth margin="normal" />
            <FormControl fullWidth margin="normal">
              <InputLabel>Members</InputLabel>
              <Select multiple value={newSchedule.members} onChange={e => setNewSchedule({ ...newSchedule, members: e.target.value })}>
                {usersList.map(u => <MenuItem key={u.id} value={u.id}>{u.username}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Color</InputLabel>
              <Select value={newSchedule.color} onChange={e => setNewSchedule({ ...newSchedule, color: e.target.value })}>
                <MenuItem value="yellow">Yellow</MenuItem>
                <MenuItem value="blue">Blue</MenuItem>
                <MenuItem value="red">Red</MenuItem>
                <MenuItem value="green">Green</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" variant="contained">Add</Button>
            <Button onClick={() => setShowScheduleModal(false)} variant="outlined">Cancel</Button>
          </form>
        </Box>
      </Modal>
    </div>
  );
}

export default App;