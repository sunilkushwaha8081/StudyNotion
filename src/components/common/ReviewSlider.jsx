import React, { useEffect, useState } from "react"
import ReactStars from "react-rating-stars-component"
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import "../../App.css"
// Icons
import { FaStar } from "react-icons/fa"
// Import required modules
import { Autoplay, FreeMode, Pagination } from "swiper"

// Get apiFunction and the endpoint
import { apiConnector } from "../../services/apiconnector"
import { ratingsEndpoints } from "../../services/apis"

function ReviewSlider() {
  const [reviews, setReviews] = useState([])
  const truncateWords = 15

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await apiConnector(
          "GET",
          ratingsEndpoints.REVIEWS_DETAILS_API
        )
        if (data?.success) {
          setReviews(data?.data)
        }
      } catch (error) {
        console.log("Could not fetch reviews:", error)
      }
    })()
  }, [])

  return (
    <div className="text-white w-full">
      <div className="my-[50px] min-h-[184px] max-w-maxContentTab lg:max-w-maxContent mx-auto w-full">
        {reviews.length > 0 ? (
          <Swiper
            slidesPerView={Math.min(4, Math.max(1, reviews.length))}
            spaceBetween={25}
            loop={reviews.length >= 4}
            freeMode={true}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            breakpoints={{
              320: {
                slidesPerView: 1,
              },
              640: {
                slidesPerView: Math.min(2, reviews.length),
              },
              1024: {
                slidesPerView: Math.min(4, Math.max(1, reviews.length)),
              },
            }}
            modules={[FreeMode, Pagination, Autoplay]}
            className="w-full"
          >
            {reviews.map((review, i) => {
              return (
                <SwiperSlide key={i}>
                  <div className="flex flex-col gap-3 bg-richblack-800 p-4 rounded-lg text-[14px] text-richblack-25 min-h-[160px] border border-richblack-700">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          review?.user?.image
                            ? review?.user?.image
                            : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                        }
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <h1 className="font-semibold text-richblack-5">{`${review?.user?.firstName || ''} ${review?.user?.lastName || ''}`}</h1>
                        <h2 className="text-[12px] font-medium text-richblack-500">
                          {review?.course?.courseName}
                        </h2>
                      </div>
                    </div>
                    <p className="font-medium text-richblack-25">
                      {review?.review?.split(" ")?.length > truncateWords
                        ? `${review?.review
                            .split(" ")
                            .slice(0, truncateWords)
                            .join(" ")} ...`
                        : `${review?.review}`}
                    </p>
                    <div className="flex items-center gap-2 mt-auto">
                      <h3 className="font-semibold text-yellow-100">
                        {review?.rating?.toFixed ? review?.rating?.toFixed(1) : review?.rating}
                      </h3>
                      <ReactStars
                        count={5}
                        value={review?.rating}
                        size={20}
                        edit={false}
                        activeColor="#ffd700"
                        emptyIcon={<FaStar />}
                        fullIcon={<FaStar />}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
        ) : (
          <p className="text-center text-richblack-100">No Reviews Found</p>
        )}
      </div>
    </div>
  )
}

export default ReviewSlider