import { getAuth } from "firebase-admin/auth";
import crypto from "crypto";
import User from "../models/user.model.js";
import redisClient from "../../../shared/redis/redis.js";

// ======================================================
// SESSION HELPER
// ======================================================

const saveSession = async (sessionId, user) => {
  if (!sessionId || !user) {
    return false;
  }

  const sessionData = {
    userId: user._id.toString(),
    name: user.name || "",
    email: user.email || "",
    avatar: user.avatar || "",
    plan: user.plan || "free",
    credits: user.credits || 0,
    totalCredits: user.totalCredits || 0,
    planExpiresAt:
      user.planExpiresAt || null,
  };

  await redisClient.set(
    `session:${sessionId}`,
    JSON.stringify(sessionData),
    "EX",
    60 * 60 * 24 * 7
  );

  console.log(
    "Redis session updated:",
    `session:${sessionId}`
  );

  return true;
};


// ======================================================
// LOGIN
// ======================================================

export const login = async (req, res) => {

  console.log(
    "1. Login API Hit"
  );

  try {

    const { token } =
      req.body;

    console.log(
      "2. Token Received"
    );


    if (!token) {

      return res.status(400).json({
        success: false,
        message:
          "Firebase token is required",
      });
    }


    // ==============================================
    // FIREBASE VERIFICATION
    // ==============================================

    const decodedToken =
      await getAuth()
        .verifyIdToken(token);


    console.log(
      "3. Firebase Verified"
    );


    // ==============================================
    // FIND USER
    // ==============================================

    let user =
      await User.findOne({
        firebaseUid:
          decodedToken.uid,
      });


    console.log(
      "4. User Checked"
    );


    // ==============================================
    // CREATE USER
    // ==============================================

    if (!user) {

      user =
        await User.create({

          firebaseUid:
            decodedToken.uid,

          name:
            decodedToken.name ||
            "",

          email:
            decodedToken.email ||
            "",

          avatar:
            decodedToken.picture ||
            "",

          plan:
            "free",

          credits:
            100,

          totalCredits:
            100,
        });


      console.log(
        "5. User Created"
      );
    }


    // ==============================================
    // CREATE SESSION
    // ==============================================

    const sessionId =
      crypto.randomUUID();


    console.log(
      "6. Session Created:",
      sessionId
    );


    // ==============================================
    // SAVE REDIS SESSION
    // ==============================================

    await saveSession(
      sessionId,
      user
    );


    console.log(
      "7. Redis Session Saved"
    );


    // ==============================================
    // COOKIE
    // ==============================================

    res.cookie(
      "session",
      sessionId,
      {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge:
          1000 *
          60 *
          60 *
          24 *
          7,
      }
    );


    console.log(
      "8. Cookie Sent"
    );


    // ==============================================
    // RESPONSE
    // ==============================================

    return res.status(200).json({

      success: true,

      user: {

        _id:
          user._id,

        firebaseUid:
          user.firebaseUid,

        name:
          user.name,

        email:
          user.email,

        avatar:
          user.avatar,

        plan:
          user.plan,

        credits:
          user.credits,

        totalCredits:
          user.totalCredits,

        planExpiresAt:
          user.planExpiresAt ||
          null,
      },
    });


  } catch (error) {

    console.error(
      "Login Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message,
    });
  }
};


// ======================================================
// LOGOUT
// ======================================================

export const logout = async (
  req,
  res
) => {

  try {

    const sessionId =
      req.cookies?.session;


    console.log(
      "Logout Session:",
      sessionId
    );


    if (sessionId) {

      await redisClient.del(
        `session:${sessionId}`
      );


      console.log(
        "Redis Session Deleted"
      );
    }


    res.clearCookie(
      "session",
      {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      }
    );


    return res.status(200).json({

      success: true,

      message:
        "Logout Successful",
    });


  } catch (error) {

    console.error(
      "Logout Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal Server Error",
    });
  }
};


// ======================================================
// UPDATE USER PAYMENT
// ======================================================

