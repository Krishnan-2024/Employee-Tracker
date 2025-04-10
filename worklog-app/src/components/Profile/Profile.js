import React, { useEffect, useState } from "react";
import { getProfile, updateProfile, forgotPassword } from "../../api";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    age: "",
    gender: "",
    title: "",
    description: "",
    profile_picture: null, // Add profile picture field
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setProfile(response.data);
        setFormData(response.data);
      } catch (err) {
        setError("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, []);


  

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "profile_picture") {
      setFormData({ ...formData, profile_picture: e.target.files[0] });
    } else if (name === "gender") {
      setFormData({
        ...formData,
        gender: value.charAt(0).toUpperCase() + value.slice(1),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };




  const handleResetPassword = async () => {
    const email = formData.email; // Get the email from the form
    if (!email) {
      alert("Email not found. Please update your profile first.");
      return;
    }
  
    try {
      await forgotPassword({ email });
      alert("Password reset link sent to your email!");
    } catch (error) {
      alert("Failed to send reset link. Try again later.");
    }
  };
  



  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      if (
        key === "profile_picture" &&
        formData.profile_picture instanceof File
      ) {
        formDataToSend.append("profile_picture", formData.profile_picture);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      await updateProfile(formDataToSend); // Ensure API handles FormData

      // Fetch updated profile from API to ensure correctness
      const updatedResponse = await getProfile();
      setProfile(updatedResponse.data);

      setIsEditing(false); // Redirect to profile view after updating
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile">
      <h2>Profile</h2>
      {error && <p className="error">{error}</p>}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />

          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          ></textarea>

          <label htmlFor="profile_picture">Profile Picture</label>
          <input
            type="file"
            id="profile_picture"
            name="profile_picture"
            onChange={handleChange}
          />

          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <div>
          {profile.profile_picture && (
            <img src={profile.profile_picture} alt="Profile" width="150" />
          )}
          <p>Username: {profile.username}</p>
          <p>Email: {profile.email}</p>
          <p>Age: {profile.age}</p>
          <p>Gender: {profile.gender}</p>
          <p>Title: {profile.title}</p>
          <p>Description: {profile.description}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          <br></br>
          <button onClick={handleResetPassword}>Reset Password</button>

        </div>
      )}
    </div>
  );
};

export default Profile;
