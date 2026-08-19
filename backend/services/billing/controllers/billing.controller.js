import crypto from "crypto";
import { Plans } from "../config/Plans.js";
import razorpay from "../config/razorpay.js";
import Payment from "../models/payment.model.js";
import axios from "axios";


// ======================================================
// CREATE ORDER
// ======================================================

export const createOrder = async (req, res) => {
    try {

        const { plan } = req.body || {};

        console.log(
            "CREATE ORDER BODY:",
            req.body
        );

        console.log(
            "CREATE ORDER PLAN:",
            plan
        );


        // ==============================================
        // USER ID
        // ==============================================

        const userId =
            req.headers["x-user-id"];


        if (!userId) {

            return res.status(400).json({
                success: false,
                message:
                    "User ID is required",
            });
        }


        // ==============================================
        // PLAN
        // ==============================================

        const selectedPlan =
            Plans[plan];


        if (!selectedPlan) {

            return res.status(404).json({
                success: false,
                message:
                    "Plan not found",
            });
        }


        // ==============================================
        // CREATE RAZORPAY ORDER
        // ==============================================

        const order =
            await razorpay.orders.create({

                amount:
                    selectedPlan.amount * 100,

                currency:
                    "INR",

                receipt:
                    `receipt-${Date.now()}`,
            });


        // ==============================================
        // SAVE PAYMENT
        // ==============================================

        await Payment.create({

            userId,

            orderId:
                order.id,

            amount:
                selectedPlan.amount,

            credits:
                selectedPlan.credits,

            plan:
                selectedPlan.id,

            currency:
                order.currency,

            status:
                "created",
        });


        // ==============================================
        // RESPONSE
        // ==============================================

        return res.status(200).json({

            success: true,

            message:
                "Order created successfully",

            order,
        });


    } catch (error) {

        console.error(
            "Create order error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to create order",

            error:
                error.message,
        });
    }
};



// ======================================================
// VERIFY PAYMENT
// ======================================================

export const verifyPayment = async (
    req,
    res
) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;


        console.log(
            "Verify Request:",
            {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            }
        );


        // ==============================================
        // VALIDATION
        // ==============================================

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Incomplete payment verification data",
            });
        }


        // ==============================================
        // GENERATE SIGNATURE
        // ==============================================

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest("hex");


        console.log(
            "Generated Signature:",
            generatedSignature
        );

        console.log(
            "Received Signature:",
            razorpay_signature
        );


        // ==============================================
        // VERIFY SIGNATURE
        // ==============================================

        if (
            generatedSignature !==
            razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment signature",
            });
        }


        console.log(
            "Signature verified successfully"
        );


        // ==============================================
        // FIND PAYMENT
        // ==============================================

        const payment =
            await Payment.findOne({
                orderId:
                    razorpay_order_id,
            });


        if (!payment) {

            return res.status(404).json({

                success: false,

                message:
                    "Payment record not found",
            });
        }


        // ==============================================
        // PREVENT DUPLICATE PAYMENT
        // ==============================================

        if (
            payment.status ===
            "paid"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment already verified",
            });
        }


        console.log(
            "Payment found:",
            payment
        );


        // ==============================================
        // SESSION + USER
        // ==============================================

        const userId =
            req.headers["x-user-id"];

        const sessionId =
            req.headers["x-session-id"];


        console.log(
            "Billing User ID:",
            userId
        );

        console.log(
            "Billing Session ID:",
            sessionId
        );


        // ==============================================
        // AUTH SERVICE
        // ==============================================

        const authUrl =
            `${process.env.AUTH_SERVICE}/auth/update-plan`;


        console.log(
            "Calling Auth Service:",
            authUrl
        );


        // ==============================================
        // AUTH HEADERS
        // ==============================================

        const authHeaders = {

            "Content-Type":
                "application/json",
        };


        if (userId) {

            authHeaders[
                "x-user-id"
            ] = userId;
        }


        if (sessionId) {

            authHeaders[
                "x-session-id"
            ] = sessionId;
        }


        // ==============================================
        // UPDATE USER PLAN + CREDITS
        // ==============================================

        const authResponse =
            await axios.post(

                authUrl,

                {
                    userId:
                        payment.userId.toString(),

                    plan:
                        payment.plan,

                    credits:
                        payment.credits,
                },

                {
                    headers:
                        authHeaders,
                }
            );


        console.log(
            "Auth Service Response:",
            authResponse.data
        );


        // ==============================================
        // MARK PAYMENT PAID
        // ==============================================

        payment.status =
            "paid";

        payment.paymentId =
            razorpay_payment_id;


        await payment.save();


        console.log(
            "Payment marked as paid"
        );


        // ==============================================
        // RESPONSE
        // ==============================================

        return res.status(200).json({

            success: true,

            message:
                "Payment verified successfully",

            user:
                authResponse.data?.user,

        });


    } catch (error) {

        console.error(
            "Payment verification error:",

            error.response?.data ||
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "Payment verification failed",

            error:
                error.response?.data ||
                error.message,
        });
    }
};