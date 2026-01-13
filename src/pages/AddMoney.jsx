import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../config/api";
import "./AddMoney.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function AddMoney() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cid = searchParams.get("cid"); 

  const [formData, setFormData] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    branchName: ""
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cardInfo, setCardInfo] = useState(null);

  // Fetch card information if cid is provided
  useEffect(() => {
    if (cid) {
      fetchCardInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid]);

  const fetchCardInfo = async () => {
    try {
      const response = await axios.get(getApiUrl(`/cards/${cid}`), {
        withCredentials: true
      });
      setCardInfo(response.data);
    } catch (err) {
      console.error("Failed to fetch card info:", err);
      setError("Failed to load card information. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Amount validation
    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (parseFloat(formData.amount) < 100) {
      newErrors.amount = "Minimum amount is ₹100";
    }

    // Bank name validation
    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    } else if (formData.bankName.trim().length < 2) {
      newErrors.bankName = "Bank name must be at least 2 characters";
    }

    // Account number validation
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (formData.accountNumber.trim().length < 8 || formData.accountNumber.trim().length > 18) {
      newErrors.accountNumber = "Account number must be between 8 and 18 digits";
    } else if (!/^\d+$/.test(formData.accountNumber.trim())) {
      newErrors.accountNumber = "Account number must contain only digits";
    }

    // IFSC code validation
    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.trim().toUpperCase())) {
      newErrors.ifscCode = "Invalid IFSC code format (e.g., SBIN0001234)";
    }

    // Account holder name validation
    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = "Account holder name is required";
    } else if (formData.accountHolderName.trim().length < 2) {
      newErrors.accountHolderName = "Account holder name must be at least 2 characters";
    }

    // Branch name validation
    if (!formData.branchName.trim()) {
      newErrors.branchName = "Branch name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }
    
    setError("");

    if (!validateForm()) {
      setError("Please fix the errors in the form");
      return;
    }

    if (!cid) {
      setError("Card ID is missing. Please try again from the cards page.");
      return;
    }

    if (!cardInfo) {
      setError("Card information is not loaded. Please wait and try again.");
      return;
    }

    setLoading(true);

    try {
      // Get current balance from cardInfo (try balance first, then amount, default to 0)
      const currentBalance = parseFloat(cardInfo.balance || cardInfo.amount || 0) || 0;
      const amountToAdd = parseFloat(formData.amount) || 0;
      const newBalance = currentBalance + amountToAdd;

      console.log("Card Info:", cardInfo);
      console.log("Current balance:", currentBalance, "Amount to add:", amountToAdd, "New balance:", newBalance);
      
      // Validate that we have valid numbers
      if (isNaN(currentBalance) || isNaN(amountToAdd) || isNaN(newBalance)) {
        setError("Invalid balance or amount values. Please refresh and try again.");
        setLoading(false);
        return;
      }

      await axios.put(
        getApiUrl(`/cards/updateBalance/${cid}/${newBalance}`),
        {
          cid: parseInt(cid),
          amount: amountToAdd,
          bankName: formData.bankName.trim(),
          accountNumber: formData.accountNumber.trim(),
          ifscCode: formData.ifscCode.trim().toUpperCase(),
          accountHolderName: formData.accountHolderName.trim(),
          branchName: formData.branchName.trim()
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      alert(`Amount of ₹${formData.amount} added successfully!`);
      navigate("/cards/mycards");
    } catch (err) {
      console.error("Failed to update balance:", err);
      setError(err.response?.data?.message || "Failed to add money. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-money-container">
      <Navbar/>
      <div className="add-money-content">
        <header className="add-money-header">
          <h1>Add Money to Debit Card</h1>
          <Link to="/cards/mycards" className="back-link">← Back to My Cards</Link>
        </header>

        {error && <div className="error-message">{error}</div>}

        {cardInfo && (
          <div className="card-info-display">
            <h3>Card Details</h3>
            <div className="card-info-grid">
              <div className="info-item">
                <span className="info-label">Card Number:</span>
                <span className="info-value">{cardInfo.cardNumber || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Card Type:</span>
                <span className="info-value">{cardInfo.cardType || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Current Balance:</span>
                <span className="info-value">₹{cardInfo.balance || "0.00"}</span>
              </div>
            </div>
          </div>
        )}

        <form className="add-money-form" onSubmit={handleSubmit}>
          <h2>Bank Account Details</h2>

          <div className="form-group">
            <label htmlFor="amount">
              Amount to Add (₹) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount (minimum ₹100)"
              min="100"
              step="0.01"
              className={errors.amount ? "input-error" : ""}
              required
            />
            {errors.amount && <span className="field-error">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="bankName">
              Bank Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="bankName"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Enter bank name (e.g., State Bank of India)"
              className={errors.bankName ? "input-error" : ""}
              required
            />
            {errors.bankName && <span className="field-error">{errors.bankName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="accountNumber">
              Account Number <span className="required">*</span>
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Enter account number (8-18 digits)"
              maxLength="18"
              className={errors.accountNumber ? "input-error" : ""}
              required
            />
            {errors.accountNumber && <span className="field-error">{errors.accountNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="ifscCode">
              IFSC Code <span className="required">*</span>
            </label>
            <input
              type="text"
              id="ifscCode"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              placeholder="Enter IFSC code (e.g., SBIN0001234)"
              maxLength="11"
              className={errors.ifscCode ? "input-error" : ""}
              required
            />
            {errors.ifscCode && <span className="field-error">{errors.ifscCode}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="accountHolderName">
              Account Holder Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="accountHolderName"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              placeholder="Enter account holder name as per bank records"
              className={errors.accountHolderName ? "input-error" : ""}
              required
            />
            {errors.accountHolderName && <span className="field-error">{errors.accountHolderName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="branchName">
              Branch Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="branchName"
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
              placeholder="Enter branch name"
              className={errors.branchName ? "input-error" : ""}
              required
            />
            {errors.branchName && <span className="field-error">{errors.branchName}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Processing..." : "Add Money"}
            </button>
            <Link to="/cards/mycards" className="cancel-btn">
              Cancel
            </Link>
          </div>
        </form>
      </div>
      <br/>
      <br/>
      <Footer/>
    </div>
  );
}

export default AddMoney;
