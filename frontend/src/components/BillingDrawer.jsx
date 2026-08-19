import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Check, Coins } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { createOrder } from "../features/createOrder";
import { verifyPayment } from "../features/verifyPayment";
import { setUser } from "../redux/userSlice";

function BillingDrawer({ open, onClose }) {
    const dispatch = useDispatch();

    // ==========================================
    // GET USER FROM REDUX
    // ==========================================

    const { user } = useSelector(
        (state) => state.user
    );

    const [loadingPlan, setLoadingPlan] =
        useState("");


    // ==========================================
    // CURRENT USER DATA
    // ==========================================

    const currentCredits = Number(
        user?.credits ?? 0
    );

    const currentPlan =
        user?.plan || "free";


    // ==========================================
    // TOTAL CREDITS
    // ==========================================

    const totalCredits = Number(
        user?.totalCredits ??
        currentCredits
    );


    // ==========================================
    // CREDIT PERCENTAGE
    // ==========================================

    const creditPercentage =
        totalCredits > 0
            ? Math.min(
                100,
                Math.max(
                    0,
                    (currentCredits /
                        totalCredits) *
                        100
                )
            )
            : 0;


    // ==========================================
    // DEBUG
    // ==========================================

    console.log(
        "BillingDrawer Credits:",
        currentCredits
    );


    // ==========================================
    // UPGRADE HANDLER
    // ==========================================

    const handleUpgrade = async (plan) => {
        try {
            setLoadingPlan(plan);

            console.log(
                "Starting upgrade:",
                plan
            );


            // ======================================
            // CREATE RAZORPAY ORDER
            // ======================================

            const orderData =
                await createOrder({
                    plan,
                });

            console.log(
                "Create Order Response:",
                orderData
            );

            const order =
                orderData?.order ||
                orderData;

            if (!order?.id) {
                throw new Error(
                    "Order creation failed"
                );
            }


            // ======================================
            // CHECK RAZORPAY SDK
            // ======================================

            if (!window.Razorpay) {
                throw new Error(
                    "Razorpay SDK not loaded"
                );
            }


            // ======================================
            // RAZORPAY KEY
            // ======================================

            const razorpayKey =
                import.meta.env
                    .VITE_RAZORPAY_KEY_ID;

            if (!razorpayKey) {
                throw new Error(
                    "Razorpay Key ID is missing"
                );
            }


            // ======================================
            // RAZORPAY OPTIONS
            // ======================================

            const options = {
                key: razorpayKey,

                amount:
                    order.amount,

                currency:
                    order.currency ||
                    "INR",

                name: "Omnix",

                description:
                    `${plan} Plan`,

                order_id:
                    order.id,


                // ==================================
                // PAYMENT SUCCESS
                // ==================================

                handler: async function (
                    response
                ) {
                    try {
                        console.log(
                            "Razorpay Response:",
                            response
                        );


                        // ==========================
                        // VERIFY PAYMENT
                        // ==========================

                        const result =
                            await verifyPayment(
                                response
                            );

                        console.log(
                            "Verify Payment Response:",
                            result
                        );


                        // ==========================
                        // UPDATE REDUX
                        // ==========================

                        if (
                            result?.success &&
                            result?.user
                        ) {
                            console.log(
                                "Updating Redux User:",
                                result.user
                            );

                            dispatch(
                                setUser(
                                    result.user
                                )
                            );

                            console.log(
                                "Updated Credits:",
                                result.user
                                    ?.credits
                            );
                        }


                        alert(
                            "Payment successful"
                        );

                        onClose();

                    } catch (error) {
                        console.error(
                            "Payment verification failed:",
                            error
                        );

                        alert(
                            error?.response
                                ?.data
                                ?.message ||
                            error?.message ||
                            "Payment verification failed"
                        );

                    } finally {
                        setLoadingPlan("");
                    }
                },


                // ==================================
                // PREFILL USER
                // ==================================

                prefill: {
                    name:
                        user?.name ||
                        "",

                    email:
                        user?.email ||
                        "",
                },


                // ==================================
                // RAZORPAY THEME
                // ==================================

                theme: {
                    color:
                        "#6366f1",
                },


                // ==================================
                // PAYMENT MODAL
                // ==================================

                modal: {
                    ondismiss:
                        function () {
                            console.log(
                                "Razorpay payment window closed"
                            );

                            setLoadingPlan("");
                        },
                },
            };


            console.log(
                "Razorpay Options:",
                options
            );


            // ======================================
            // CREATE RAZORPAY INSTANCE
            // ======================================

            const razorpay =
                new window.Razorpay(
                    options
                );


            // ======================================
            // PAYMENT FAILED
            // ======================================

            razorpay.on(
                "payment.failed",
                function (response) {
                    console.error(
                        "Payment failed:",
                        response.error
                    );

                    alert(
                        response.error
                            ?.description ||
                        "Payment failed"
                    );

                    setLoadingPlan("");
                }
            );


            // ======================================
            // OPEN RAZORPAY
            // ======================================

            razorpay.open();

        } catch (error) {
            console.error(
                "Upgrade error:",
                error
            );

            alert(
                error?.response?.data
                    ?.message ||
                error?.message ||
                "Unable to start payment"
            );

            setLoadingPlan("");
        }
    };


    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* =================================
                        OVERLAY
                    ================================= */}

                    <motion.div
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 0.5,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        onClick={() => {
                            if (!loadingPlan) {
                                onClose();
                            }
                        }}
                        className="fixed inset-0 bg-black z-40"
                    />


                    {/* =================================
                        DRAWER
                    ================================= */}

                    <motion.div
                        initial={{
                            x: "100%",
                        }}
                        animate={{
                            x: 0,
                        }}
                        exit={{
                            x: "100%",
                        }}
                        transition={{
                            duration: 0.25,
                        }}
                        className="fixed right-0 top-0 z-50 h-screen w-[380px] bg-[#0f1117] border-l border-white/10 shadow-2xl flex flex-col"
                    >

                        {/* =============================
                            HEADER
                        ============================== */}

                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">

                            <div>
                                <h2 className="text-[16px] font-semibold text-slate-100">
                                    Upgrade Plan
                                </h2>

                                <p className="text-[11px] text-slate-500 mt-1">
                                    Manage your credits and plan
                                </p>
                            </div>


                            <button
                                onClick={onClose}
                                disabled={
                                    !!loadingPlan
                                }
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors disabled:opacity-50"
                            >
                                <X size={16} />
                            </button>

                        </div>


                        {/* =============================
                            CURRENT CREDITS
                        ============================== */}

                        <div className="px-5 pt-5">

                            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] p-4">

                                <div className="flex items-center justify-between">

                                    <div className="flex items-center gap-3">

                                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400">
                                            <Coins
                                                size={17}
                                            />
                                        </div>


                                        <div>

                                            <p className="text-[11px] text-slate-500">
                                                Current Balance
                                            </p>

                                            <p className="text-[18px] font-semibold text-slate-100">
                                                {currentCredits}{" "}
                                                Credits
                                            </p>

                                        </div>

                                    </div>


                                    <span className="text-[10px] uppercase tracking-wider font-medium text-indigo-400">
                                        {currentPlan}
                                    </span>

                                </div>


                                {/* =======================
                                    CREDIT PROGRESS
                                ======================== */}

                                <div className="mt-4">

                                    <div className="flex items-center justify-between mb-2">

                                        <span className="text-[10px] text-slate-500">
                                            Credits available
                                        </span>

                                        <span className="text-[10px] text-slate-500">
                                            {currentCredits}{" "}
                                            Credits
                                        </span>

                                    </div>


                                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">

                                        <motion.div
                                            initial={{
                                                width: 0,
                                            }}
                                            animate={{
                                                width: `${creditPercentage}%`,
                                            }}
                                            transition={{
                                                duration: 0.4,
                                                ease: "easeOut",
                                            }}
                                            className={`h-full rounded-full ${
                                                currentCredits <=
                                                0
                                                    ? "bg-red-500"
                                                    : currentCredits <
                                                        100
                                                    ? "bg-yellow-500"
                                                    : "bg-indigo-500"
                                            }`}
                                        />

                                    </div>


                                    <div className="flex items-center justify-between mt-2">

                                        <span className="text-[10px] text-slate-600">
                                            {currentCredits <=
                                            0
                                                ? "No credits"
                                                : currentCredits <
                                                    100
                                                ? "Credits running low"
                                                : "Credits available"}
                                        </span>


                                        <span className="text-[10px] text-slate-600">
                                            {Math.round(
                                                creditPercentage
                                            )}
                                            %
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =============================
                            PLANS
                        ============================== */}

                        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">

                            <div className="flex items-center justify-between mb-1">

                                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">
                                    Available Plans
                                </p>

                                <span className="text-[10px] text-slate-600">
                                    30 days validity
                                </span>

                            </div>


                            {/* =========================
                                STARTER
                            ========================== */}

                            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 hover:border-indigo-500/30 transition-colors">

                                <div className="flex items-start justify-between">

                                    <div>

                                        <h3 className="text-[14px] font-semibold text-slate-100">
                                            Starter
                                        </h3>

                                        <p className="text-[11px] text-slate-500 mt-1">
                                            For regular AI usage
                                        </p>

                                    </div>


                                    <span className="text-[16px] font-semibold text-white">
                                        ₹199
                                    </span>

                                </div>


                                <div className="mt-4 space-y-2">

                                    <div className="flex items-center gap-2 text-[12px] text-slate-400">

                                        <Check
                                            size={13}
                                            className="text-indigo-400"
                                        />

                                        500 Credits

                                    </div>


                                    <div className="flex items-center gap-2 text-[12px] text-slate-400">

                                        <Check
                                            size={13}
                                            className="text-indigo-400"
                                        />

                                        30 Days Validity

                                    </div>

                                </div>


                                <button
                                    onClick={() =>
                                        handleUpgrade(
                                            "starter"
                                        )
                                    }
                                    disabled={
                                        !!loadingPlan
                                    }
                                    className="w-full mt-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[12px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingPlan ===
                                    "starter"
                                        ? "Processing..."
                                        : "Buy Starter"}
                                </button>

                            </div>


                            {/* =========================
                                PRO
                            ========================== */}

                            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/[0.05] p-4">

                                <div className="flex items-start justify-between">

                                    <div>

                                        <div className="flex items-center gap-2">

                                            <h3 className="text-[14px] font-semibold text-slate-100">
                                                Pro
                                            </h3>

                                            <span className="text-[9px] font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                                                Popular
                                            </span>

                                        </div>


                                        <p className="text-[11px] text-slate-500 mt-1">
                                            For heavy AI usage
                                        </p>

                                    </div>


                                    <span className="text-[16px] font-semibold text-white">
                                        ₹499
                                    </span>

                                </div>


                                <div className="mt-4 space-y-2">

                                    <div className="flex items-center gap-2 text-[12px] text-slate-400">

                                        <Check
                                            size={13}
                                            className="text-indigo-400"
                                        />

                                        1000 Credits

                                    </div>


                                    <div className="flex items-center gap-2 text-[12px] text-slate-400">

                                        <Check
                                            size={13}
                                            className="text-indigo-400"
                                        />

                                        30 Days Validity

                                    </div>

                                </div>


                                <button
                                    onClick={() =>
                                        handleUpgrade(
                                            "pro"
                                        )
                                    }
                                    disabled={
                                        !!loadingPlan
                                    }
                                    className="w-full mt-4 py-2.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 hover:opacity-90 text-white text-[12px] font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingPlan ===
                                    "pro"
                                        ? "Processing..."
                                        : "Buy Pro"}
                                </button>

                            </div>

                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default BillingDrawer;