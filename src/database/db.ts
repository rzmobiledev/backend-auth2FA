import mongoose from "mongoose";
import { config } from "../config/app.config"

const connectDatabase: () => Promise<void> = async(): Promise<void> => {
    try{
        await mongoose.connect(config.MONGO_URI)
        console.log("MongoDB Connected")
    }catch(err){
        console.log("Error connecting database")
        process.exit(1)
    }
}

export default connectDatabase