export const getCurrentUser = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        console.error(
            "Get Current User Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Get Current User Failed",
        });
    }
};