import { useEffect, useState } from "react"
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { FiMoon, FiSun } from "react-icons/fi"
import { useSelector } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"

import logo from "../../assets/Logo/Logo-Full-Light.png"
import { NavbarLinks } from "../../data/navbar-links"
import { apiConnector } from "../../services/apiconnector"
import { categories } from "../../services/apis"
import { ACCOUNT_TYPE } from "../../utils/constants"
import ProfileDropdown from "../core/Auth/ProfileDropDown"

function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  const location = useLocation()

  const [subLinks, setSubLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [themeMode, setThemeMode] = useState(localStorage.getItem("theme") || "dark")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        setSubLinks(res.data.data)
      } catch (error) {
        console.log("Could not fetch Categories.", error)
      }
      setLoading(false)
    })()
  }, [])

  const toggleTheme = () => {
    const nextTheme = themeMode === "dark" ? "light" : "dark"
    setThemeMode(nextTheme)
    localStorage.setItem("theme", nextTheme)
    if (nextTheme === "light") {
      document.documentElement.classList.add("light-mode")
    } else {
      document.documentElement.classList.remove("light-mode")
    }
  }

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <div
      className={`relative z-50 flex h-14 items-center justify-center border-b border-richblack-700/80 ${
        location.pathname !== "/" ? "bg-richblack-800/90 backdrop-blur-md" : "bg-richblack-900/90 backdrop-blur-md"
      } transition-all duration-200`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
        </Link>

        {/* Desktop Navigation links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-6 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <>
                    <div
                      className={`group relative flex cursor-pointer items-center gap-1 ${
                        matchRoute("/catalog/:catalogName")
                          ? "text-yellow-25 font-semibold"
                          : "text-richblack-25 hover:text-richblack-5"
                      }`}
                    >
                      <p>{link.title}</p>
                      <BsChevronDown />
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px] shadow-2xl">
                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                        {loading ? (
                          <p className="text-center text-xs">Loading...</p>
                        ) : (subLinks && subLinks.length > 0) ? (
                          <>
                            {subLinks?.map((subLink, i) => (
                              <Link
                                to={`/catalog/${subLink.name
                                  .split(" ")
                                  .join("-")
                                  .toLowerCase()}`}
                                className="rounded-lg bg-transparent py-2.5 pl-4 hover:bg-richblack-50 text-sm font-medium"
                                key={i}
                              >
                                <p>{subLink.name}</p>
                              </Link>
                            ))}
                          </>
                        ) : (
                          <p className="text-center text-xs">No Categories Found</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? "text-yellow-25 font-semibold"
                          : "text-richblack-25 hover:text-richblack-5"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Login / Signup / Dashboard / Theme Toggle (Desktop) */}
        <div className="hidden items-center gap-x-4 md:flex">
          {/* Dark / Light Mode Toggle Button 🌙☀️ */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-full border border-richblack-700 bg-richblack-800 p-2 text-richblack-100 transition-all hover:bg-richblack-700 hover:text-yellow-100 cursor-pointer"
            title={themeMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {themeMode === "dark" ? <FiMoon size={18} className="text-yellow-100" /> : <FiSun size={18} className="text-yellow-500" />}
          </button>

          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {token === null && (
            <Link to="/login">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 hover:bg-richblack-700 transition-all">
                Log in
              </button>
            </Link>
          )}
          {token === null && (
            <Link to="/signup">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 hover:bg-richblack-700 transition-all">
                Sign up
              </button>
            </Link>
          )}
          {token !== null && <ProfileDropdown />}
        </div>

        {/* Mobile Hamburger Controls */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-full border border-richblack-700 bg-richblack-800 p-2 text-richblack-100"
          >
            {themeMode === "dark" ? <FiMoon size={18} className="text-yellow-100" /> : <FiSun size={18} className="text-yellow-500" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 text-richblack-100 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-0 right-0 z-[999] flex flex-col border-b border-richblack-700 bg-richblack-800/95 p-6 backdrop-blur-xl shadow-2xl md:hidden space-y-4">
          <div className="flex flex-col space-y-3">
            {NavbarLinks.map((link, index) => (
              <div key={index}>
                {link.title === "Catalog" ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-xs uppercase tracking-wider text-richblack-400">
                      Catalog Categories:
                    </p>
                    <div className="grid grid-cols-2 gap-2 pl-2">
                      {subLinks?.map((subLink, i) => (
                        <Link
                          key={i}
                          to={`/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-xs text-yellow-100 hover:underline py-1"
                        >
                          {subLink.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={link?.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-base font-semibold text-richblack-25 hover:text-yellow-50 py-1"
                  >
                    {link.title}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-richblack-700 pt-4 flex flex-col gap-3">
            {token === null ? (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full rounded-lg border border-richblack-700 bg-richblack-900 py-2.5 text-center text-sm font-semibold text-richblack-100">
                    Log in
                  </button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full rounded-lg bg-yellow-50 py-2.5 text-center text-sm font-bold text-richblack-900">
                    Sign up
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <Link
                  to="/dashboard/my-profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-yellow-50 px-4 py-2 text-xs font-bold text-richblack-900"
                >
                  Go to Dashboard
                </Link>
                <ProfileDropdown />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar