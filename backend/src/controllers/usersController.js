import User from "../models/User.js"
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