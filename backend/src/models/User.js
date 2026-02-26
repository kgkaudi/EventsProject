import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const userSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true 
        },
        email:{
            type:String,
            required: true,
            unique: true
        },
        password:{
            type:String,
            required: true
        },
        role: {
            type: String,
            enum: ["user", "admin", "manager"],
            default: "user",
        },

    },
    { timestamps: true}
);

userSchema.statics.signup = async function (name,email,password,role) {

    //validation
    if (!name || !email || !password || !role){
        throw Error('You must fill all the fields')
    }
    if (!validator.isEmail(email)){
        throw Error('Email is not valid')
    }
    if (!validator.isStrongPassword(password)){
        throw Error('Password is not strong enough')
    }

    const exists = await this.findOne({ email})

    if (exists){
        throw Error('Email already in use')
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({ name,email, password: hash, role: "user"})
    
    return user
}

userSchema.statics.login = async function (email,password) {

    //validation
    if (!email || !password){
        throw Error('You must fill all the fields')
    }
    
    const user = await this.findOne({ email})

    if (!user){
        throw Error('User not found')
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match){
        throw Error('Incorrect password')
    }
    
    return user
}

const Event = mongoose.model("User", userSchema);

export default Event;