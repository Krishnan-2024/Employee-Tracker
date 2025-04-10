import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWorkLogById, updateWorkLog } from "../../api";
import "./UpdateWorkLog.css"; // Import CSS file

const WorkLogList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWorkLog();
  }, []);

  const fetchWorkLog = async () => {
    try {
      const response = await getWorkLogById(id);
      const { task_name, start_time, end_time, description, status } = response.data;
      setTaskName(task_name);
      setStartTime(start_time);
      setEndTime(end_time || "");
      setDescription(description);
      setStatus(status);
    } catch (err) {
      setError("Failed to fetch task details");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateWorkLog(id, {
        task_name: taskName,
        start_time: startTime,
        end_time: endTime,
        description,
        status,
      });
      navigate("/"); // Redirect back to the main page
    } catch (err) {
      setError("Failed to update work log");
    }
  };

  return (
    <div className="update-task-container">
      <h2>Update Task</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleUpdate} className="update-task-form">
        <input
          type="text"
          placeholder="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button type="submit">Update Task</button>
      </form>
    </div>
  );
};

export default WorkLogList;
