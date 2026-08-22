import { useEffect, useState } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { FiPlayCircle, FiBookOpen, FiClock, FiAward } from "react-icons/fi"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"
import CourseCertificateModal from "../../common/CourseCertificateModal"

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()

  const [enrolledCourses, setEnrolledCourses] = useState(null)
  const [filter, setFilter] = useState("All") // "All" | "Pending" | "Completed"
  const [selectedCertCourse, setSelectedCertCourse] = useState(null)

  const getEnrolledCourses = async () => {
    try {
      const res = await getUserEnrolledCourses(token)
      setEnrolledCourses(res)
    } catch (error) {
      console.log("Could not fetch enrolled courses.")
    }
  }

  useEffect(() => {
    getEnrolledCourses()
  }, [])

  const filteredCourses = enrolledCourses?.filter((course) => {
    if (filter === "Pending") return (course.progressPercentage || 0) < 100
    if (filter === "Completed") return (course.progressPercentage || 0) === 100
    return true
  })

  return (
    <div className="space-y-8">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-richblack-5">Enrolled Courses</h1>
          <p className="text-sm text-richblack-300">Access and track progress of your purchased courses</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex rounded-xl bg-richblack-800 p-1 border border-richblack-700 w-fit">
          {["All", "Pending", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                filter === tab
                  ? "bg-yellow-50 text-richblack-900 shadow-md"
                  : "text-richblack-300 hover:text-richblack-5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {!enrolledCourses ? (
        <div className="grid min-h-[50vh] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : !filteredCourses.length ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-richblack-700/80 bg-richblack-800/60 p-8 text-center backdrop-blur-sm">
          <FiBookOpen className="text-5xl text-richblack-400 mb-4" />
          <p className="text-xl font-semibold text-richblack-5 mb-2">No Courses Found</p>
          <p className="text-sm text-richblack-300 mb-6">
            {filter === "All"
              ? "You have not enrolled in any courses yet."
              : `No ${filter.toLowerCase()} courses available.`}
          </p>
          <button
            onClick={() => navigate("/catalog/web-development")}
            className="rounded-lg bg-yellow-50 px-6 py-3 font-bold text-richblack-900 shadow hover:scale-105 transition-all"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredCourses.map((course, i) => (
            <div
              key={course._id || i}
              className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border border-richblack-700/80 bg-richblack-800/80 p-6 shadow-xl backdrop-blur-sm transition-all hover:border-richblack-600 hover:shadow-2xl"
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-3/5">
                <img
                  src={course.thumbnail}
                  alt={course.courseName}
                  className="h-24 w-36 rounded-xl object-cover shadow-md flex-shrink-0"
                />
                <div className="space-y-1.5 text-center sm:text-left min-w-0">
                  <h3 className="text-lg font-bold text-richblack-5 truncate">
                    {course.courseName}
                  </h3>
                  <p className="text-xs text-richblack-300 line-clamp-2">
                    {course.courseDescription}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-richblack-400 justify-center sm:justify-start pt-1">
                    <span className="flex items-center gap-1">
                      <FiClock className="text-yellow-100" /> {course?.totalDuration || "Self-Paced"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle: Progress Bar */}
              <div className="w-full md:w-1/4 flex flex-col gap-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-richblack-300">Progress</span>
                  <span className="text-yellow-100">{course.progressPercentage || 0}%</span>
                </div>
                <ProgressBar
                  completed={course.progressPercentage || 0}
                  height="10px"
                  isLabelVisible={false}
                  bgColor="#FFD60A"
                  baseBgColor="#2C333F"
                  borderRadius="10px"
                />
              </div>

              {/* Right: Actions (Continue Learning & Download Certificate) */}
              <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setSelectedCertCourse(course)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-xs font-bold text-yellow-100 shadow-md transition-all hover:bg-yellow-500/20 active:scale-95 w-full sm:w-auto cursor-pointer"
                >
                  <FiAward size={16} /> 🏆 Claim Certificate
                </button>

                <button
                  onClick={() => {
                    const firstSection = course.courseContent?.[0]
                    const firstSubSection = firstSection?.subSection?.[0]
                    if (firstSection && firstSubSection) {
                      navigate(
                        `/view-course/${course._id}/section/${firstSection._id}/sub-section/${firstSubSection._id}`
                      )
                    } else {
                      navigate(`/courses/${course._id}`)
                    }
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-yellow-50 px-5 py-3 text-xs font-bold text-richblack-900 shadow-md transition-all hover:scale-105 active:scale-95 w-full sm:w-auto cursor-pointer"
                >
                  <FiPlayCircle size={16} /> Continue Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCertCourse && (
        <CourseCertificateModal
          course={selectedCertCourse}
          user={user}
          setCertificateModal={() => setSelectedCertCourse(null)}
        />
      )}
    </div>
  )
}