import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";    //nodejs file system for file handling.
import dotenv from 'dotenv';
dotenv.config({ path: "./.env" });
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        console.log('File uploaded', response);
        fs.unlinkSync(localFilePath)    //remove from server.
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}






const deletefromCloudinary=async (publicId)=>{
    try {
       const result= await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        console.log("error in dleting the file ",error)
    }
}

export {uploadOnCloudinary,deletefromCloudinary}