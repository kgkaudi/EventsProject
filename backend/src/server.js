import express from "express";
import eventsRoutes from "./routes/eventsRoutes.js"
import usersRoutes from "./routes/usersRoutes.js"
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";

import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

//middlewares
app.use(cors());
app.use(express.json());
// app.use(rateLimiter);

app.use((req,res,next)=>{
    console.log(`Req method is ${req.method} and url is ${req.url}`);
    next();
})

//Routes
app.use("/api/events", eventsRoutes);
app.use("/api/users", usersRoutes);

connectDB().then(()=> {
    app.listen(PORT, () => {
        console.log("Server runs on PORT:", PORT);
    })
});