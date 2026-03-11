import User from "../models/User.js"
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d'})
}

export async function loginUser(req,res) {
    const {email,password} = req.body
    
    try{
        const user = await User.login(email,password)
        //create a token
        const token = createToken(user._id)

        res.status(200).json({
            email: email,
            name: user.name,
            role: user.role,
            token: token});
    } catch (error) {
        res.status(500).json({error: error.message});
    }    
    
}

export async function signupUser(req,res) {
    //signup users
    const {name,email,password,role} = req.body

    try{
        const user = await User.signup(name,email,password,role)
        
        //create a token
        const token = createToken(user._id)

        res.status(201).json({email,name,role,token});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export async function getUsers(req,res) {
    //send users
    try {
        const users = await User.find().sort({createdAt:-1});
        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getUsers", error)
        res.status(500).json({meassage:"Internal server error"});    
    }
}

export async function getUser(req,res) {
    //send user
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({meassage:"Your user was not found"});
        res.status(200).json(user);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Your user was not found' });
        }
        console.error("Error in getUser", error)
        res.status(500).json({meassage:"Internal server error"});    
    }
}

export async function updateUser(req, res) {
    try {
        const updates = { ...req.body };

        // Remove password if it exists
        delete updates.password;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({ message: "User not found" });
        }

        console.error("Error in updateUser controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateUserPassword(req, res) {
    try {
    const userId = req.user.id; // set by auth middleware
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (!validator.isStrongPassword(newPassword)){
        throw Error('New Password is not strong enough')
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully",
    });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        message: "Server error",
        });
    }
}

export async function deleteUser(req,res) {
    //delete users
    try {
        const deleteUser = await User.findByIdAndDelete(req.params.id);
        if (!deleteUser) return res.status(404).json({meassage:"Your user was not found"});
        res.status(200).json({meassage:"Your user was deleted successfully"});
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Your user was not found' });
        }
        console.error("Error in deleteUser controller", error)
        res.status(500).json({meassage:"Internal server error"});    
    }
}