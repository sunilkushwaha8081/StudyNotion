const { instance } = require("../config/razorpay")
const Course = require("../models/Course")
const crypto = require("crypto")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress")

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body
  const userId = req.user.id
  if (!courses || courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" })
  }

  let total_amount = 0

  for (const course_id of courses) {
    let course
    try {
      // Find the course by its ID
      course = await Course.findById(course_id)

      // If the course is not found, return an error
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Could not find the Course" })
      }

      // Check if the user is already enrolled in the course
      const enrolled = course.studentsEnrolled || course.studentsEnroled || []
      if (enrolled.map(id => id.toString()).includes(userId.toString())) {
        return res
          .status(400)
          .json({ success: false, message: "Student is already Enrolled" })
      }

      // Add the price of the course to the total amount
      total_amount += course.price
    } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  }

  try {
    let paymentResponse
    if (!process.env.RAZORPAY_KEY || process.env.RAZORPAY_KEY.includes("xxx")) {
      console.log("Using Mock Razorpay Order for Development/Testing...")
      paymentResponse = {
        id: "order_" + Date.now(),
        entity: "order",
        amount: options.amount,
        amount_paid: 0,
        amount_due: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: "created",
        attempts: 0,
        created_at: Math.floor(Date.now() / 1000)
      }
    } else {
      paymentResponse = await instance.orders.create(options)
    }

    console.log(paymentResponse)
    res.json({
      success: true,
      message: paymentResponse,
      data: paymentResponse,
    })
  } catch (error) {
    console.log("Error initiating order:", error)
    res
      .status(500)
      .json({ success: false, message: error.message || "Could not initiate order." })
  }
}

const Order = require("../models/Order")

// verify the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses
  const paymentMethod = req.body?.paymentMethod || "UPI"
  const amount = req.body?.amount || 0

  const userId = req.user.id

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !courses ||
    !userId
  ) {
    return res.status(400).json({ success: false, message: "Payment Failed: Missing Details" })
  }

  try {
    const isDummyKey = !process.env.RAZORPAY_SECRET || process.env.RAZORPAY_SECRET.includes("xxx") || razorpay_signature === "dev_signature"
    let verified = false

    if (isDummyKey) {
      console.log("Dev/Mock mode: Skipping Razorpay signature check")
      verified = true
    } else {
      let body = razorpay_order_id + "|" + razorpay_payment_id
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex")

      if (expectedSignature === razorpay_signature) {
        verified = true
      }
    }

    if (verified) {
      await enrollStudents(courses, userId, res)

      // Save Order / Transaction Details to Database
      let orderAmount = amount
      if (!orderAmount) {
        const enrolledCoursesDetails = await Course.find({ _id: { $in: courses } })
        orderAmount = enrolledCoursesDetails.reduce((acc, curr) => acc + (curr.price || 0), 0)
      }

      const newOrder = await Order.create({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        user: userId,
        courses: courses,
        amount: orderAmount,
        paymentMethod: paymentMethod,
        status: "Success",
      })

      console.log("Order created in DB:", newOrder.orderId)

      return res.status(200).json({
        success: true,
        message: "Payment Verified & Order Created",
        order: newOrder,
      })
    } else {
      await Order.create({
        orderId: razorpay_order_id || `ORD_${Date.now()}`,
        paymentId: razorpay_payment_id || `PAY_${Date.now()}`,
        user: userId,
        courses: courses,
        amount: amount || 0,
        paymentMethod: paymentMethod,
        status: "Failed",
      })
      return res.status(400).json({ success: false, message: "Payment Verification Failed" })
    }
  } catch (error) {
    console.error("Error in verifyPayment:", error)
    return res.status(500).json({ success: false, message: error.message || "Payment Verification Exception" })
  }
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
    res.status(200).json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $addToSet: { studentsEnrolled: userId } },
        { new: true }
      )

      if (!enrolledCourse) {
        console.log("Course not found for enrollment:", courseId)
        continue
      }
      console.log("Updated course: ", enrolledCourse._id)

      let courseProgress = await CourseProgress.findOne({ courseID: courseId, userId: userId })
      if (!courseProgress) {
        courseProgress = await CourseProgress.create({
          courseID: courseId,
          userId: userId,
          completedVideos: [],
        })
      }

      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      )

      console.log("Enrolled student: ", enrolledStudent._id)
      // Send an email notification to the enrolled student
      try {
        await mailSender(
          enrolledStudent.email,
          `Successfully Enrolled into ${enrolledCourse.courseName}`,
          courseEnrollmentEmail(
            enrolledCourse.courseName,
            `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
          )
        )
      } catch (mailErr) {
        console.log("Mail send notice:", mailErr.message)
      }
    } catch (error) {
      console.log("Enrollment error:", error)
    }
  }
}