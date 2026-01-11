import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../config/api";
import "./home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showPendingPayments, setShowPendingPayments] = useState(false);
  const [activeCards, setActiveCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(getApiUrl("/users/getcurruser"), {
          withCredentials: true
        });
        setUser(response.data);
        console.log("Current user", response.data);
        console.log("User role", response.data?.role); // Log from response.data, not from state
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("Failed to load user information");
      }
    };
    fetchUser();
  }, []);

  

  const handlePaymentAction = async (pid,amt, status, cid = null) => {
    setError("");
    setPaymentStatus("");

    // For PAID status, require a card to be selected
    if (status === "PAID" && !cid) {
      setError("Please select a card before making payment.");
      return;
    }
    if(status === "REJECTED"){
      window.alert("Payment rejected successfully!");
    }

    try {
      let url = `${getApiUrl("/payment/payNow")}?pid=${pid}&status=${status}&amt=${amt}`;
      if (cid !== null && cid !== undefined) {
        url += `&cid=${cid}`;
    } else {
        url += `&cid=-1`;
    }
    

      const ress = await axios.put(
        url,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );
      console.log("ress", ress.data);
      if(ress.data === "Amount low in that card try with another card"){
        setError(ress.data);
        return;
      }
      if (ress.data === "OTP_REQUIRED") {

        if (!user || !user.email) {
          setError("User details not loaded. Please try again.");
          return;
        }
      
        window.location.href =
          `/otp?pid=${pid}&amount=${amt}&cid=${cid}&email=${encodeURIComponent(user.email)}&status=${status}`;
      
        return;
      }
       
      // setPaymentStatus(
      //   status === "PAID" 
      //     ? "Payment processed successfully!" 
      //     : "Payment rejected successfully!"
      // );
      
      // Refresh pending payments list
      setLoadingPayments(true);
      await fetchPendingPayments();
      setLoadingPayments(false);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed. Please try again.");
    }
  };

  const handleCardSelection = (pid, cid) => {
    setSelectedCards(prev => ({
      ...prev,
      [pid]: cid
    }));
  };

  const fetchActiveCards = async () => {
    try {
      const response = await axios.get(getApiUrl("/cards/activeCards"), {
        withCredentials: true
      });
      setActiveCards(response.data);
      console.log("active-cards", response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch active cards. Please try again.");
    }
  };

  useEffect(() => {
    fetchActiveCards();
  }, []);


  // const handleLogout = async (e) => {
  //   e.preventDefault();
  //   setError("");

  //   try {
  //     await axios.post(
  //       getApiUrl("/logout"),
  //       {},
  //       {
  //         withCredentials: true,
  //         headers: {
  //           "Content-Type": "application/x-www-form-urlencoded"
  //         }
  //       }
  //     );

  //     window.location.href = "/login";
  //   } catch (err) {
  //     setError("Logout failed. Please try again.");
  //   }
  // };

  const fetchPendingPayments = async () => {
    try {
      // First, get the current user
      const userResponse = await axios.get(
        getApiUrl("/users/getcurruser"),
        {
          withCredentials: true
        }
      );

      const userId = userResponse.data?.id;
      
      if (!userId) {
        setError("Unable to get user information");
        return;
      }

      // Then, get pending payments for this user
      const paymentsResponse = await axios.get(
        `${getApiUrl("/payment/getPending")}?uid=${userId}`,
        {
          withCredentials: true
        }
      );

      setPendingPayments(Array.isArray(paymentsResponse.data) ? paymentsResponse.data : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pending payments. Please try again.");
      setPendingPayments([]);
    }
  };

  const handleSeePendingPayments = async () => {
    setError("");
    setLoadingPayments(true);
    setShowPendingPayments(true);

    await fetchPendingPayments();
    setLoadingPayments(false);
  };

  return (
    <div className="home-container">
      <Navbar/>
      <div className="home-content">
        <header className="home-header">
          <h1>Welcome to SecureCard</h1>
          <p className="home-subtitle">Your trusted digital payment and card management platform</p>
        </header>
        
        <nav className="home-nav">
        {user && user.role === "ADMIN" &&
          <Link to="/adminhome" className="nav-link">
            Admin Dashboard
          </Link>
        }
          <Link to="/cardform" className="nav-link">
            Apply New Card
          </Link>
          <Link to="/cards/mycards" className="nav-link">
            See My Cards
          </Link>
          <button 
            onClick={handleSeePendingPayments}
            className="nav-link nav-button"
            disabled={loadingPayments}
          >
            {loadingPayments ? "Loading..." : "See Pending Payments"}
          </button>
        </nav>

        {showPendingPayments ? (
          <section className="pending-payments">
            <h2>Pending Payments</h2>
            
            {error && <div className="error-message">{error}</div>}
            {paymentStatus && <div className="success-message">{paymentStatus}</div>}

            <div className="pending-payments-list">
              {loadingPayments ? (
                <div className="loading-payments">
                  <div className="spinner-small"></div>
                  <p>Loading pending payments...</p>
                </div>
              ) : pendingPayments.length === 0 ? (
                <div className="no-pending-payments">
                  <p>No pending payments found.</p>
                </div>
              ) : (
                <div className="payments-list">
                  {pendingPayments.map((payment, index) => (
                    <div key={payment.pid || index} className="payment-item">
                      <div className="payment-info">
                        <p><strong>Order ID:</strong> {payment.orderId || `ORD${index + 1}`}</p>
                        <p>
                          <strong>Amount:</strong>{" "}
                          <span style={{ textDecoration: "line-through", color: "#888" }}>
                            ₹{parseInt(payment.amount) || "N/A"}
                          </span>
                          {"  "}
                          <span style={{ color: "#28a745", fontWeight: "bold", marginLeft: "8px" }}>
                            ₹{payment.amount ? parseInt(payment.amount * 0.9) : "N/A"}
                          </span>
                          <br />
                          <small style={{ color: "#ff5722" }}>
                            🎉 10% OFF for using Secure Card
                          </small>
                        </p>

                        <p><strong>Status:</strong> <span className="status-pending">PENDING</span></p>
                        {payment.pid && <p><strong>Payment ID:</strong> {payment.pid}</p>}
                        <p><strong>pay using : </strong>
                        <select 
                        name={`card-${payment.pid || index}`} 
                        id={`card-${payment.pid || index}`}
                        value={selectedCards[payment.pid] || ""}
                        onChange={(e) => handleCardSelection(payment.pid, e.target.value)}
                      >
                        <option value="">Select a card</option>
                        {activeCards.map((card) => (
                          <option key={card.cid} value={card.cid}>{card.cardNumber}</option>
                        ))}
                      </select>
                      </p>
                      <button className= "payment-button-success" onClick={() => handlePaymentAction(payment.pid,parseInt(payment.amount * 0.9), "PAID", selectedCards[payment.pid])}>Pay</button>
                      <button className= "payment-button-danger" onClick={() => handlePaymentAction(payment.pid,parseInt(payment.amount * 0.9), "REJECTED")}>Reject</button>
                      
                      </div>
                     
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="about-section">
            <div className="about-card">
            <h2 style={{ color: "#ebedf8" }}>
  About SecureCard
</h2>


              <p style={{ color: "#ebedf8" }} className="about-description">
                SecureCard is a comprehensive digital payment and card management platform designed 
                to provide you with secure, convenient, and efficient financial services. Manage 
                your cards, process payments, and track transactions all in one place.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">💳</div>
                <h3>Card Management</h3>
                <p>Apply for new credit or debit cards and manage all your cards in one secure location.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Secure Payments</h3>
                <p>Process payments safely with our encrypted payment gateway and secure card transactions.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Payment Tracking</h3>
                <p>View and manage all your pending payments with real-time status updates.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h3>Bank-Level Security</h3>
                <p>Your financial data is protected with industry-standard encryption and security measures.</p>
              </div>
            </div>
          </section>
        )}

        {/* <form onSubmit={handleLogout} className="logout-form">
          <button type="submit" className="logout-button">Logout</button>
        </form> */}
      </div>
      <Footer/>
    </div>
  );
}

export default Home;
