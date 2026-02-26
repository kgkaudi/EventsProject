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

        res.status(200).json({email,token});
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

        res.status(201).json({email,token});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export async function updateUser(req,res) {
    //update events
    // try {
    //     const {title,content,location,maxcapacity,date} = req.body;        
    //     const updateEvent = await Event.findByIdAndUpdate(req.params.id, {title,content,location,maxcapacity,date}, {new :true});
    //     if (!updateEvent) return res.status(404).json({meassage:"Your event was not found"});
        // res.status(200).json(updateEvent);
    // } catch (error) {
    //     if (error.name === 'CastError') {
    //         return res.status(404).json({ message: 'Your event was not found' });
    //     }
    //     console.error("Error in updateEvent controller", error)
    //     res.status(500).json({meassage:"Internal server error"});    
    // }
    res.status(200).json({message:"Update a user"});
}

export async function deleteUser(req,res) {
    //delete events
    // try {
    //     const deleteEvent = await Event.findByIdAndDelete(req.params.id);
    //     if (!deleteEvent) return res.status(404).json({meassage:"Your event was not found"});
    //     res.status(200).json({meassage:"Your event was deleted successfully"});
    // } catch (error) {
    //     if (error.name === 'CastError') {
    //         return res.status(404).json({ message: 'Your event was not found' });
    //     }
    //     console.error("Error in deleteEvent controller", error)
    //     res.status(500).json({meassage:"Internal server error"});    
    // }
    res.status(200).json({message:"Delete a user"});
}

export async function getUser(req,res) {
    //send events
    // try {
    //     const event = await Event.findById(req.params.id);
    //     if (!event) return res.status(404).json({meassage:"Your event was not found"});
    //     res.status(200).json(event);
    // } catch (error) {
    //     if (error.name === 'CastError') {
    //         return res.status(404).json({ message: 'Your event was not found' });
    //     }
    //     console.error("Error in getAllEvents", error)
    //     res.status(500).json({meassage:"Internal server error"});    
    // }
    res.status(200).json({message:"Get a user"});
}