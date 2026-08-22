import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { FiShield, FiLock, FiArrowLeft, FiCreditCard, FiSmartphone, FiAlertCircle } from "react-icons/fi"
import { RiBankLine } from "react-icons/ri"
import { buyCourse } from "../services/operations/studentFeaturesAPI"

export default function Checkout() {
  const { cart, total } = useSelector((state) => state.cart)
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Payment Method: null | 'UPI' | 'Card' | 'NetBanking' (Selection is Mandatory!)
  const [paymentMethod, setPaymentMethod] = useState(null)
  
  // UPI Form State
  const [upiId, setUpiId] = useState("")
  const [selectedUpiApp, setSelectedUpiApp] = useState("GPay")

  // Card Form State
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  })

  // NetBanking Form State
  const [selectedBank, setSelectedBank] = useState("HDFC Bank")

  // Coupon & Referral State
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null) // { code, discount, type: 'percent'|'flat', value: number }

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase()
    if (!code) {
      toast.error("Please enter a coupon or referral code")
      return
    }

    if (code === "SAVE20") {
      setAppliedCoupon({ code: "SAVE20", type: "percent", value: 20, description: "20% OFF Discount Applied" })
      toast.success("Coupon 'SAVE20' Applied! (20% OFF)")
    } else if (code === "STUDY50") {
      setAppliedCoupon({ code: "STUDY50", type: "flat", value: 500, description: "₹500 OFF Discount Applied" })
      toast.success("Coupon 'STUDY50' Applied! (₹500 OFF)")
    } else if (code === "NEWUSER10") {
      setAppliedCoupon({ code: "NEWUSER10", type: "percent", value: 10, description: "10% OFF New User Discount" })
      toast.success("Coupon 'NEWUSER10' Applied! (10% OFF)")
    } else if (code === "OFFER100") {
      setAppliedCoupon({ code: "OFFER100", type: "flat", value: 100, description: "₹100 OFF Special Offer" })
      toast.success("Coupon 'OFFER100' Applied! (₹100 OFF)")
    } else if (code.startsWith("REF-") || code.length >= 4) {
      setAppliedCoupon({ code: code, type: "percent", value: 15, description: "15% Referral Discount Applied" })
      toast.success(`Referral Code '${code}' Applied! (15% OFF)`)
    } else {
      toast.error("Invalid Coupon or Referral Code")
      return
    }

    setCouponCode("")
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    toast.success("Coupon removed")
  }

  // Calculate Discount & Final Amount
  const originalTotal = total
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? Math.round((originalTotal * appliedCoupon.value) / 100)
      : Math.min(originalTotal, appliedCoupon.value)
    : 0

  const finalTotal = Math.max(0, originalTotal - discountAmount)

  const handleCardChange = (e) => {
    setCardDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handlePayNow = () => {
    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty")
      navigate("/dashboard/cart")
      return
    }

    // MANDATORY PAYMENT METHOD SELECTION CHECK
    if (!paymentMethod) {
      toast.error("Please select a Payment Method (UPI, Card, or Net Banking) first")
      return
    }

    // Validation for specific payment methods
    if (paymentMethod === "UPI" && !upiId && !selectedUpiApp) {
      toast.error("Please enter a valid UPI ID")
      return
    }
    if (paymentMethod === "Card") {
      if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiry || !cardDetails.cvv) {
        toast.error("Please fill in all Credit/Debit Card details")
        return
      }
    }

    const courses = cart.map((c) => c._id)
    const formattedMethod =
      paymentMethod === "Card"
        ? "Credit/Debit Card"
        : paymentMethod === "NetBanking"
        ? "Net Banking"
        : "UPI"

    buyCourse(token, courses, user, navigate, dispatch, formattedMethod)
  }

  const handleCancelPayment = () => {
    toast.error("Payment Cancelled by User")
    navigate("/dashboard/cart")
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center text-richblack-100">
        <p className="text-3xl font-semibold mb-4">Your Cart is Empty</p>
        <button
          onClick={() => navigate("/catalog/web-development")}
          className="rounded-md bg-yellow-50 px-6 py-3 font-semibold text-richblack-900"
        >
          Explore Courses
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-11/12 max-w-maxContent py-10 text-richblack-5">
      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard/cart")}
        className="mb-6 flex items-center gap-2 text-sm text-richblack-300 hover:text-richblack-5 transition-all"
      >
        <FiArrowLeft /> Back to Cart
      </button>

      <h1 className="mb-8 text-3xl font-bold text-richblack-5">
        Checkout & Payment
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Payment Method Options & Security Badge */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Payment Method Selector */}
          <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-richblack-5">
                Select Payment Method <span className="text-pink-200 text-sm font-normal">*Mandatory</span>
              </h2>
              {paymentMethod && (
                <span className="rounded-full bg-caribbeangreen-800/40 px-3 py-1 text-xs font-semibold text-caribbeangreen-100 border border-caribbeangreen-300/30">
                  Method Selected: {paymentMethod === "Card" ? "Credit/Debit Card" : paymentMethod === "NetBanking" ? "Net Banking" : "UPI"}
                </span>
              )}
            </div>

            {!paymentMethod && (
              <div className="mb-6 rounded-lg border border-yellow-100/40 bg-yellow-50/10 p-4 text-sm text-yellow-100 flex items-center gap-3">
                <FiAlertCircle className="text-xl flex-shrink-0 text-yellow-100" />
                <span>
                  Please select one of the payment methods below (<strong>UPI</strong>, <strong>Credit/Debit Card</strong>, or <strong>Net Banking</strong>) before proceeding.
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-4 transition-all ${
                  paymentMethod === "UPI"
                    ? "border-yellow-50 bg-richblack-700 text-yellow-50 shadow-md scale-[1.02]"
                    : "border-richblack-600 bg-richblack-900 text-richblack-200 hover:border-richblack-500"
                }`}
              >
                <FiSmartphone size={24} />
                <span className="text-sm font-medium">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("Card")}
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-4 transition-all ${
                  paymentMethod === "Card"
                    ? "border-yellow-50 bg-richblack-700 text-yellow-50 shadow-md scale-[1.02]"
                    : "border-richblack-600 bg-richblack-900 text-richblack-200 hover:border-richblack-500"
                }`}
              >
                <FiCreditCard size={24} />
                <span className="text-sm font-medium">Credit / Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("NetBanking")}
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-4 transition-all ${
                  paymentMethod === "NetBanking"
                    ? "border-yellow-50 bg-richblack-700 text-yellow-50 shadow-md scale-[1.02]"
                    : "border-richblack-600 bg-richblack-900 text-richblack-200 hover:border-richblack-500"
                }`}
              >
                <RiBankLine size={24} />
                <span className="text-sm font-medium">Net Banking</span>
              </button>
            </div>

            {/* Render Form according to selected Payment Method */}
            {paymentMethod === "UPI" && (
              <div className="rounded-lg bg-richblack-900 p-5 border border-richblack-700 space-y-4">
                <h3 className="text-md font-semibold text-yellow-50">UPI Payment Details</h3>
                <div className="flex gap-3">
                  {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setSelectedUpiApp(app)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md border ${
                        selectedUpiApp === app
                          ? "border-yellow-50 bg-yellow-50/10 text-yellow-50"
                          : "border-richblack-700 text-richblack-300"
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-richblack-300 mb-1 block">Enter UPI ID (e.g. mobile@upi)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. 9876543210@paytm"
                    className="w-full rounded-md border border-richblack-600 bg-richblack-800 p-2.5 text-sm text-richblack-5 focus:outline-none focus:border-yellow-50"
                  />
                </div>
              </div>
            )}

            {paymentMethod === "Card" && (
              <div className="rounded-lg bg-richblack-900 p-5 border border-richblack-700 space-y-4">
                <h3 className="text-md font-semibold text-yellow-50">Credit / Debit Card Details</h3>
                <div>
                  <label className="text-xs text-richblack-300 mb-1 block">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleCardChange}
                    placeholder="4532 •••• •••• 8921"
                    maxLength={19}
                    className="w-full rounded-md border border-richblack-600 bg-richblack-800 p-2.5 text-sm text-richblack-5 focus:outline-none focus:border-yellow-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-richblack-300 mb-1 block">Cardholder Name</label>
                  <input
                    type="text"
                    name="cardName"
                    value={cardDetails.cardName}
                    onChange={handleCardChange}
                    placeholder="Name on card"
                    className="w-full rounded-md border border-richblack-600 bg-richblack-800 p-2.5 text-sm text-richblack-5 focus:outline-none focus:border-yellow-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-richblack-300 mb-1 block">Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      value={cardDetails.expiry}
                      onChange={handleCardChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full rounded-md border border-richblack-600 bg-richblack-800 p-2.5 text-sm text-richblack-5 focus:outline-none focus:border-yellow-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-richblack-300 mb-1 block">CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleCardChange}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full rounded-md border border-richblack-600 bg-richblack-800 p-2.5 text-sm text-richblack-5 focus:outline-none focus:border-yellow-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "NetBanking" && (
              <div className="rounded-lg bg-richblack-900 p-5 border border-richblack-700 space-y-4">
                <h3 className="text-md font-semibold text-yellow-50">Select Net Banking Bank</h3>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full rounded-md border border-richblack-600 bg-richblack-800 p-2.5 text-sm text-richblack-5 focus:outline-none focus:border-yellow-50"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}
          </div>

          {/* Security & Guarantee Badges */}
          <div className="flex flex-wrap items-center justify-between rounded-xl border border-richblack-700/60 bg-richblack-800/60 p-4 text-xs text-richblack-300">
            <div className="flex items-center gap-2">
              <FiLock className="text-caribbeangreen-200 text-base" />
              <span>256-Bit SSL Encrypted Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <FiShield className="text-yellow-50 text-base" />
              <span>30-Day Money-Back Guarantee</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary, Coupon Input & Pay Button */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-6">
            <h2 className="mb-4 text-xl font-semibold text-richblack-5 border-b border-richblack-700 pb-3">
              Order Summary
            </h2>

            {/* Course Item List */}
            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
              {cart.map((course) => (
                <div key={course._id} className="flex gap-4 items-center">
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="h-16 w-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate text-richblack-5">
                      {course.courseName}
                    </p>
                    <p className="text-xs text-richblack-400 truncate">
                      {course.category?.name || "General"}
                    </p>
                  </div>
                  <p className="font-bold text-yellow-100 text-sm">
                    ₹{course.price}
                  </p>
                </div>
              ))}
            </div>

            {/* Coupon / Referral Input Section 🎟️ */}
            <div className="mt-6 border-t border-richblack-700 pt-4">
              <p className="text-xs font-semibold text-richblack-200 mb-2">Have a Coupon or Referral Code? 🎟️</p>
              
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter SAVE20 or Referral Code"
                    className="flex-1 rounded-lg border border-richblack-600 bg-richblack-900 px-3 py-2 text-sm text-richblack-5 focus:border-yellow-50 focus:outline-none uppercase"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    className="rounded-lg bg-yellow-50 px-4 py-2 text-xs font-bold text-richblack-900 hover:scale-105 transition-all"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-caribbeangreen-300/40 bg-caribbeangreen-900/30 p-3">
                  <div>
                    <p className="text-xs font-bold text-caribbeangreen-100">
                      🎟️ Coupon Applied: {appliedCoupon.code}
                    </p>
                    <p className="text-[11px] text-richblack-300">{appliedCoupon.description}</p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-pink-200 underline font-semibold hover:text-pink-100 ml-2"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Sample Coupons Quick Pills */}
              {!appliedCoupon && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-richblack-400 self-center mr-1">Popular:</span>
                  {["SAVE20", "STUDY50", "NEWUSER10", "REF-STUDENT10"].map((c) => (
                    <button
                      key={c}
                      onClick={() => handleApplyCoupon(c)}
                      className="rounded-full bg-richblack-700 hover:bg-richblack-600 px-2.5 py-0.5 text-[10px] font-medium text-yellow-100 border border-richblack-600 transition-all"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Calculation & Discount Breakdown */}
            <div className="mt-6 border-t border-richblack-700 pt-4 space-y-2 text-sm text-richblack-300">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} item{cart.length > 1 ? "s" : ""})</span>
                <span className="text-richblack-5 font-medium">₹{originalTotal}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-caribbeangreen-100 font-semibold">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Taxes & Processing Fee</span>
                <span className="text-caribbeangreen-100 font-medium">FREE</span>
              </div>
              <div className="flex justify-between border-t border-richblack-700 pt-3 text-lg font-bold text-richblack-5">
                <span>Total Amount</span>
                <span className="text-yellow-100">₹{finalTotal}</span>
              </div>
            </div>

            {/* Pay Now Button */}
            <button
              onClick={handlePayNow}
              className={`mt-6 w-full rounded-md py-3.5 text-center font-bold shadow-md transition-all ${
                paymentMethod
                  ? "bg-yellow-50 text-richblack-900 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  : "bg-richblack-700 text-richblack-400 cursor-not-allowed opacity-90"
              }`}
            >
              {paymentMethod ? `Pay Now (₹${finalTotal})` : `Select Payment Method to Pay (₹${finalTotal})`}
            </button>

            {/* Cancel Payment */}
            <button
              onClick={handleCancelPayment}
              className="mt-3 w-full rounded-md border border-richblack-600 bg-transparent py-2.5 text-center text-sm font-medium text-richblack-300 hover:text-richblack-5"
            >
              Cancel Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
