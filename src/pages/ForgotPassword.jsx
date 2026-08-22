import React, { useState } from "react"
import { BiArrowBack } from "react-icons/bi"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import OTPInput from "react-otp-input"
import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPasswordWithOtp,
} from "../services/operations/authAPI"

function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: Enter Email, 2: Enter OTP, 3: Reset Password
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [resetToken, setResetToken] = useState("")

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)

  const { password, confirmPassword } = formData

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  // Step 1 Submit: Send OTP to registered email
  const handleSendOtp = (e) => {
    e.preventDefault()
    dispatch(sendForgotPasswordOtp(email, setStep))
  }

  // Step 2 Submit: Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault()
    dispatch(verifyForgotPasswordOtp(email, otp, setStep, setResetToken))
  }

  // Step 3 Submit: Reset Password
  const handleResetPassword = (e) => {
    e.preventDefault()
    dispatch(resetPasswordWithOtp(email, password, confirmPassword, resetToken, navigate))
  }

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-gradient-to-br from-richblack-900 via-richblack-900 to-richblack-800 py-10">
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="w-11/12 max-w-[500px] rounded-2xl border border-richblack-700/80 bg-richblack-800/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* STEP 1: Enter Registered Email */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-richblack-5">
                Forgot Password?
              </h1>
              <p className="my-3 text-sm leading-relaxed text-richblack-200">
                Have no fear. Enter your registered email address below, and we will send a 6-digit OTP code to reset your password.
              </p>
              <form onSubmit={handleSendOtp} className="mt-6 flex flex-col gap-y-4">
                <label className="w-full">
                  <p className="mb-1.5 text-xs font-semibold text-richblack-5">
                    Registered Email Address <sup className="text-pink-200">*</sup>
                  </p>
                  <input
                    required
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-lg border border-richblack-600 bg-richblack-900 p-3 text-sm text-richblack-5 focus:border-yellow-50 focus:outline-none"
                  />
                </label>
                <button
                  type="submit"
                  className="mt-2 w-full rounded-lg bg-yellow-50 py-3 font-bold text-richblack-900 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Send OTP
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-richblack-5">
                Verify OTP
              </h1>
              <p className="my-3 text-sm leading-relaxed text-richblack-200">
                A 6-digit verification code has been sent to <span className="font-semibold text-yellow-100">{email}</span>. The code is valid for 5 minutes.
              </p>

              <form onSubmit={handleVerifyOtp} className="mt-6 flex flex-col gap-y-4">
                <div className="flex justify-center my-4">
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderInput={(props) => (
                      <input
                        {...props}
                        placeholder="-"
                        style={{
                          boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                        }}
                        className="w-[44px] sm:w-[54px] rounded-lg border border-richblack-600 bg-richblack-900 p-2 sm:p-3 text-center text-lg font-bold text-richblack-5 focus:border-yellow-50 focus:outline-none mx-1"
                      />
                    )}
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-lg bg-yellow-50 py-3 font-bold text-richblack-900 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Verify OTP
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => dispatch(sendForgotPasswordOtp(email, setStep))}
                  className="text-yellow-100 hover:underline font-medium"
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-richblack-300 hover:text-richblack-5"
                >
                  Change Email
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-richblack-5">
                Choose New Password
              </h1>
              <p className="my-3 text-sm leading-relaxed text-richblack-200">
                OTP verified successfully! Create a new strong password for your account.
              </p>

              <form onSubmit={handleResetPassword} className="mt-6 flex flex-col gap-y-4">
                {/* New Password */}
                <label className="relative w-full">
                  <p className="mb-1.5 text-xs font-semibold text-richblack-5">
                    New Password <sup className="text-pink-200">*</sup>
                  </p>
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={handleOnChange}
                    placeholder="Enter new password"
                    className="w-full rounded-lg border border-richblack-600 bg-richblack-900 p-3 pr-12 text-sm text-richblack-5 focus:border-yellow-50 focus:outline-none"
                  />
                  <span
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-[38px] cursor-pointer text-richblack-400 hover:text-richblack-5"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible fontSize={20} />
                    ) : (
                      <AiOutlineEye fontSize={20} />
                    )}
                  </span>
                </label>

                {/* Confirm New Password */}
                <label className="relative w-full">
                  <p className="mb-1.5 text-xs font-semibold text-richblack-5">
                    Confirm New Password <sup className="text-pink-200">*</sup>
                  </p>
                  <input
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleOnChange}
                    placeholder="Confirm new password"
                    className="w-full rounded-lg border border-richblack-600 bg-richblack-900 p-3 pr-12 text-sm text-richblack-5 focus:border-yellow-50 focus:outline-none"
                  />
                  <span
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-[38px] cursor-pointer text-richblack-400 hover:text-richblack-5"
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEyeInvisible fontSize={20} />
                    ) : (
                      <AiOutlineEye fontSize={20} />
                    )}
                  </span>
                </label>

                <button
                  type="submit"
                  className="mt-4 w-full rounded-lg bg-yellow-50 py-3 font-bold text-richblack-900 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Reset Password
                </button>
              </form>
            </div>
          )}

          {/* Bottom Link: Back to Login */}
          <div className="mt-6 border-t border-richblack-700/80 pt-4 flex items-center justify-between text-xs">
            <Link to="/login" className="flex items-center gap-x-2 text-richblack-300 hover:text-richblack-5 transition-all">
              <BiArrowBack /> Back To Login
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default ForgotPassword