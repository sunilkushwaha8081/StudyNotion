import { RiEditBoxLine } from "react-icons/ri"
import { FiMail, FiPhone, FiUser, FiCalendar, FiCheckCircle } from "react-icons/fi"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { formattedDate } from "../../../utils/dateFormatter"
import IconBtn from "../../common/IconBtn"

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-richblack-5">My Profile</h1>
          <p className="text-sm text-richblack-300">Manage your account information and preferences</p>
        </div>
        <IconBtn
          text="Edit Profile"
          onclick={() => navigate("/dashboard/settings")}
        >
          <RiEditBoxLine />
        </IconBtn>
      </div>

      {/* Hero Welcome & Profile Card */}
      <div className="relative overflow-hidden rounded-2xl border border-richblack-700/80 bg-gradient-to-r from-richblack-800 via-richblack-800 to-richblack-900 p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-yellow-500/10 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-x-6">
            <div className="relative">
              <img
                src={user?.image}
                alt={`profile-${user?.firstName}`}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-yellow-50/20 shadow-lg"
              />
              <div className="absolute bottom-0 right-0 rounded-full bg-caribbeangreen-200 p-1 text-richblack-900 shadow">
                <FiCheckCircle size={16} />
              </div>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-richblack-5">
                  {user?.firstName} {user?.lastName}
                </h2>
                <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-semibold text-yellow-100 border border-yellow-500/30 uppercase tracking-wider">
                  {user?.accountType}
                </span>
              </div>
              <p className="flex items-center gap-2 text-sm text-richblack-300 justify-center sm:justify-start">
                <FiMail className="text-yellow-100" /> {user?.email}
              </p>
            </div>
          </div>

          {/* Referral Code Badge */}
          <div className="flex flex-col items-center sm:items-end gap-1.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs">
            <span className="text-richblack-300 font-medium">Your Referral Code 🎟️</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-yellow-100 text-sm tracking-wider">
                {`REF-${(user?.firstName || "STUDENT").toUpperCase()}10`}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`REF-${(user?.firstName || "STUDENT").toUpperCase()}10`)
                  alert("Referral code copied to clipboard!")
                }}
                className="rounded bg-yellow-50 px-2 py-1 text-[10px] font-bold text-richblack-900 shadow hover:scale-105"
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="rounded-2xl border border-richblack-700/80 bg-richblack-800/80 p-8 shadow-xl backdrop-blur-sm transition-all hover:border-richblack-600">
        <div className="flex w-full items-center justify-between mb-4 border-b border-richblack-700/80 pb-4">
          <h3 className="text-lg font-semibold text-richblack-5">About Me</h3>
          <button
            onClick={() => navigate("/dashboard/settings")}
            className="flex items-center gap-2 text-xs font-semibold text-yellow-100 hover:underline"
          >
            <RiEditBoxLine /> Edit
          </button>
        </div>
        <p
          className={`${
            user?.additionalDetails?.about
              ? "text-richblack-5"
              : "text-richblack-400 italic"
          } text-sm leading-relaxed`}
        >
          {user?.additionalDetails?.about || "Write something about yourself in settings..."}
        </p>
      </div>

      {/* Personal Details Section */}
      <div className="rounded-2xl border border-richblack-700/80 bg-richblack-800/80 p-8 shadow-xl backdrop-blur-sm transition-all hover:border-richblack-600">
        <div className="flex w-full items-center justify-between mb-6 border-b border-richblack-700/80 pb-4">
          <h3 className="text-lg font-semibold text-richblack-5">Personal Details</h3>
          <button
            onClick={() => navigate("/dashboard/settings")}
            className="flex items-center gap-2 text-xs font-semibold text-yellow-100 hover:underline"
          >
            <RiEditBoxLine /> Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="flex items-start gap-4 rounded-xl border border-richblack-700/50 bg-richblack-900/40 p-4">
            <div className="rounded-lg bg-yellow-500/10 p-2.5 text-yellow-100">
              <FiUser size={18} />
            </div>
            <div>
              <p className="text-xs text-richblack-400 font-medium">First Name</p>
              <p className="text-sm font-semibold text-richblack-5 mt-0.5">{user?.firstName}</p>
            </div>
          </div>

          {/* Last Name */}
          <div className="flex items-start gap-4 rounded-xl border border-richblack-700/50 bg-richblack-900/40 p-4">
            <div className="rounded-lg bg-yellow-500/10 p-2.5 text-yellow-100">
              <FiUser size={18} />
            </div>
            <div>
              <p className="text-xs text-richblack-400 font-medium">Last Name</p>
              <p className="text-sm font-semibold text-richblack-5 mt-0.5">{user?.lastName}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4 rounded-xl border border-richblack-700/50 bg-richblack-900/40 p-4">
            <div className="rounded-lg bg-yellow-500/10 p-2.5 text-yellow-100">
              <FiMail size={18} />
            </div>
            <div>
              <p className="text-xs text-richblack-400 font-medium">Email Address</p>
              <p className="text-sm font-semibold text-richblack-5 mt-0.5">{user?.email}</p>
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex items-start gap-4 rounded-xl border border-richblack-700/50 bg-richblack-900/40 p-4">
            <div className="rounded-lg bg-yellow-500/10 p-2.5 text-yellow-100">
              <FiPhone size={18} />
            </div>
            <div>
              <p className="text-xs text-richblack-400 font-medium">Phone Number</p>
              <p className="text-sm font-semibold text-richblack-5 mt-0.5">
                {user?.additionalDetails?.contactNumber || "Not added"}
              </p>
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-start gap-4 rounded-xl border border-richblack-700/50 bg-richblack-900/40 p-4">
            <div className="rounded-lg bg-yellow-500/10 p-2.5 text-yellow-100">
              <FiUser size={18} />
            </div>
            <div>
              <p className="text-xs text-richblack-400 font-medium">Gender</p>
              <p className="text-sm font-semibold text-richblack-5 mt-0.5">
                {user?.additionalDetails?.gender || "Not added"}
              </p>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="flex items-start gap-4 rounded-xl border border-richblack-700/50 bg-richblack-900/40 p-4">
            <div className="rounded-lg bg-yellow-500/10 p-2.5 text-yellow-100">
              <FiCalendar size={18} />
            </div>
            <div>
              <p className="text-xs text-richblack-400 font-medium">Date of Birth</p>
              <p className="text-sm font-semibold text-richblack-5 mt-0.5">
                {formattedDate(user?.additionalDetails?.dateOfBirth) || "Not added"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}