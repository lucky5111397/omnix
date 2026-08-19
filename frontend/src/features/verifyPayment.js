import api from "../../utils/axios";
import { store } from "../redux/store";

export const verifyPayment = async (payload) => {
    try {
        const user = store.getState().user.user;

        console.log("Redux User:", user);
        console.log("Verify Payload:", payload);

        const verifyData = {
            razorpay_order_id: payload?.razorpay_order_id,
            razorpay_payment_id: payload?.razorpay_payment_id,
            razorpay_signature: payload?.razorpay_signature,
        };

        console.log("Sending Verify Data:", verifyData);

        const { data } = await api.post(
            "/api/billing/verify",
            verifyData,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user?._id,
                },
            }
        );

        console.log("Verify Payment Response:", data);

        return data;

    } catch (error) {
        console.error(
            "Payment verification error:",
            error?.response?.data || error.message
        );

        throw error;
    }
};