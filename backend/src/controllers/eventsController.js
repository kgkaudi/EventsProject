import Event from "../models/Event.js"

export async function getAllEvents(req,res) {
    //send events
    try {
        const events = await Event.find().sort({createdAt:-1});
        res.status(200).json(events);
    } catch (error) {
        console.error("Error in getAllEvents", error)
        res.status(500).json({meassage:"Internal server error"});    
    }
}

export async function createEvent(req,res) {
    //create events
    try {
        const {title,content,location,maxcapacity,date} = req.body;
        const newEvent = new Event({title, content, location, maxcapacity, date});

        await newEvent.save();
        res.status(201).json({meassage:"Your event was created successfully"});
    } catch (error) {
        console.error("Error in createEvent controller", error)
        res.status(500).json({meassage:"Internal server error"});    
    }
}

export async function updateEvent(req,res) {
    //update events
    try {
        const {title,content,location,maxcapacity,date} = req.body;        
        const updateEvent = await Event.findByIdAndUpdate(req.params.id, {title,content,location,maxcapacity,date}, {new :true});
        if (!updateEvent) return res.status(404).json({meassage:"Your event was not found"});
        res.status(200).json(updateEvent);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Your event was not found' });
        }
        console.error("Error in updateEvent controller", error)
        res.status(500).json({meassage:"Internal server error"});    
    }
}

export async function deleteEvent(req,res) {
    //delete events
    try {
        const deleteEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deleteEvent) return res.status(404).json({meassage:"Your event was not found"});
        res.status(200).json({meassage:"Your event was deleted successfully"});
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Your event was not found' });
        }
        console.error("Error in deleteEvent controller", error)
        res.status(500).json({meassage:"Internal server error"});    
    }
}

export async function getEvent(req,res) {
    //send events
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({meassage:"Your event was not found"});
        res.status(200).json(event);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Your event was not found' });
        }
        console.error("Error in getAllEvents", error)
        res.status(500).json({meassage:"Internal server error"});    
    }
}