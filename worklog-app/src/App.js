import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Auth/Login";
import Home from "./components/Auth/Home";
import Register from "./components/Auth/Register";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import Profile from "./components/Profile/Profile";
import ProfileUpdate from "./components/Profile/ProfileUpdate";
import WorkLogList from "./components/WorkLog/WorkLogList";
import WorkLogForm from "./components/WorkLog/WorkLogForm";
import WorkLogItem from "./components/WorkLog/WorkLogItem";
import Dashboard from "./components/WorkLog/Dashboard";

import UpdateWorkLog from "./components/WorkLog/UpdateWorkLog";
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/update" element={<ProfileUpdate />} />
          <Route path="/worklogs" element={<WorkLogList />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/worklogs/new" element={<WorkLogForm />} />
          <Route path="/worklogs/:id" element={<WorkLogItem />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
