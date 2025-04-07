import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.models.js';

const verifyToken = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.refreshToken || req.header('Authorization')?.replace("Bearer ", '');

    console.log("Token received:", token); // Debugging

    if (!token) {
        throw new ApiError(401, "Token is missing");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token.");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("JWT Error:", error.message); // Log specific JWT error
        throw new ApiError(401, error?.message || "Token verification failed");
    }
});

export default verifyToken;
