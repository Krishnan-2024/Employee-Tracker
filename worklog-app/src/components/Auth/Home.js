import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import HomeImage from "../assests/home.jpg";

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [user, setUser] = useState(null); // Store logged-in user
  const [hasReviewed, setHasReviewed] = useState(false); // Track if user has reviewed

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/reviews/");
        setReviews(response.data);
        
        // Get logged-in user
        const storedUser = JSON.parse(localStorage.getItem("user")); // Assuming user info is stored
        setUser(storedUser);

        if (storedUser) {
          // Check if the user has already submitted a review
          const userReview = response.data.find((review) => review.user === storedUser.username);
          setHasReviewed(!!userReview);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("You must be logged in to leave a review.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/reviews/",
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews([response.data, ...reviews]);
      setRating(0);
      setComment("");
      setHasReviewed(true); // Hide the form after submission
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <img src={HomeImage} alt="Hero" className="hero-image" />
        <div className="hero-text">
          <h1>Welcome to Our Platform</h1>
          <p>We're wired to change lives through technology...</p>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <h2>Our Services</h2>
        <div className="service-list">
          <div className="service-item">
            <h3>Electronic Manufacturing Services</h3>
            <p>PCB Assembly, Box Build, Tester Development, Repair & Rework</p>
          </div>
          <div className="service-item">
            <h3>Engineering & Technology Services</h3>
            <p>End-to-end Physical + Digital Design and Engineering Services</p>
          </div>
          <div className="service-item">
            <h3>RFID Tags & Inlays</h3>
            <p>RFID and IoT-powered digital transformations for businesses</p>
          </div>
          <div className="service-item">
            <h3>MedTech ODM Services</h3>
            <p>Original design and manufacturing services for Medical Technology</p>
          </div>
          <div className="service-item">
            <h3>Magnetics</h3>
            <p>Custom magnetics components, transformers, inductors, chokes, & coils</p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews">
        <h2>Customer Reviews</h2>

        {!hasReviewed ? (
          <form className="review-form" onSubmit={handleSubmit}>
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  size={24}
                  className={rating > i ? "star active" : "star"}
                  onClick={() => setRating(i + 1)}
                />
              ))}
            </div>
            <textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <button type="submit">Submit Review</button>
          </form>
        ) : (
          <p>You have already submitted a review. Thank you!</p>
        )}

        <ul className="review-list">
          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <li key={review.id}>
                <strong>{review.user}</strong> -{" "}
                <span className="stars">
                  {[...Array(review.rating)].map((_, i) => (
                    <FaStar key={i} size={16} className="star active" />
                  ))}
                </span>
                <p>{review.comment}</p>
                <small>{new Date(review.created_at).toLocaleDateString()}</small>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* Contact Section */}
      <section className="contact">
        <h2>Contact Us</h2>
        <p>Email: ithelpdesk@syrmasgs.com</p>
        <p>Phone: 04471728600</p>

        <div className="social-links">
          <a href="https://www.facebook.com/syrmatechnology/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="https://twitter.com/syrmatechnology?lang=" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://www.linkedin.com/company/syrma-technology/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-linkedin-in"></i>
          </a>
          <a href="https://www.instagram.com/syrmatech" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
        </div>

        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15554.10556152085!2d80.10957616977537!3d12.938132899999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525f0911c00001%3A0xf7e9948dd76e4c67!2sSyrma%20Sgs%20Technology!5e0!3m2!1sen!2sin!4v1742115139134!5m2!1sen!2sin"
          width="600"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </div>
  );
};

export default Home;
