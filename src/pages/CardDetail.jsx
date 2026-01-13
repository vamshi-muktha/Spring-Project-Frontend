import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../config/api";
import ben10Image from "../assets/ben10.png";
import "./CardDetail.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

function CardDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cid = searchParams.get("cid");

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpdateType, setShowUpdateType] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletingCard, setDeletingCard] = useState(false);
  const [updatingCardType, setUpdatingCardType] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const fetchCardDetails = useCallback(async () => {
    if (!cid) return;
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl(`/cards/${cid}`), {
        withCredentials: true
      });
      setCard(response.data);
      console.log(response.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch card details:", err);
      setError(err.response?.data?.message || "Failed to load card details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [cid]);

  useEffect(() => {
    if (cid) {
      fetchCardDetails();
    } else {
      setError("Card ID is missing");
      setLoading(false);
    }
    // Set CSS variable for Ben 10 background image
    document.documentElement.style.setProperty('--ben10-image', `url(${ben10Image})`);
  }, [cid, fetchCardDetails]);

  const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return "";
    const cleaned = cardNumber.replace(/\s/g, "");
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(" ") : cardNumber;
  };

  const getCardTypeGradient = (cardType, type) => {
    const isCredit = type?.toLowerCase() === "credit";
    
    if (cardType?.toLowerCase() === "platinum") {
      return isCredit 
        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    } else if (cardType?.toLowerCase() === "gold") {
      return isCredit
        ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        : "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)";
    } else if (cardType?.toLowerCase() === "silver") {
      return isCredit
        ? "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
        : "linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)";
    }
    return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  };

  const getCardLimit = (cardType) => {
    switch (cardType?.toLowerCase()) {
      case "gold":
        return 50000;
      case "platinum":
        return 100000;
      case "silver":
        return 30000;
      default:
        return 0;
    }
  };

  const handlePayBill = () => {
    navigate(`/payBill?cid=${cid}`);
  };

  const handleAddMoney = () => {
    navigate(`/addMoney?cid=${cid}`);
  };

  const handleDeleteCard = async () => {
    // Prevent multiple submissions
    if (deletingCard) {
      return;
    }
    
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      setDeletingCard(true);
      await axios.delete(getApiUrl(`/cards/${cid}`), {
        withCredentials: true
      });
      alert("Card deleted successfully!");
      navigate("/cards/mycards");
    } catch (err) {
      console.error("Failed to delete card:", err);
      setError(err.response?.data?.message || "Failed to delete card. Please try again.");
      setDeleteConfirm(false);
      setDeletingCard(false);
    }
  };

  const handleUpdateCardType = async (newType) => {
    // Prevent multiple submissions
    if (updatingCardType) {
      return;
    }
    
    try {
      setUpdatingCardType(true);
      await axios.put(
        getApiUrl(`/cards/updateType/${cid}?newType=${newType}`),
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      alert(`Card type updated to ${newType} successfully!`);
      fetchCardDetails();
      setShowUpdateType(false);
    } catch (err) {
      console.error("Failed to update card type:", err);
      if (err.response?.status === 404) {
        setError("Update card type endpoint not found. Please contact support or use the admin panel.");
      } else {
        setError(err.response?.data?.message || "Failed to update card type. Please try again.");
      }
    } finally {
      setUpdatingCardType(false);
    }
  };

  const handleViewTransactions = async () => {
    if (showTransactions) {
      setShowTransactions(false);
      return;
    }

    try {
      const response = await axios.get(getApiUrl(`/payment/${cid}/transactions`), {
        withCredentials: true
      });
      const transactionData = Array.isArray(response.data) ? response.data : (response.data?.transactions || []);
      setTransactions(transactionData);
      setShowTransactions(true);
      console.log("transactionData", transactionData);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      // If API doesn't exist (404), show empty state
      if (err.response?.status === 404) {
        setTransactions([]);
        setShowTransactions(true);
      } else {
        setError(err.response?.data?.message || "Failed to load transactions. The transactions feature may not be available yet.");
        setTransactions([]);
        setShowTransactions(true);
      }
    }
  };

  const canPayBill = () => {
    if (!card) return false;
    if (card.type?.toLowerCase() !== "credit") return false;
    if (!card.active) return false;
    if (card.cardStatus !== "ACCEPTED") return false;
    
    const cardLimit = getCardLimit(card.cardType);
    const currentAmount = parseFloat(card.balance || card.amount || 0) || 0;
    const amountPayable = cardLimit - currentAmount;
    
    return amountPayable > 0;
  };

  const canAddMoney = () => {
    if (!card) return false;
    return card.type?.toLowerCase() === "debit" && card.active && card.cardStatus === "ACCEPTED";
  };

  const canUpgrade = () => {
    if (!card) return false;
    const cardType = card.cardType?.toLowerCase();
    return cardType === "silver" || cardType === "gold";
  };

  if (loading) {
    return (
      <div className="card-detail-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading card details...</p>
        </div>
      </div>
    );
  }

  if (error && !card) {
    return (
      <div className="card-detail-container">
        <div className="error-message">{error}</div>
        <Link to="/cards/mycards" className="back-link">← Back to My Cards</Link>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="card-detail-container">
        <div className="error-message">Card not found</div>
        <Link to="/cards/mycards" className="back-link">← Back to My Cards</Link>
      </div>
    );
  }
  const handleToggleCardStatus = async () => {
    // Prevent multiple submissions
    if (togglingStatus) {
      return;
    }
    
    try {
      setTogglingStatus(true);
      await axios.put(getApiUrl(`/cards/changeStatus/${cid}`), {}, {
        withCredentials: true
      });
      fetchCardDetails();
      setError("");
    } catch (err) {
      console.error("Failed to toggle card status:", err);
      setError(err.response?.data?.message || "Failed to toggle card status. Please try again.");
    } finally {
      setTogglingStatus(false);
    }
  };
  const cardLimit = getCardLimit(card.cardType);
  const currentBalance = parseFloat(card.balance || card.amount || 0) || 0;
  const amountPayable = card.type?.toLowerCase() === "credit" ? cardLimit - currentBalance : 0;

  return (
    <div className="card-detail-container">
      <Navbar/>
      <br/>
      <div className="card-detail-content">
        <header className="card-detail-header">
          <h1>Card Details</h1>
          <Link to="/cards/mycards" className="back-link">← Back to My Cards</Link>
        </header>

        {error && <div className="error-message">{error}</div>}

        {/* Large Card Display */}
        <div className="large-card-wrapper">
          <div 
            className="large-card"
            style={{
              background: getCardTypeGradient(card.cardType, card.type)
            }}
          >
            <div className="large-card-header">
              <div className="large-card-type-badge">
                {card.cardType || "Card"}
              </div>
              <div className={`large-card-status ${card.active ? "active" : "inactive"}`}>
                {card.active ? "✓ Active" : "○ Inactive"}
              </div>
            </div>

            <div className="large-card-body">
              <div className="large-card-chip">💳</div>
              <div className="large-card-number">
                {formatCardNumber(card.cardNumber)}
              </div>
              <div className="large-card-details">
                <div className="large-card-name">
                  {card.cardName || "Card Holder"}
                </div>
                <div className="large-card-expiry">
                  {card.cardExpiry || "MM/YY"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Information */}
        <div className="card-info-section">
          <h2>Card Information</h2>
          <div className="card-info-grid">
            <div className="info-item">
              <span className="info-label">Card Type:</span>
              <span className="info-value">{card.cardType || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Card Category:</span>
              <span className="info-value">{card.type || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">PAN:</span>
              <span className="info-value">{card.PAN || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Monthly Income:</span>
              <span className="info-value">₹{(card.monthlyIncome || 0).toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Employment Status:</span>
              <span className="info-value">{card.empStatus || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Card Status:</span>
              <span className="info-value">{card.cardStatus || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Card Active:</span>
              <span className="info-value">{card.active ? "Active" : "Inactive" || "N/A"}</span>
            </div>
            {card.type?.toLowerCase() === "credit" && (
              <>
                <div className="info-item">
                  <span className="info-label">Card Limit:</span>
                  <span className="info-value">₹{cardLimit.toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Current Balance:</span>
                  <span className="info-value">₹{currentBalance.toLocaleString()}</span>
                </div>
                <div className="info-item highlight">
                  <span className="info-label">Amount Payable:</span>
                  <span className="info-value amount-payable">₹{amountPayable.toLocaleString()}</span>
                </div>
              </>
            )}
            {card.type?.toLowerCase() === "debit" && (
              <div className="info-item">
                <span className="info-label">Current Balance:</span>
                <span className="info-value">₹{currentBalance.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="actions-section">
          <h2>Actions</h2>
          <div className="action-buttons-grid">
            {canPayBill() && (
              <button className="action-btn pay-bill-btn" onClick={handlePayBill}>
                💳 Pay Bill
              </button>
            )}
            {canAddMoney() && (
              <button className="action-btn add-money-btn" onClick={handleAddMoney}>
                💰 Add Money
              </button>
            )}
            <button className="action-btn transactions-btn" onClick={handleViewTransactions}>
              📊 {showTransactions ? "Hide" : "View"} Previous Transactions
            </button>
            {canUpgrade() && (
              <button 
                className="action-btn upgrade-btn" 
                onClick={() => setShowUpdateType(!showUpdateType)}
              >
                ⬆️ Update Card Type
              </button>
            )}
            <button 
              className="action-btn delete-btn" 
              onClick={handleDeleteCard}
              disabled={deletingCard}
            >
              {deletingCard ? "Deleting..." : deleteConfirm ? "⚠️ Confirm Delete" : "🗑️ Delete Card"}
            </button>
            <button 
              className="action-btn upgrade-btn" 
              onClick={handleToggleCardStatus}
              disabled={togglingStatus}
            >
              {togglingStatus ? "Toggling..." : "Toggle Card Status"}
            </button>
          </div>

          {/* Update Card Type Section */}
          {showUpdateType && canUpgrade() && (
            <div className="update-type-section">
              <h3>Upgrade Card Type</h3>
              <div className="upgrade-options">
                {card.cardType?.toLowerCase() === "silver" && (
                  <>
                    <button 
                      className="upgrade-option-btn gold"
                      onClick={() => handleUpdateCardType("GOLD")}
                    >
                      Upgrade to Gold
                    </button>
                    <button 
                      className="upgrade-option-btn platinum"
                      onClick={() => handleUpdateCardType("PLATINUM")}
                    >
                      Upgrade to Platinum
                    </button>
                  </>
                )}
                {card.cardType?.toLowerCase() === "gold" && (
                  <button 
                    className="upgrade-option-btn platinum"
                    onClick={() => handleUpdateCardType("PLATINUM")}
                    disabled={updatingCardType}
                  >
                    {updatingCardType ? "Upgrading..." : "Upgrade to Platinum"}
                  </button>
                )}
                <button 
                  className="upgrade-option-btn cancel"
                  onClick={() => setShowUpdateType(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Transactions Section */}
          {showTransactions && (
            <div className="transactions-section">
              <h3>Transaction History</h3>
              {transactions.length > 0 ? (
                <div className="transactions-list">
                  {transactions.map((transaction, index) => (
                    <div key={index} className="transaction-item">
                      <div className="transaction-info">
                        <span className="transaction-type">{transaction.type || "Transaction"}</span>
                        <span className="transaction-date">{transaction.status || "N/A"}</span>
                        <span className="transaction-date">OrderId : {transaction.orderId || "N/A"}</span>
                      </div>
                      <div className="transaction-amount">
                        ₹{parseFloat(transaction.amount || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-transactions">
                  <p>No transaction history available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default CardDetail;
