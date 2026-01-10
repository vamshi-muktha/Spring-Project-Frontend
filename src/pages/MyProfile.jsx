import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../config/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./MyProfile.css";

function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl("/users/getcurruser"), {
        withCredentials: true
      });
      setUser(response.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setError(err.response?.data?.message || "Failed to load profile information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="myprofile-page">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="myprofile-page">
      <Navbar />
      <div className="myprofile-container">
        <div className="myprofile-content">
          <h1>My Profile</h1>

          {error && <div className="error-message">{error}</div>}

          {user ? (
            <div className="profile-section">
              <div className="profile-header">
                <div className="profile-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="profile-name-section">
                  <h2>{user.name || "User"}</h2>
                  <p className="profile-email">{user.email || "N/A"}</p>
                  {user.role && (
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  )}
                </div>
              </div>

              <div className="profile-details">
                <h3>Account Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">User ID</span>
                    <span className="detail-value">{user.id || user.userId || "N/A"}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Username</span>
                    <span className="detail-value">{user.username || user.name || "N/A"}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{user.email || "N/A"}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">{user.name || "N/A"}</span>
                  </div>

                  {user.role && (
                    <div className="detail-item">
                      <span className="detail-label">Account Type</span>
                      <span className="detail-value">{user.role}</span>
                    </div>
                  )}

                  {user.phone && (
                    <div className="detail-item">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{user.phone}</span>
                    </div>
                  )}

                  {user.address && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Address</span>
                      <span className="detail-value">{user.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-actions">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                  <Link to="/cards/mycards" className="action-card">
                    <div className="action-icon">💳</div>
                    <h4>My Cards</h4>
                    <p>View and manage your cards</p>
                  </Link>
                  
                  <Link to="/cardform" className="action-card">
                    <div className="action-icon">➕</div>
                    <h4>Apply for Card</h4>
                    <p>Apply for a new card</p>
                  </Link>

                  <Link to="/payment" className="action-card">
                    <div className="action-icon">💸</div>
                    <h4>Make Payment</h4>
                    <p>Process payments</p>
                  </Link>

                  <Link to="/contactus" className="action-card">
                    <div className="action-icon">📧</div>
                    <h4>Contact Support</h4>
                    <p>Get help and support</p>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-profile">
              <p>Unable to load profile information.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default MyProfile;
