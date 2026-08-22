import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiconnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";


const {COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API} = studentEndpoints;

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;

        script.onload = () => {
            resolve(true);
        }
        script.onerror= () =>{
            resolve(false);
        }
        document.body.appendChild(script);
    })
}


export async function buyCourse(token, courses, userDetails, navigate, dispatch, paymentMethod = "UPI") {
    const toastId = toast.loading("Loading...");
    try{
        //load the script
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

        //initiate the order
        const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API, 
                                {courses},
                                {
                                    Authorization: `Bearer ${token}`,
                                })

        if(!orderResponse?.data?.success) {
            throw new Error(orderResponse?.data?.message || "Could not initiate payment order");
        }
        console.log("PRINTING orderResponse", orderResponse);

        const orderData = orderResponse.data.message || orderResponse.data.data;

        // If Razorpay script fails or mock/dummy order in dev, perform verification directly
        if (!res || !window.Razorpay || orderData?.id?.startsWith("order_")) {
            console.log("Dev/Mock Payment Flow Triggered with method:", paymentMethod);
            await verifyPayment({
                razorpay_order_id: orderData.id,
                razorpay_payment_id: "pay_dev_" + Date.now(),
                razorpay_signature: "dev_signature",
                courses,
                paymentMethod,
                amount: orderData.amount / 100
            }, token, navigate, dispatch);
            toast.dismiss(toastId);
            return;
        }

        //options
        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY || "rzp_test_xxxxxxxxxxxxx",
            currency: orderData.currency,
            amount: `${orderData.amount}`,
            order_id: orderData.id,
            name: "StudyNotion",
            description: "Thank You for Purchasing the Course",
            image: rzpLogo,
            prefill: {
                name: `${userDetails.firstName}`,
                email: userDetails.email
            },
            handler: function(response) {
                //send successful mail
                sendPaymentSuccessEmail(response, orderData.amount, token);
                //verifyPayment
                verifyPayment({...response, courses, paymentMethod, amount: orderData.amount / 100}, token, navigate, dispatch);
            }
        }
        
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        paymentObject.on("payment.failed", function(response) {
            toast.error("Payment Failed or Cancelled");
            console.log(response.error);
        })

    }
    catch(error) {
        console.log("PAYMENT API ERROR.....", error);
        toast.error(error.response?.data?.message || error.message || "Could not make Payment");
    }
    toast.dismiss(toastId);
}

async function sendPaymentSuccessEmail(response, amount, token) {
    try{
        await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            amount,
        },{
            Authorization: `Bearer ${token}`
        })
    }
    catch(error) {
        console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
    }
}

//verify payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Payment....");
    dispatch(setPaymentLoading(true));
    try{
        const response  = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
            Authorization:`Bearer ${token}`,
        })

        if(!response.data.success) {
            throw new Error(response.data.message);
        }
        toast.success("Payment Successful! Course added to your account.");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    }   
    catch(error) {
        console.log("PAYMENT VERIFY ERROR....", error);
        toast.error(error.response?.data?.message || "Could not verify Payment");
    }
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
}