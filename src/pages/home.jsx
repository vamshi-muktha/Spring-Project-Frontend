import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../config/api";
import "./home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import gsap from "gsap";
function Home() {
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showPendingPayments, setShowPendingPayments] = useState(false);
  const [activeCards, setActiveCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState({});
  const [user, setUser] = useState(null);

  const [couponCodes, setCouponCodes] = useState({});
  const [discountedAmounts, setDiscountedAmounts] = useState({});
  const [disablePay, setDisablePay] = useState(false);




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

  useEffect(() => {
    
    gsap.set("#pendulum", { rotate: -15 });
    gsap.to("#pendulum", {
      rotate: 15,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: "linear",
    });
 
  }, []);

  const handleApplyCoupon = (pid, originalAmount) => {
    const code = couponCodes[pid];

    if (code === "SECURE10") {
      const discounted = Math.floor(originalAmount * 0.9);
      setDiscountedAmounts(prev => ({
        ...prev,
        [pid]: discounted
      }));
    } else {
      alert("Invalid Coupon Code");
      setDiscountedAmounts(prev => ({
        ...prev,
        [pid]: originalAmount
      }));
    }
  };


  const handlePaymentAction = async (pid, amt, status, cid = null) => {
    if(disablePay)return;
    setDisablePay(true);
    setError("");
    setPaymentStatus("");

    // For PAID status, require a card to be selected
    if (status === "PAID" && !cid) {
      setError("Please select a card before making payment.");
      return;
    }
    if (status === "REJECTED") {
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
      if (ress.data === "Amount low in that card try with another card") {
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
    }finally{
      setDisablePay(false);
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
      <Navbar />
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
                        {/* <p>
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
                        </p> */}

                        <p>
                          <strong>Amount:</strong>{" "}
                          <span style={{ textDecoration: discountedAmounts[payment.pid] ? "line-through" : "none", color: "#888" }}>
                            ₹{parseInt(payment.amount)}
                          </span>

                          {discountedAmounts[payment.pid] && (
                            <span style={{ color: "#28a745", fontWeight: "bold", marginLeft: "8px" }}>
                              ₹{discountedAmounts[payment.pid]}
                            </span>
                          )}
                          <br />
                          {discountedAmounts[payment.pid] && <small style={{ color: "#ff5722" }}>
                            🎉 10% OFF for using Secure Card
                          </small>}
                        </p>
                        <div style={{ marginTop: "8px" }}>
                          <input
                            type="text"
                            placeholder="Enter coupon"
                            value={couponCodes[payment.pid] || ""}
                            onChange={(e) =>
                              setCouponCodes(prev => ({
                                ...prev,
                                [payment.pid]: e.target.value
                              }))
                            }
                          />
                          <button
                            style={{ marginLeft: "8px" }}
                            onClick={() => handleApplyCoupon(payment.pid, parseInt(payment.amount))}
                          >
                            Apply
                          </button>
                        </div>


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
                        {/* <button className= "payment-button-success" onClick={() => handlePaymentAction(payment.pid,parseInt(payment.amount * 0.9), "PAID", selectedCards[payment.pid])}>Pay</button> */}
                        <button
                          className="payment-button-success"
                          disabled={disablePay}
                          onClick={() =>
                            handlePaymentAction(
                              payment.pid,
                              discountedAmounts[payment.pid] || parseInt(payment.amount),
                              "PAID",
                              selectedCards[payment.pid]
                            )
                          }
                        >
                          Pay
                        </button>

                        <button className="payment-button-danger" onClick={() => handlePaymentAction(payment.pid, parseInt(payment.amount * 0.9), "REJECTED")}>Reject</button>

                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </section>
        ) : (
          
          <section className="about-section">
            <div
  id="pendulum"
  style={{
    position: "absolute",
    left: "20%",
    top: "280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 10,
    transformOrigin: "50% 0%"
  }}
>
  {/* Top pin */}
  <div
    style={{
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      backgroundColor: "#656565",
      position: "relative",
      zIndex: 10
    }}
  />

  {/* Hanging section */}
  <div
    style={{
      position: "absolute",
      top: "8px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "160px",
      transformOrigin: "center top"
    }}
  >
    <svg style={{ height: "64px", width: "100%" }}>
      <line x1="49%" y1="-2" x2="15%" y2="100%" stroke="#656565" strokeWidth="2" />
      <line x1="51%" y1="-2" x2="85%" y2="100%" stroke="#656565" strokeWidth="2" />
    </svg>

    <div
      style={{
        backgroundColor: "#fb923c",
        color: "#fff",
        padding: "8px 24px",
        borderRadius: "6px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        position: "relative"
      }}
    >
      <span
        style={{
          fontSize: "18px",
          fontWeight: "700",
          whiteSpace: "nowrap",
          textAlign: "center"
        }}
      >
        Use Seure Feel Secure
      </span>

      {/* dashed border */}
      <div
        style={{
          
          position: "absolute",
          inset: 0,
          border: "2px dashed white",
          borderRadius: "6px"
        }}
      />
    </div>
  </div>
</div>

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
            <div
              onClick={() => window.location.href = "/payment"}
              style={{
                width: "100%",
                // marginLeft:"15rem",
                paddingleft: "16px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                cursor: "pointer",
                border: "1px solid #e0e0e0",
                transition: "0.3s",
                fontFamily: "Arial",
                background: "linear-gradient(135deg, #667eea, #764ba2)",

                color: "#ebedf8"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >

              <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <img
                  src="https://logos-world.net/wp-content/uploads/2020/11/Flipkart-Logo.png"
                  alt="Flipkart"
                  style={{ height: "30px" }}
                />

                <strong style={{ fontSize: "18px" }}>Flipkart</strong>
              </div>
              <div>
                <p style={{  textAlign: "center", margin: "12px 0 6px", fontSize: "14px", color: "#555" }}>
                  Pay securely using
                </p>

                <h3 style={{textAlign: "center",  margin: "0", color: "#FFF" }}>
                  Secure Card
                </h3>

                <p style={{ textAlign: "center",  marginTop: "8px", fontSize: "13px", color: "#000" }}>
                  🎉 Get 10% instant discount
                </p>
              </div>


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
        <div></div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
