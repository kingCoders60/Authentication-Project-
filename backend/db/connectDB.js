import mongoose from 'mongoose'
export const connectDB=async()=>{
    try {
        // console.log(process.env.MONGO_URI);
        const conn = await mongoose.connect(process.env.MONGO_URI)        
    } catch (error) {
        console.log("Error connection to MongoDB",error.message);
        process.exit(1);
    }
}