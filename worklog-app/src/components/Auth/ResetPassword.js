import React, { useState } from "react";
import { resetPassword } from "../../api";
import { useParams, useNavigate } from "react-router-dom";
import Logo from "../assests/logo.png"; // Import logo image



const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPassword(token, { 
        new_password: newPassword, 
        confirm_password: confirmPassword 
      });
      
      setMessage("Password reset successfully! Redirecting to login...");
      setError("");

      setTimeout(() => navigate("/login"), 2000); // Redirect after success
    } catch (err) {
      if (err.response?.data) {
        // Show specific API error messages
        setError(Object.values(err.response.data).flat().join(" "));
      } else {
        setError("Failed to reset password. Please try again.");
      }
      setMessage("");
    }
  };

  return (
    <div className="auth-container">
      <img src={Logo} alt="Logo" className="logo" />
      <h2>Reset Password</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>New Password:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <label>Confirm Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
