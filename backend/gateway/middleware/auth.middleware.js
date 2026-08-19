import redisClient from "../../shared/redis/redis.js";

const protect = async (req, res, next) => {
    try {

        // ==========================================
        // GET SESSION ID FROM COOKIE
        // ==========================================

        const sessionId =
            req.cookies?.session;


        if (!sessionId) {

            return res.status(401).json({
                success: false,
                message:
                    "Unauthorized",
            });
        }


        // ==========================================
        // GET SESSION FROM REDIS
        // ==========================================

        const sessionKey =
            `session:${sessionId}`;


        const sessionData =
            await redisClient.get(
                sessionKey
            );


        if (!sessionData) {

            return res.status(401).json({
                success: false,
                message:
                    "Session Expired",
            });
        }


        // ==========================================
        // PARSE SESSION
        // ==========================================

        let user;

        try {

            user =
                JSON.parse(
                    sessionData
                );

        } catch (parseError) {

            console.error(
                "Redis Session Parse Error:",
                parseError
            );

            return res.status(401).json({
                success: false,
                message:
                    "Invalid session",
            });
        }


        // ==========================================
        // VALIDATE USER ID
        // ==========================================

        if (!user?.userId) {

            console.error(
                "Redis session does not contain userId:",
                user
            );

            return res.status(401).json({
                success: false,
                message:
                    "Invalid user session",
            });
        }


        // ==========================================
        // STORE USER + SESSION
        // ==========================================

        req.user = {

            ...user,

            userId:
                user.userId,

            sessionId,

        };


        // ==========================================
        // DEBUG
        // ==========================================

        console.log(
            "========== AUTH MIDDLEWARE =========="
        );

        console.log(
            "Session Key:",
            sessionKey
        );

        console.log(
            "User ID:",
            req.user.userId
        );

        console.log(
            "Credits:",
            req.user.credits
        );

        console.log(
            "Total Credits:",
            req.user.totalCredits
        );

        console.log(
            "Plan:",
            req.user.plan
        );

        console.log(
            "Session ID:",
            req.user.sessionId
        );


        // ==========================================
        // NEXT
        // ==========================================

        next();


    } catch (error) {

        console.error(
            "Auth Middleware Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal Server Error",
        });
    }
};


export default protect;