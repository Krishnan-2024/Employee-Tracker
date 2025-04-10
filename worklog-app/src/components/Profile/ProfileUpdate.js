import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../../api';

const ProfileUpdate = () => {
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const { username, age, gender, title, description } = response.data;
        setUsername(username);
        setAge(age || '');
        setGender(gender || '');
        setTitle(title || '');
        setDescription(description || '');
      } catch (err) {
        setError('Failed to fetch profile.');
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('age', age);
      formData.append('gender', gender);
      formData.append('title', title);
      formData.append('description', description);

      // Only append image if user selected a new one
      if (image) {
        formData.append('image', image);
      }

      await updateProfile(formData);
      navigate('/profile');
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  return (
    <div className="profile-update">
      <h2>Update Profile</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" placeholder="Username" value={username} readOnly />

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default ProfileUpdate;
