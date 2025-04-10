import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import Logo from "../assests/logo.png"; // Import logo image


// Register required Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    axios
      .get("http://localhost:8000/api/v1/dashboard/", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => setStats(response.data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  if (!stats) return <div>Loading...</div>;

  // Ensure weekly_stats and monthly_stats exist
  const weeklyStats = stats.weekly_stats || { dates: [], counts: [] };
  const monthlyStats = stats.monthly_stats || { months: [], counts: [] };

  const barChartData = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        label: "Tasks",
        data: [
          stats.task_status_data?.pending || 0,
          stats.task_status_data?.in_progress || 0,
          stats.task_status_data?.completed || 0,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#4CAF50"],
      },
    ],
  };

  const weeklyChartData = {
    labels: weeklyStats.dates, // Safe to use now
    datasets: [
      {
        label: "Weekly Tasks",
        data: weeklyStats.counts,
        backgroundColor: "#FFA726",
      },
    ],
  };

  const monthlyChartData = {
    labels: monthlyStats.months, // Safe to use now
    datasets: [
      {
        label: "Monthly Tasks",
        data: monthlyStats.counts,
        backgroundColor: "#AB47BC",
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        
        <h2> 
          Dashboard
        <img src={Logo} alt="Logo" className="logo" />
          
          </h2>
      </div>

      <div className="stats-container">
        <div className="stat-card blue">Total Tasks: {stats.task_status_data?.total || 0}</div>
        <div className="stat-card yellow">Pending: {stats.task_status_data?.pending || 0}</div>
        <div className="stat-card green">In Progress: {stats.task_status_data?.in_progress || 0}</div>
        <div className="stat-card red">Completed: {stats.task_status_data?.completed || 0}</div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h3>Task Status Chart</h3>
          <Bar data={barChartData} />
        </div>
        <div className="chart-card">
          <h3>Task Distribution</h3>
          <Doughnut data={barChartData} />
        </div>
        {weeklyStats.dates.length > 0 && (
          <div className="chart-card">
            <h3>Weekly Task Progress</h3>
            <Bar data={weeklyChartData} />
          </div>
        )}
        {monthlyStats.months.length > 0 && (
          <div className="chart-card">
            <h3>Monthly Task Progress</h3>
            <Bar data={monthlyChartData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
