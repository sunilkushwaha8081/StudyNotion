import React, { useRef } from "react"
import { FiDownload, FiShare2, FiX, FiCheckCircle, FiAward } from "react-icons/fi"
import { toast } from "react-hot-toast"
import copy from "copy-to-clipboard"

export default function CourseCertificateModal({
  course,
  user,
  setCertificateModal,
}) {
  const certificateRef = useRef(null)

  const studentName = `${user?.firstName || "Student"} ${user?.lastName || ""}`.trim()
  const courseName = course?.courseName || "Online Certification Course"
  const instructorName = course?.instructor
    ? `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim()
    : "StudyNotion Expert Instructor"
  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  
  const certId = `CERT-SN-${(course?._id || "2026").slice(-6).toUpperCase()}-${(user?._id || "9999").slice(-4).toUpperCase()}`

  const handleDownload = () => {
    toast.loading("Preparing certificate for download...")
    setTimeout(() => {
      toast.dismiss()
      window.print()
    }, 500)
  }

  const handleShare = () => {
    copy(window.location.href)
    toast.success("Certificate link copied to clipboard!")
  }

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center overflow-auto bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl rounded-2xl border border-yellow-500/40 bg-richblack-900 p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => setCertificateModal(false)}
          className="absolute top-4 right-4 z-20 rounded-full bg-richblack-800 p-2 text-richblack-200 hover:bg-richblack-700 hover:text-richblack-5"
        >
          <FiX size={20} />
        </button>

        {/* Printable Certificate Frame */}
        <div
          ref={certificateRef}
          className="print-certificate relative overflow-hidden rounded-xl border-8 border-double border-yellow-100 bg-gradient-to-b from-richblack-800 via-richblack-900 to-richblack-800 p-8 sm:p-12 text-center text-richblack-5 shadow-2xl"
        >
          {/* Subtle Background Seals & Ornaments */}
          <div className="absolute top-4 left-4 h-16 w-16 border-t-2 border-l-2 border-yellow-100/50" />
          <div className="absolute top-4 right-4 h-16 w-16 border-t-2 border-r-2 border-yellow-100/50" />
          <div className="absolute bottom-4 left-4 h-16 w-16 border-b-2 border-l-2 border-yellow-100/50" />
          <div className="absolute bottom-4 right-4 h-16 w-16 border-b-2 border-r-2 border-yellow-100/50" />

          {/* Header Badge */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg ring-4 ring-yellow-100/20">
            <FiAward className="text-3xl text-richblack-900" />
          </div>

          <p className="text-xs font-bold tracking-[0.25em] text-yellow-100 uppercase mb-1">
            StudyNotion Official Certificate
          </p>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-wider text-richblack-5 uppercase mb-6">
            Certificate of Completion
          </h1>

          <div className="mx-auto my-4 h-[2px] w-32 bg-gradient-to-r from-transparent via-yellow-100 to-transparent" />

          <p className="text-sm font-medium text-richblack-300 italic mb-2">
            This is to proudly certify that
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-black text-yellow-50 tracking-wide my-3 drop-shadow-md">
            {studentName}
          </h2>

          <p className="mx-auto max-w-xl text-xs sm:text-sm text-richblack-200 leading-relaxed mb-4">
            has successfully completed all lectures, assignments, and curriculum requirements for the course
          </p>

          <h3 className="text-xl sm:text-2xl font-bold text-caribbeangreen-100 my-2">
            "{courseName}"
          </h3>

          <p className="text-xs text-richblack-400 mt-1 mb-8">
            Instructed by <span className="font-semibold text-richblack-200">{instructorName}</span>
          </p>

          {/* Bottom Signatures & Seal */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-richblack-700/80 pt-6 text-xs text-richblack-300">
            <div className="text-center sm:text-left space-y-1">
              <p className="font-semibold text-richblack-100">Issue Date:</p>
              <p className="text-yellow-100 font-medium">{issueDate}</p>
            </div>

            {/* Official Stamp Badge */}
            <div className="flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-yellow-100 font-semibold">
              <FiCheckCircle className="text-caribbeangreen-200" />
              <span>Verified Completion</span>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <p className="font-semibold text-richblack-100">Certificate ID:</p>
              <p className="font-mono text-yellow-100">{certId}</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-richblack-400">
            🏆 Congratulations on finishing the course! Download or share your achievement.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-2.5 text-xs font-semibold text-richblack-100 hover:text-richblack-5 hover:border-richblack-500"
            >
              <FiShare2 size={16} /> Share
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-lg bg-yellow-50 px-5 py-2.5 text-xs font-bold text-richblack-900 shadow-md hover:scale-105 transition-all"
            >
              <FiDownload size={16} /> Download Certificate (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
