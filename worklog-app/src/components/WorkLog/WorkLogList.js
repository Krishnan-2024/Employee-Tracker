import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkLogs, createWorkLog, updateWorkLog } from "../../api";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./WorkLogList.css"; // Import improved
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Logo from "../assests/logo.png"; // Import logo image



const WorkLogList = () => {
  const [workLogs, setWorkLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterStartTime, setFilterStartTime] = useState("");
  const [filterEndTime, setFilterEndTime] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const exportCSV = () => {
    if (filteredLogs.length === 0) {
      alert("No data to download!");
      return;
    }

    const headers = [
      "Task Name",
      "Start Time",
      "End Time",
      "Description",
      "Status",
    ];
    const csvRows = filteredLogs.map((log) => [
      log.task_name,
      new Date(log.start_time).toLocaleString(),
      log.end_time ? new Date(log.end_time).toLocaleString() : "N/A",
      log.description,
      log.status.replace("_", " "),
    ]);

    const csvContent = [
      headers.join(","), // Header row
      ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")), // Data rows
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "work_logs.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = () => {
    if (filteredLogs.length === 0) {
      alert("No data to download!");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      filteredLogs.map((log) => ({
        "Task Name": log.task_name,
        "Start Time": new Date(log.start_time).toLocaleString(),
        "End Time": log.end_time
          ? new Date(log.end_time).toLocaleString()
          : "N/A",
        Description: log.description,
        Status: log.status.replace("_", " "),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Work Logs");
    XLSX.writeFile(workbook, "work_logs.xlsx");
  };

  const exportPDF = () => {
    if (filteredLogs.length === 0) {
      alert("No data to download!");
      return;
    }
  
    const doc = new jsPDF();
    doc.text("Work Logs Report", 14, 10);
  
    const tableData = filteredLogs.map(log => [
      log.task_name,
      new Date(log.start_time).toLocaleString(),
      log.end_time ? new Date(log.end_time).toLocaleString() : "N/A",
      log.description,
      log.status.replace("_", " ")
    ]);
  
    autoTable(doc, {
      head: [["Task Name", "Start Time", "End Time", "Description", "Status"]],
      body: tableData,
      startY: 20
    });
  
    doc.save("work_logs.pdf");
  };
  

  const formatDateForInput = (isoString) => {
    return isoString ? new Date(isoString).toISOString().slice(0, 16) : "";
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkLogs();
  }, []);

  const fetchWorkLogs = async () => {
    try {
      const response = await getWorkLogs();
      setWorkLogs(response.data);
      setFilteredLogs(response.data);
    } catch (err) {
      setError("Failed to fetch work logs");
    }
  };

  useEffect(() => {
    let filtered = workLogs;

    if (filterName) {
      filtered = filtered.filter((log) =>
        log.task_name.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    if (filterStartTime) {
      filtered = filtered.filter(
        (log) => new Date(log.start_time) >= new Date(filterStartTime)
      );
    }

    if (filterEndTime) {
      filtered = filtered.filter(
        (log) =>
          log.end_time && new Date(log.end_time) <= new Date(filterEndTime)
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((log) => log.status === filterStatus);
    }

    setFilteredLogs(filtered);
  }, [filterName, filterStartTime, filterEndTime, filterStatus, workLogs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createWorkLog({
        task_name: taskName,
        start_time: startTime,
        end_time: endTime,
        description,
      });
      setTaskName("");
      setStartTime("");
      setEndTime("");
      setDescription("");
      fetchWorkLogs();
    } catch (err) {
      setError("Failed to create work log");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateWorkLog(selectedTask.id, {
        task_name: taskName,
        start_time: startTime,
        end_time: endTime,
        description,
        status,
      });

      // ✅ Reset form fields
      setTaskName("");
      setStartTime("");
      setEndTime("");
      setDescription("");
      setStatus("pending");
      setSelectedTask(null);

      fetchWorkLogs();
    } catch (err) {
      setError("Failed to update work log");
    }
  };

  const events = workLogs.map((log) => ({
    id: log.id,
    title: log.task_name,
    start: log.start_time,
    end: log.end_time,
    color:
      log.status === "pending"
        ? "red"
        : log.status === "in_progress"
        ? "yellow"
        : "green",
  }));

  const handleEventClick = (clickInfo) => {
    const taskId = clickInfo.event.id;
    const selected = workLogs.find((log) => log.id === parseInt(taskId));

    if (selected) {
      setSelectedTask(selected);
      setTaskName(selected.task_name);
      setStartTime(formatDateForInput(selected.start_time));
      setEndTime(formatDateForInput(selected.end_time));
      setDescription(selected.description);
      setStatus(selected.status);
    }
  };
  const hasPendingTasks = workLogs.some((log) => log.status === "pending");
  return (
    <div className="dashboard-container">
      <div className="top">
        <div className="sidebar">
          <img src={Logo} alt="Logo" className="logo" />
          
          <h3>WorkScheduler</h3>

          {!selectedTask && !hasPendingTasks ? (
            <form onSubmit={handleSubmit} className="task-form">
              <h4>Create Task</h4>
              {error && <p className="error">{error}</p>}
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
              <button type="submit">Add Task</button>
            </form>
          ) : (
            <p className="info-message">
              ⚠️ You have a pending task. Complete it before adding a new one.
            </p>
          )}

          {selectedTask && (
            <div className="update-form-container">
              <h2>Update Task</h2>
              <form onSubmit={handleUpdate} className="task-form">
                <input
                  type="text"
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button type="submit">Update Task</button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setSelectedTask(null)}
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="calendar-container">
          <h2>Work Logs Calendar</h2>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            eventClick={handleEventClick}
          />
        </div>
      </div>
      <div className="task-table-container">
        <h2>All Tasks</h2>

        {/* Filter Inputs */}
        <div className="filters">
          <input
            type="text"
            placeholder="Filter by Task Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
          <input
            type="datetime-local"
            placeholder="Start Time"
            value={filterStartTime}
            onChange={(e) => setFilterStartTime(e.target.value)}
          />
          <input
            type="datetime-local"
            placeholder="End Time"
            value={filterEndTime}
            onChange={(e) => setFilterEndTime(e.target.value)}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <table className="task-table">
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.task_name}</td>
                <td>{new Date(log.start_time).toLocaleString()}</td>
                <td>
                  {log.end_time
                    ? new Date(log.end_time).toLocaleString()
                    : "N/A"}
                </td>
                <td>{log.description}</td>
                <td>{log.status.replace("_", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="export-buttons">
          <button className="export-btn" onClick={exportCSV}>
            Download CSV
          </button>
          <button className="export-btn" onClick={exportExcel}>
            Download Excel
          </button>
          <button className="export-btn" onClick={exportPDF}>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkLogList;
