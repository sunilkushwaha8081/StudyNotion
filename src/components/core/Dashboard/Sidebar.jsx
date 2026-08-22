import { useState } from "react"
import { VscSignOut } from "react-icons/vsc"
import { FiMenu, FiX } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { sidebarLinks } from "../../../data/dashboard-links"
import { logout } from "../../../services/operations/authAPI"
import ConfirmationModal from "../../common/ConfirmationModal"
import SidebarLink from "./SidebarLink"

export default function Sidebar() {
  const { user, loading: profileLoading } = useSelector(
    (state) => state.profile
  )
  const { loading: authLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [confirmationModal, setConfirmationModal] = useState(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  if (profileLoading || authLoading) {
    return (
      <div className="grid h-[calc(100vh-3.5rem)] min-w-[220px] items-center border-r border-richblack-700 bg-richblack-800">
        <div className="spinner"></div>
      </div>
    )
  }

  const sidebarContent = (
    <div className="flex h-full w-[240px] flex-col border-r border-richblack-700/80 bg-richblack-800/95 backdrop-blur-md py-6 shadow-xl">
      {/* User Profile Quick Card */}
      <div className="mx-4 mb-6 flex items-center gap-3 rounded-xl border border-richblack-700 bg-richblack-900/60 p-3 shadow-inner">
        <img
          src={user?.image}
          alt={user?.firstName}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-yellow-50/50"
        />
        <div className="flex flex-col min-w-0">
          <p className="truncate text-sm font-semibold text-richblack-5">
            {user?.firstName} {user?.lastName}
          </p>
          <span className="w-fit rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-100 border border-yellow-500/20 uppercase tracking-wider">
            {user?.accountType}
          </span>
        </div>
      </div>

      {/* Section Heading: Navigation */}
      <p className="px-6 pb-2 text-[11px] font-bold uppercase tracking-wider text-richblack-400">
        Dashboard Menu
      </p>

      <div className="flex flex-col flex-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          if (link.type && user?.accountType !== link.type) return null
          return (
            <div key={link.id} onClick={() => setMobileSidebarOpen(false)}>
              <SidebarLink link={link} iconName={link.icon} />
            </div>
          )
        })}
      </div>

      <div className="mx-auto my-4 h-[1px] w-10/12 bg-richblack-700/80" />

      {/* Section Heading: Account */}
      <p className="px-6 pb-2 text-[11px] font-bold uppercase tracking-wider text-richblack-400">
        Account Options
      </p>

      <div className="flex flex-col gap-1">
        <div onClick={() => setMobileSidebarOpen(false)}>
          <SidebarLink
            link={{ name: "Settings", path: "/dashboard/settings" }}
            iconName="VscSettingsGear"
          />
        </div>
        <button
          onClick={() => {
            setMobileSidebarOpen(false)
            setConfirmationModal({
              text1: "Are you sure?",
              text2: "You will be logged out of your account.",
              btn1Text: "Logout",
              btn2Text: "Cancel",
              btn1Handler: () => dispatch(logout(navigate)),
              btn2Handler: () => setConfirmationModal(null),
            })
          }}
          className="mx-3 flex items-center gap-x-3 rounded-lg px-5 py-3 text-sm font-medium text-richblack-300 transition-all hover:bg-pink-900/20 hover:text-pink-200"
        >
          <VscSignOut className="text-lg text-pink-300" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar Floating Toggle Button */}
      <div className="fixed bottom-5 left-5 z-[888] md:hidden">
        <button
          onClick={() => setMobileSidebarOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-3 text-xs font-bold text-richblack-900 shadow-2xl transition-all hover:scale-105 active:scale-95"
        >
          {mobileSidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          <span>Dashboard Menu</span>
        </button>
      </div>

      {/* Desktop Sidebar (visible md and above) */}
      <div className="hidden md:block h-[calc(100vh-3.5rem)]">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[990] flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}