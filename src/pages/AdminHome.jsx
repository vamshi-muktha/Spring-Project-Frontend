import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../config/api";
import "./AdminHome.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function AdminHome() {
  const [activeTab, setActiveTab] = useState("users"); // "users" or "requests"
  const [expandedUsers, setExpandedUsers] = useState({}); // Track which users' cards are expanded
  const [userCards, setUserCards] = useState({}); // Store cards for each user
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingQueries, setLoadingQueries] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedMail, setExpandedMail] = useState({});
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [queries, setQueries] = useState([]);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [expandedQueryMail, setExpandedQueryMail] = useState({});
  const [queryEmail, setQueryEmail] = useState("");
  const [querySubject, setQuerySubject] = useState("");
  const [queryBody, setQueryBody] = useState("");
  const [sendingMail, setSendingMail] = useState(false);
  const [sendingQueryMail, setSendingQueryMail] = useState({});
  const [deactivatingCard, setDeactivatingCard] = useState({});
  const [deletingUser, setDeletingUser] = useState({});
  const [acceptingRequest, setAcceptingRequest] = useState({});
  const [rejectingRequest, setRejectingRequest] = useState({});

  // Fetch all users on component mount
  useEffect(() => {
    fetchAllUsers();
    fetchActiveQueries();
  }, []);

  // Fetch users data
  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true);
      setError("");
      const response = await axios.get(getApiUrl("/users/getUsers"), {
        withCredentials: true
      });
      setUsers(response.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.response?.data?.message || "Failed to load users. Please try again.");
    } finally {
      setLoadingUsers(false);
    }
  };
  const fetchActiveQueries = async() => {
    try{
      setLoadingUsers(true);
      setError("");
      const response = await axios.get(getApiUrl("/query/activeQueries"), {
        withCredentials: true
      });
      console.log(response.data);
      setQueries(response.data || []);
    }catch(err){
      console.error("Failed to fetch users:", err);
      setError(err.response?.data?.message || "Failed to load users. Please try again.");
    } finally {
      setLoadingQueries(false);
    }
  }
  // Fetch pending requests
  const fetchPendingRequests = async () => {
    try {
      setLoadingRequests(true);
      setError("");
      const response = await axios.get(getApiUrl("/admin/pendingRequests"), {
        withCredentials: true
      });
      setPendingRequests(response.data || []);
      //   console.log("Pending requests:", response.data);
    } catch (err) {
      console.error("Failed to fetch pending requests:", err);
      setError(err.response?.data?.message || "Failed to load pending requests. Please try again.");
    } finally {
      setLoadingRequests(false);
    }
  };

  // Fetch cards for a specific user
  const fetchUserCards = async (userId) => {
    // If already fetched and expanded, don't fetch again
    if (userCards[userId] && expandedUsers[userId]) {
      return;
    }

    try {
      const response = await axios.get(getApiUrl(`/admin/cardsbyuser/${userId}`), {
        withCredentials: true
      });
      setUserCards(prev => ({
        ...prev,
        [userId]: response.data || []
      }));
    } catch (err) {
      console.error("Failed to fetch user cards:", err);
      setError(err.response?.data?.message || "Failed to load user cards. Please try again.");
    }
  };

  // Fetch pending requests when tab is switched
  useEffect(() => {
    if (activeTab === "requests") {
      fetchPendingRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const toggleUserCards = async (userId) => {
    const isExpanding = !expandedUsers[userId];
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));

    // Fetch cards when expanding
    if (isExpanding) {
      await fetchUserCards(userId);
    }
  };


  const toggleMail = (user) => {
    const isExpanding = !expandedMail[user.id];

    setExpandedMail(prev => ({
      ...prev,
      [user.id]: isExpanding
    }));

    if (isExpanding) {
      setEmail(user.email);   // auto-fill when expanding
      setSubject("");
      setBody("");
    }
  };

  const toggleQueryMail = (query) => {
    const isExpanding = !expandedQueryMail[query.qid];

    setExpandedQueryMail(prev => ({
      ...prev,
      [query.qid]: isExpanding
    }));

    if (isExpanding) {
      setQueryEmail(query.email);   // auto-fill when expanding
      setQuerySubject("");
      setQueryBody("");
    }
  };



  const handleSendMail = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (sendingMail) {
      return;
    }

    try {
      setError("");
      setSendingMail(true);

      await axios.post(
        getApiUrl("/admin/sendmail"),
        {
          to: email,
          subject,
          body
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        }
      );

      setSuccessMessage(`Email sent successfully to ${email}`);
      setTimeout(() => setSuccessMessage(""), 3000);

      setEmail("");
      setSubject("");
      setBody("");

    } catch (err) {
      setError(err.response?.data || "Failed to send email");
    } finally {
      setSendingMail(false);
    }
  };

  const handleQuerySendMail = async (qid, e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (sendingQueryMail[qid]) {
      return;
    }

    try {
      setError("");
      setSendingQueryMail(prev => ({ ...prev, [qid]: true }));

      await axios.post(
        getApiUrl(`/query/sendmail?qid=${qid}`),
        {
          to: queryEmail,
          subject: querySubject,
          body: queryBody
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        }
      );

      setSuccessMessage(`Email sent successfully to ${queryEmail}`);
      setTimeout(() => setSuccessMessage(""), 3000);

      setQueryEmail("");
      setQuerySubject("");
      setQueryBody("");

    } catch (err) {
      setError(err.response?.data || "Failed to send email");
    } finally {
      setSendingQueryMail(prev => ({ ...prev, [qid]: false }));
    }
  };


  const handleDeactivateCard = async (userId, cid) => {
    // Prevent multiple submissions
    if (deactivatingCard[cid]) {
      return;
    }
    
    if (!window.confirm("Are you sure you want to deactivate this card?")) {
      return;
    }

    try {
      setError("");
      setDeactivatingCard(prev => ({ ...prev, [cid]: true }));
      await axios.put(getApiUrl(`/admin/changeStatus/${cid}/${userId}`), {}, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json"
        }
      });

      // Update local state
      setUserCards(prev => ({
        ...prev,
        [userId]: prev[userId]?.map(card =>
          card.cid === cid ? { ...card, active: false } : card
        ) || []
      }));

      setSuccessMessage("Card deactivated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to deactivate card:", err);
      setError(err.response?.data?.message || "Failed to deactivate card. Please try again.");
    } finally {
      setDeactivatingCard(prev => ({ ...prev, [cid]: false }));
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError("");
      setDeletingUser(prev => ({ ...prev, [userId]: true }));
      await axios.delete(getApiUrl(`/admin/users/${userId}`), {
        withCredentials: true
      });

      // Remove user from local state
      setUsers(prev => prev.filter(user => user.id !== userId));
      setSuccessMessage(`User "${username}" deleted successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError(err.response?.data?.message || "Failed to delete user. Please try again.");
    } finally {
      setDeletingUser(prev => ({ ...prev, [userId]: false }));
    }
  };


  const handleAcceptRequest = async (cid) => {
    // Prevent multiple submissions
    if (acceptingRequest[cid] || rejectingRequest[cid]) {
      return;
    }
    
    try {
      setError("");
      setAcceptingRequest(prev => ({ ...prev, [cid]: true }));
      await axios.put(
        getApiUrl(`/admin/accept/${cid}`),
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      // Remove request from local state
      setPendingRequests(prev => prev.filter(req => req.cid !== cid));
      setSuccessMessage("Request accepted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to accept request:", err);
      setError(err.response?.data?.message || "Failed to accept request. Please try again.");
    } finally {
      setAcceptingRequest(prev => ({ ...prev, [cid]: false }));
    }
  };

  const handleRejectRequest = async (cid) => {
    // Prevent multiple submissions
    if (acceptingRequest[cid] || rejectingRequest[cid]) {
      return;
    }
    
    if (!window.confirm("Are you sure you want to reject this request?")) {
      return;
    }

    try {
      setError("");
      setRejectingRequest(prev => ({ ...prev, [cid]: true }));
      await axios.put(
        getApiUrl(`/admin/reject/${cid}`),
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      // Remove request from local state
      setPendingRequests(prev => prev.filter(req => req.cid !== cid));
      setSuccessMessage("Request rejected successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to reject request:", err);
      setError(err.response?.data?.message || "Failed to reject request. Please try again.");
    } finally {
      setRejectingRequest(prev => ({ ...prev, [cid]: false }));
    }
  };

  return (
    <div className="admin-home-container">
      <Navbar />
      <div className="admin-home-content">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">Manage users, cards, and pending requests</p>
          <Link to="/home" className="back-to-home-btn">← Back to Home</Link>
        </header>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            See All Users
          </button>
          <button
            className={`tab-button ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            Pending Requests
          </button>
          <button
            className={`tab-button ${activeTab === "queries" ? "active" : ""}`}
            onClick={() => setActiveTab("queries")}
          >
            Queries
          </button>
        </div>

        {/* Error and Success Messages */}
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Users Tab Content */}
        {activeTab === "users" && (
          <div className="users-section">
            <h2>All Users ({users.length})</h2>
            {loadingUsers ? (
              <div className="loading-message">Loading users...</div>
            ) : (
              <div className="table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Username</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Role</th>
                      <th>Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="no-data">No users found</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <>
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.mobileNumber}</td>
                            <td>
                              <span className={`role-badge ${(user.role || "USER").toLowerCase()}`}>
                                {user.role || "USER"}
                              </span>
                            </td>
                            <td>{user.address || "N/A"}</td>
                            <td>
                              <div className="user-actions">
                                <button
                                  className="see-cards-btn"
                                  onClick={() => toggleUserCards(user.id)}
                                >
                                  {expandedUsers[user.id] ? "▼ Hide Cards" : "▶ See All Cards"}
                                </button>
                                <button
                                  className="send-mail-btn"
                                  onClick={() => toggleMail(user)}
                                >
                                  {expandedMail[user.id] ? "▼ Hide mail" : "Send Mail"}
                                </button>

                                <button
                                  className="delete-user-btn"
                                  onClick={() => handleDeleteUser(user.id, user.username)}
                                  disabled={user.role === "ADMIN" || deletingUser[user.id]}
                                  title={user.role === "ADMIN" ? "Cannot delete admin user" : `Delete user ${user.username}`}
                                >
                                  {deletingUser[user.id] ? "Deleting..." : "🗑 Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedUsers[user.id] && (
                            <tr key={`cards-${user.id}`} className="cards-expanded-row">
                              <td colSpan="8">
                                <div className="cards-dropdown">
                                  <h3>Cards for {user.name} ({userCards[user.id]?.length || 0})</h3>
                                  {!userCards[user.id] || userCards[user.id].length === 0 ? (
                                    <div className="no-cards-message">No cards found for this user</div>
                                  ) : (
                                    <div className="cards-grid">
                                      {userCards[user.id].map((card) => (
                                        <div
                                          key={card.cid}
                                          className={`card-item ${!card.active ? "inactive" : ""}`}
                                        >
                                          <div className="card-header-info">
                                            <span className="card-type-badge">{card.cardType || "Card"}</span>
                                            <span className={`card-status ${card.active ? "active" : "inactive"}`}>
                                              {card.active ? "✓ Active" : "○ Inactive"}
                                            </span>
                                          </div>
                                          <div className="card-number-display">
                                            {card.cardNumber || "N/A"}
                                          </div>
                                          <div className="card-details">
                                            <div className="card-detail-row">
                                              <span className="detail-label">Type:</span>
                                              <span className="detail-value">{card.type || "N/A"}</span>
                                            </div>
                                            <div className="card-detail-row">
                                              <span className="detail-label">PAN:</span>
                                              <span className="detail-value">{card.PAN || "N/A"}</span>
                                            </div>
                                          </div>
                                          <button
                                            className="deactivate-card-btn"
                                            onClick={() => handleDeactivateCard(user.id, card.cid)}
                                            disabled={!card.active || deactivatingCard[card.cid]}
                                          >
                                            {deactivatingCard[card.cid] ? "Deactivating..." : card.active ? "Deactivate" : "Deactivated"}
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                          {expandedMail[user.id] && (
                            <tr className="mail-expanded-row">
                              <td colSpan="8">
                                <div className="mail-box">
                                  <form onSubmit={handleSendMail}>
                                    <input
                                      type="email"
                                      placeholder="Enter email"
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      required
                                    />

                                    <input
                                      type="text"
                                      placeholder="Subject"
                                      value={subject}
                                      onChange={(e) => setSubject(e.target.value)}
                                      required
                                    />

                                    <textarea
                                      placeholder="Message"
                                      value={body}
                                      onChange={(e) => setBody(e.target.value)}
                                      required
                                    />

                                    <button type="submit" disabled={sendingMail}>
                                      {sendingMail ? "Sending..." : "Send Mail"}
                                    </button>
                                  </form>
                                </div>
                              </td>
                            </tr>
                          )}


                        </>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pending Requests Tab Content */}
        {activeTab === "requests" && (
          <div className="requests-section">
            <h2>Pending Requests ({pendingRequests.length})</h2>
            {loadingRequests ? (
              <div className="loading-message">Loading pending requests...</div>
            ) : (
              <div className="table-container">
                <table className="requests-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>User ID</th>
                      <th>Username</th>
                      <th>Name</th>
                      <th>Request Type</th>
                      <th>Card Type</th>
                      <th>Debit/Credit</th>
                      <th>PAN</th>
                      <th>Monthly Income</th>
                      <th>Employment</th>
                      <th>Submitted Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="no-data">
                          No pending requests
                        </td>
                      </tr>
                    ) : (
                      pendingRequests.map((request, x) => (

                        <tr key={x || request.id}>
                          <td>{x + 1 || request.id}</td>
                          <td>{request.user.id || request.uid}</td>
                          <td>{request.user.username || "N/A"}</td>
                          <td>{request.user.name || request.userName || "N/A"}</td>
                          <td>{request.requestType || "Card Application"}</td>
                          <td>
                            <span className={`card-type-badge-small ${(request.cardType || "").toLowerCase()}`}>
                              {request.cardType || "N/A"}
                            </span>
                          </td>
                          <td>{request.type || "N/A"}</td>
                          <td>{request.PAN || "N/A"}</td>
                          <td>₹{request.monthlyIncome ? request.monthlyIncome.toLocaleString() : "N/A"}</td>
                          <td>{request.empStatus || request.employmentStatus || "N/A"}</td>
                          <td>{request.submittedDate || request.createdDate || "N/A"}</td>
                          <td>
                            <div className="request-actions">
                              <button
                                className="accept-btn"
                                onClick={() => handleAcceptRequest(request.cid || request.id)}
                                disabled={acceptingRequest[request.cid || request.id] || rejectingRequest[request.cid || request.id]}
                              >
                                {acceptingRequest[request.cid || request.id] ? "Accepting..." : "✓ Accept"}
                              </button>
                              <button
                                className="reject-btn"
                                onClick={() => handleRejectRequest(request.cid || request.id)}
                                disabled={acceptingRequest[request.cid || request.id] || rejectingRequest[request.cid || request.id]}
                              >
                                {rejectingRequest[request.cid || request.id] ? "Rejecting..." : "✗ Reject"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {activeTab === "queries" && (
          <div className="queries-section">
            <h2>Pending Queries ({queries.length})</h2>
            {loadingQueries ? (
              <div className="loading-message">Loading pending queries...</div>
            ) : (
              <div className="table-container">
                <table className="requests-table">
                  <thead>
                    <tr>
                      <th>Query ID</th>
                      <th>User ID</th>
                      <th>email</th>
                      <th>Name</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queries.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="no-data">
                          No pending requests
                        </td>
                      </tr>
                    ) : (
                      queries.map((request, x) => (
                        <>
                        <tr key={request.qid}>
                          <td>{request.qid}</td>
                          <td>{request.userId}</td>
                          <td>{request.email || "N/A"}</td>
                          <td>{request.name || request.userName || "N/A"}</td>
                          <td>{request.subject}</td>
                          <td>{request.message || "N/A"}</td>
                          
                          <td>
                            <div className="queries-actions">
                            <button
                                  className="send-mail-btn"
                                  onClick={() => toggleQueryMail(request)}
                                >
                                  {expandedQueryMail[request.qid] ? "▼ Hide mail" : "Send Mail"}
                                </button>
                              
                            </div>
                          </td>
                        </tr>
                        {expandedQueryMail[request.qid] && (
                            <tr className="mail-expanded-row">
                              <td colSpan="8">
                                <div className="mail-box">
                                  <form onSubmit={(e) => handleQuerySendMail(request.qid, e)}>
                                    <input
                                      type="email"
                                      placeholder="Enter email"
                                      value={queryEmail}
                                      onChange={(e) => setQueryEmail(e.target.value)}
                                      required
                                    />

                                    <input
                                      type="text"
                                      placeholder="Subject"
                                      value={querySubject}
                                      onChange={(e) => setQuerySubject(e.target.value)}
                                      required
                                    />

                                    <textarea
                                      placeholder="Message"
                                      value={queryBody}
                                      onChange={(e) => setQueryBody(e.target.value)}
                                      required
                                    />

                                    <button type="submit" disabled={sendingQueryMail[request.qid]}>
                                      {sendingQueryMail[request.qid] ? "Sending..." : "Send Mail"}
                                    </button>
                                  </form>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      <br />
      <br />
      <Footer />
    </div>
  );
}

export default AdminHome;
