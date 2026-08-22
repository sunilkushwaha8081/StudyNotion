import * as Icons from "react-icons/vsc"
import { useDispatch } from "react-redux"
import { NavLink, matchPath, useLocation } from "react-router-dom"

import { resetCourseState } from "../../../slices/courseSlice"

export default function SidebarLink({ link, iconName }) {
  const Icon = Icons[iconName]
  const location = useLocation()
  const dispatch = useDispatch()

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <NavLink
      to={link.path}
      onClick={() => dispatch(resetCourseState())}
      className={`relative mx-3 my-1 flex items-center rounded-lg px-5 py-3 text-sm font-medium transition-all duration-200 ${
        matchRoute(link.path)
          ? "bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-transparent text-yellow-50 font-semibold border-l-4 border-yellow-50 shadow-sm"
          : "text-richblack-300 hover:bg-richblack-700/50 hover:text-richblack-5"
      }`}
    >
      <div className="flex items-center gap-x-3">
        {/* Icon */}
        <Icon className={`text-lg transition-all ${matchRoute(link.path) ? "text-yellow-50 scale-110" : "text-richblack-400"}`} />
        <span>{link.name}</span>
      </div>
    </NavLink>
  )
}