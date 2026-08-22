const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("./models/Category");
const Course = require("./models/Course");
const Section = require("./models/Section");
const SubSection = require("./models/SubSection");
const User = require("./models/User");
const Profile = require("./models/Profile");
const bcrypt = require("bcryptjs");

const coursesData = [
  {
    categoryName: "Web Development",
    categoryDesc: "Master HTML, CSS, JavaScript and Modern Web Technologies",
    courses: [
      {
        courseName: "HTML & CSS Complete Masterclass 2026",
        courseDescription: "Learn HTML5, CSS3, Flexbox, Grid, Responsive Design and build beautiful real-world websites from scratch.",
        whatYouWillLearn: "Master HTML5 semantics, CSS Grid & Flexbox, Responsive Web Design, Animations and Modern UI Components.",
        price: 499,
        thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop",
        tag: ["HTML", "CSS", "Web Development", "Frontend"],
        instructions: ["Basic Computer Knowledge", "Text Editor (VS Code)", "Desire to learn web development"],
        sections: [
          {
            sectionName: "Introduction to HTML5",
            subSections: [
              { title: "HTML Basics & Boilerplate", timeDuration: "15:00", description: "Getting started with HTML tags and structure.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
              { title: "Semantic Tags & Forms", timeDuration: "25:00", description: "Learn form inputs, labels and semantic elements.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" }
            ]
          },
          {
            sectionName: "Mastering CSS3",
            subSections: [
              { title: "Flexbox & Grid Deep Dive", timeDuration: "35:00", description: "Modern layout techniques with Flexbox and CSS Grid.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" }
            ]
          }
        ]
      },
      {
        courseName: "React JS & Redux Toolkit - Complete Guide",
        courseDescription: "Become a proficient React developer. Master Hooks, State Management, Redux Toolkit, React Router, and API Integration.",
        whatYouWillLearn: "Build scalable React Single Page Applications, manage complex state with Redux Toolkit, custom hooks and async APIs.",
        price: 999,
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop",
        tag: ["React", "JavaScript", "Redux", "Frontend"],
        instructions: ["Basic JavaScript Knowledge (ES6+)", "Node.js installed on your system"],
        sections: [
          {
            sectionName: "React Fundamentals",
            subSections: [
              { title: "Components, Props & State", timeDuration: "20:00", description: "Core concepts of React component lifecycle and state.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
              { title: "React Hooks (useState & useEffect)", timeDuration: "30:00", description: "Mastering built-in React hooks.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" }
            ]
          }
        ]
      }
    ]
  },
  {
    categoryName: "Full Stack Development",
    categoryDesc: "Become a Full Stack Developer with MERN Stack (MongoDB, Express, React, Node.js)",
    courses: [
      {
        courseName: "Full Stack MERN Bootcamp 2026",
        courseDescription: "Complete End-to-End MERN Stack Web Development Course. Build 5 production-ready full stack projects.",
        whatYouWillLearn: "Build REST APIs with Node.js & Express, database design with MongoDB, JWT Authentication, and React frontend integration.",
        price: 1999,
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop",
        tag: ["MERN Stack", "Node.js", "Express", "MongoDB", "React", "Full Stack"],
        instructions: ["Basic programming concepts", "Computer with 8GB RAM minimum"],
        sections: [
          {
            sectionName: "Backend Fundamentals with Node & Express",
            subSections: [
              { title: "Building REST APIs", timeDuration: "40:00", description: "Express routes, controllers, and middleware.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" }
            ]
          }
        ]
      }
    ]
  },
  {
    categoryName: "AI & Machine Learning",
    categoryDesc: "Artificial Intelligence, Python, Data Science & Machine Learning",
    courses: [
      {
        courseName: "AI Developer Masterclass - LLMs & Python",
        courseDescription: "Learn Artificial Intelligence, Generative AI, OpenAI APIs, Prompt Engineering, and Machine Learning algorithms with Python.",
        whatYouWillLearn: "Build AI-powered applications, fine-tune models, integrate LLMs, and master Python for AI development.",
        price: 2499,
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop",
        tag: ["AI", "Machine Learning", "Python", "Generative AI"],
        instructions: ["Basic math & logic skills", "No prior coding experience required"],
        sections: [
          {
            sectionName: "Python for AI & Data Science",
            subSections: [
              { title: "Python Basics & NumPy/Pandas", timeDuration: "45:00", description: "Data manipulation and analysis in Python.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLoose.mp4" }
            ]
          }
        ]
      }
    ]
  },
  {
    categoryName: "Java Programming",
    categoryDesc: "Java Core, Advanced Java, Spring Boot & DSA in Java",
    courses: [
      {
        courseName: "Java & Data Structures Complete Course",
        courseDescription: "Master Core Java, Object-Oriented Programming (OOPs), Collections Framework, and Data Structures & Algorithms in Java.",
        whatYouWillLearn: "Write clean OOP code in Java, master Recursion, Linked Lists, Trees, Graphs, and crack coding interviews.",
        price: 1499,
        thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop",
        tag: ["Java", "DSA", "OOPs", "Backend"],
        instructions: ["Dedication to practice problem solving daily"],
        sections: [
          {
            sectionName: "Java Fundamentals & OOPs",
            subSections: [
              { title: "Variables, Loops & Methods", timeDuration: "30:00", description: "Java basic syntax and concepts.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" }
            ]
          }
        ]
      }
    ]
  },
  {
    categoryName: "C++ & DSA",
    categoryDesc: "C++ Core, Data Structures & Algorithms, Competitive Programming",
    courses: [
      {
        courseName: "C++ Programming & DSA Placement Course",
        courseDescription: "Comprehensive C++ & DSA Course designed specifically for campus placements and top tech company interviews.",
        whatYouWillLearn: "Pointers, Memory Management, STL, Dynamic Programming, Graph Algorithms, and 300+ LeetCode problems.",
        price: 1299,
        thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop",
        tag: ["C++", "DSA", "Algorithms", "Competitive Programming"],
        instructions: ["Basic problem solving mindset"],
        sections: [
          {
            sectionName: "C++ Foundation & STL",
            subSections: [
              { title: "Pointers & Memory Allocation", timeDuration: "35:00", description: "Deep dive into C++ pointers.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4" }
            ]
          }
        ]
      }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected successfully!");

    // Find or create an Instructor User
    let instructor = await User.findOne({ accountType: "Instructor" });
    if (!instructor) {
      console.log("Creating default Instructor user...");
      const profile = await Profile.create({
        gender: "Male",
        dateOfBirth: "1995-01-01",
        about: "Senior Software Engineer & Lead Instructor",
        contactNumber: "9876543210"
      });

      const hashedPassword = await bcrypt.hash("Instructor@123", 10);
      instructor = await User.create({
        firstName: "StudyNotion",
        lastName: "Instructor",
        email: "instructor@studynotion.com",
        password: hashedPassword,
        accountType: "Instructor",
        approved: true,
        additionalDetails: profile._id,
        image: "https://api.dicebear.com/5.x/initials/svg?seed=StudyNotion%20Instructor"
      });
      console.log("Instructor created:", instructor.email);
    }

    console.log("Seeding Categories & Courses...");
    for (const catData of coursesData) {
      let category = await Category.findOne({ name: catData.categoryName });
      if (!category) {
        category = await Category.create({
          name: catData.categoryName,
          description: catData.categoryDesc,
          courses: []
        });
        console.log(`Created Category: ${category.name}`);
      }

      for (const cData of catData.courses) {
        let existingCourse = await Course.findOne({ courseName: cData.courseName });
        if (!existingCourse) {
          // Create sections and subsections
          const sectionIds = [];
          for (const sData of cData.sections) {
            const subSectionIds = [];
            for (const subData of sData.subSections) {
              const subSec = await SubSection.create({
                title: subData.title,
                timeDuration: subData.timeDuration,
                description: subData.description,
                videoUrl: subData.videoUrl
              });
              subSectionIds.push(subSec._id);
            }

            const sec = await Section.create({
              sectionName: sData.sectionName,
              subSection: subSectionIds
            });
            sectionIds.push(sec._id);
          }

          const course = await Course.create({
            courseName: cData.courseName,
            courseDescription: cData.courseDescription,
            instructor: instructor._id,
            whatYouWillLearn: cData.whatYouWillLearn,
            courseContent: sectionIds,
            price: cData.price,
            thumbnail: cData.thumbnail,
            tag: cData.tag,
            category: category._id,
            instructions: cData.instructions,
            status: "Published",
            studentsEnrolled: []
          });

          // Add course reference to Category & Instructor
          category.courses.push(course._id);
          await category.save();

          if (!instructor.courses.includes(course._id)) {
            instructor.courses.push(course._id);
            await instructor.save();
          }

          console.log(`Created Course: ${course.courseName} (Category: ${category.name})`);
        } else {
          console.log(`Course already exists: ${cData.courseName}`);
        }
      }
    }

    console.log("Seeding Reviews...");
    const RatingAndReview = require("./models/RatingAndRaview");
    const allCourses = await Course.find({});
    
    // Create 4 dummy student users if they don't exist
    const dummyStudents = [
      { firstName: "Rahul", lastName: "Sharma", email: "rahul@example.com" },
      { firstName: "Priya", lastName: "Verma", email: "priya@example.com" },
      { firstName: "Amit", lastName: "Kumar", email: "amit@example.com" },
      { firstName: "Sneha", lastName: "Patel", email: "sneha@example.com" },
    ];

    const sampleReviewsText = [
      "Extremely helpful course! The explanation of concepts was crystal clear and very easy to follow.",
      "The projects in this course helped me land my first software developer job! Highly recommended.",
      "Awesome instructor and super engaging video content. Best course on StudyNotion!",
      "Great pace, practical coding examples, and amazing support. 5 stars all the way!"
    ];

    for (let i = 0; i < dummyStudents.length; i++) {
      let student = await User.findOne({ email: dummyStudents[i].email });
      if (!student) {
        const profile = await Profile.create({ gender: "Other" });
        const hashedPassword = await bcrypt.hash("Student@123", 10);
        student = await User.create({
          firstName: dummyStudents[i].firstName,
          lastName: dummyStudents[i].lastName,
          email: dummyStudents[i].email,
          password: hashedPassword,
          accountType: "Student",
          approved: true,
          additionalDetails: profile._id,
          image: `https://api.dicebear.com/5.x/initials/svg?seed=${dummyStudents[i].firstName}%20${dummyStudents[i].lastName}`
        });
      }

      if (allCourses[i % allCourses.length]) {
        const targetCourse = allCourses[i % allCourses.length];
        let existingReview = await RatingAndReview.findOne({ user: student._id, course: targetCourse._id });
        if (!existingReview) {
          const newReview = await RatingAndReview.create({
            user: student._id,
            course: targetCourse._id,
            rating: 5,
            review: sampleReviewsText[i % sampleReviewsText.length]
          });
          targetCourse.ratingAndReviews.push(newReview._id);
          await targetCourse.save();
          console.log(`Created Review by ${student.firstName} for ${targetCourse.courseName}`);
        }
      }
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

seedDatabase();
