import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api";
import Logo from "../components/assests/logo.png"; // Import logo image

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("access_token"); // Check if token exists
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("access_token");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="wid">
      <nav className="navbar">
        <div className="nav-left">
          {/* Logo & Home Link */}
          <Link to="/" onClick={() => setMenuOpen(false)} className="logo-container">
            <img src={Logo} alt="Logo" className="logo" />
            Home
          </Link>
        </div>

        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <div className={`nav-right ${menuOpen ? "show" : ""}`}>
          {isLoggedIn && <Link to="/worklogs" onClick={() => setMenuOpen(false)}>Work Logs</Link>}
          {isLoggedIn && <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
          {isLoggedIn && <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>}
          {!isLoggedIn ? (
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
          ) : (
            <button onClick={handleLogout}>Logout</button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
