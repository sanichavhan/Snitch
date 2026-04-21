import userModel from "../models/user.model.js";
import blacklistModel from "../models/blacklist.model.js";
import jwt from "jsonwebtoken"
import { config } from "../config/config.js";


async function sendTokenResponse(user, res, message) {

    const token = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRE
    })

    res.cookie("token", token, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: config.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message,
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role
        }
    })

}


export const register = async (req, res) => {
    const { email, contact, password, fullname, isSeller } = req.body;

    try {
        // Check for empty fields
        if (!email || !contact || !password || !fullname) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await userModel.findOne({
            $or: [
                { email },
                { contact }
            ]
        })

        if (existingUser) {
            return res.status(400).json({ message: "User with this email or contact already exists" });
        }

        const user = await userModel.create({
            email,
            contact,
            password,
            fullname,
            role: isSeller ? "seller" : "buyer"
        })

        await sendTokenResponse(user, res, "User registered successfully")

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server error during registration" });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        await sendTokenResponse(user, res, "User logged in successfully")
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server error" });
    }
}

export const googleCallback = async (req, res) => {
    try {
        const { id, displayName, emails, photos } = req.user
        const email = emails[0].value;
        const profilePic = photos[0].value;

        let user = await userModel.findOne({ email })

        if (!user) {
            user = await userModel.create({
                email,
                googleId: id,
                fullname: displayName,
                role: "buyer" // Default role for Google auth users
            })
        }

        const token = jwt.sign({
            id: user._id,
        }, config.JWT_SECRET, {
            expiresIn: "7d"
        })

        res.cookie("token", token, {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: config.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.redirect(`${config.FRONTEND_URL}/`)
    } catch (error) {
        console.error("Google callback error:", error)
        res.redirect(`${config.FRONTEND_URL}/login?error=authentication_failed`)
    }
}

export const getMe = async (req, res) => {
    const user = req.user;

    res.status(200).json({
        message: "User fetched successfully",
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role
        }
    })
}

export const logout = async (req, res) => {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(400).json({ message: "No token found" })
        }

        // Add token to blacklist
        await blacklistModel.create({ token })

        // Clear the cookie
        res.clearCookie("token")

        res.status(200).json({
            message: "Logged out successfully",
            success: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server error" })
    }
}