export const updateUserPayment = async (
  req,
  res
) => {

  try {

    const {
      plan,
      credits,
      userId,
    } = req.body;


    console.log(
      "\n================================="
    );

    console.log(
      "UPDATE USER PAYMENT"
    );

    console.log(
      "================================="
    );


    console.log(
      "Payment Data:",
      {
        userId,
        plan,
        credits,
      }
    );


    // ==============================================
    // VALIDATION
    // ==============================================

    if (!userId) {

      return res.status(400).json({

        success: false,

        message:
          "User ID is required",
      });
    }


    if (!plan) {

      return res.status(400).json({

        success: false,

        message:
          "Plan is required",
      });
    }


    if (
      credits === undefined ||
      credits === null
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Credits are required",
      });
    }


    const creditAmount =
      Number(credits);


    if (
      !Number.isFinite(
        creditAmount
      ) ||
      creditAmount <= 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Credits must be a positive number",
      });
    }


    // ==============================================
    // FIND USER
    // ==============================================

    const user =
      await User.findById(
        userId
      );


    if (!user) {

      return res.status(404).json({

        success: false,

        message:
          "User not found",
      });
    }


    // ==============================================
    // UPDATE MONGODB
    // ==============================================

    user.plan =
      plan;

    user.credits =
      (user.credits || 0) +
      creditAmount;

    user.totalCredits =
      (user.totalCredits || 0) +
      creditAmount;

    user.planExpiresAt =
      new Date(
        Date.now() +
        30 *
        24 *
        60 *
        60 *
        1000
      );


    await user.save();


    console.log(
      "MongoDB User Updated:",
      {
        plan:
          user.plan,

        credits:
          user.credits,

        totalCredits:
          user.totalCredits,

        planExpiresAt:
          user.planExpiresAt,
      }
    );


    // ==============================================
    // UPDATE REDIS SESSION
    // ==============================================

    const sessionId =
      req.headers[
      "x-session-id"
      ];


    console.log(
      "Session ID:",
      sessionId
    );


    if (sessionId) {

      await saveSession(
        sessionId,
        user
      );

    } else {

      console.warn(
        "⚠️ x-session-id missing."
      );

      console.warn(
        "MongoDB updated but Redis session was not updated."
      );
    }


    // ==============================================
    // RESPONSE
    // ==============================================

    return res.status(200).json({

      success: true,

      message:
        "User payment updated successfully",

      user: {

        _id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        avatar:
          user.avatar,

        plan:
          user.plan,

        credits:
          user.credits,

        totalCredits:
          user.totalCredits,

        planExpiresAt:
          user.planExpiresAt,
      },
    });


  } catch (error) {

    console.error(
      "Update user payment error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to update user payment",

      error:
        error.message,
    });
  }
};


// ======================================================
// DEDUCT CREDITS
// ======================================================

export const deductCredits = async (
  req,
  res
) => {

  try {

    const {
      userId,
      agent,
    } = req.body;


    console.log(
      "\n================================="
    );

    console.log(
      "DEDUCT CREDITS"
    );

    console.log(
      "================================="
    );


    console.log(
      "Request:",
      {
        userId,
        agent,
      }
    );


    // ==============================================
    // CREDIT COSTS
    // ==============================================

    const COST = {

      chat: 1,

      search: 5,

      coding: 10,

      pdf: 10,

      ppt: 10,

      vision: 10,

    };


    // ==============================================
    // VALIDATION
    // ==============================================

    if (!userId) {

      return res.status(400).json({

        success: false,

        message:
          "User ID is required",
      });
    }


    if (!agent) {

      return res.status(400).json({

        success: false,

        message:
          "Agent is required",
      });
    }


    if (
      COST[agent] === undefined
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid agent",
      });
    }


    const cost =
      COST[agent];


    console.log(
      "Credit Cost:",
      cost
    );


    // ==============================================
    // FIND USER
    // ==============================================

    const user =
      await User.findById(
        userId
      );


    if (!user) {

      return res.status(404).json({

        success: false,

        message:
          "User not found",
      });
    }


    console.log(
      "Current Credits:",
      user.credits
    );


    // ==============================================
    // CHECK CREDITS
    // ==============================================

    if (
      user.credits < cost
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Insufficient credits",

        credits:
          user.credits,

        required:
          cost,
      });
    }


    // ==============================================
    // DEDUCT
    // ==============================================

    user.credits -= cost;


    await user.save();


    console.log(
      "Credits Deducted:",
      {
        userId:
          user._id.toString(),

        agent,

        cost,

        remainingCredits:
          user.credits,
      }
    );


    // ==============================================
    // UPDATE REDIS SESSION
    // ==============================================

    const sessionId =
      req.headers[
      "x-session-id"
      ];


    console.log(
      "Session ID:",
      sessionId
    );


    if (sessionId) {

      await saveSession(
        sessionId,
        user
      );

    } else {

      console.warn(
        "⚠️ x-session-id missing."
      );

      console.warn(
        "MongoDB updated but Redis session was not updated."
      );
    }


    // ==============================================
    // RESPONSE
    // ==============================================

    return res.status(200).json({

      success: true,

      message:
        "Credits deducted successfully",

      // IMPORTANT:
      // Frontend / Agent will use this
      // exact updated value.

      credits:
        user.credits,

      cost,

      agent,
    });


  } catch (error) {

    console.error(
      "Deduct credits error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to deduct credits",

      error:
        error.message,
    });
  }
};