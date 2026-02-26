import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required: true
        },
        content:{
            type:String,
            required: true
        },
        location:{
            type:String,
            required: true
        },
        maxcapacity:{
            type:Number,
            required: false
        },
        date:{
            type:Date,
            required: true
        },
    },
    { timestamps: true}
);

const Event = mongoose.model("Event", eventSchema);

export default Event;