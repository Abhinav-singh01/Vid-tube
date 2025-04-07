import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary,deletefromCloudinary } from "../utils/cloudinary.js";

import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config({ path: "./.env" });


const registerUser= asyncHandler(async(req,res)=>{
  const {fullName,username,email,password}=req.body;

  
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required.");
  }


  const finduser=await User.findOne({
    $or:[{username},{email}]
  })

  if(finduser){
        throw new ApiError("401","user already exists")
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
//  const coverLocalPath = req.files?.coverImage[0]?.path;

let coverLocalPath;
if(req?.files?.coverImage){
  coverLocalPath = req.files?.coverImage?.[0]?.path;
}

 if (!avatarLocalPath) {
  throw new ApiError(400, "Avatar file is required.");
}

 const avatar = await uploadOnCloudinary(avatarLocalPath);
 const coverImage = await uploadOnCloudinary(coverLocalPath);

 if (!avatar) {
  throw new ApiError(400, "Avatar file is required.");
}



try {
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  
  const createdUser = await User.findById(user._id)?.select(
    "-password -refreshToken"
  );
  //remove password & refreshtoken from user obj.
  
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while user registeration.");
  }
  
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Created Successfully."));
  }
 catch (error) {

  if(avatar){
    deletefromCloudinary(avatar.public_id)
  }
  if(coverImage){
    deletefromCloudinary(coverImage.public_id);
  }
  throw new ApiError(500, "Something went wrong while user registeration.and img are deleted");
}})

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.AccessToken();
    const refreshToken = user.RefreshToken();

    user.refreshToken = refreshToken; 
    console.log( user.refreshToken)//assign the refreshToken into the object.
    await user.save({ validateBeforeSave: false }); //pass validateBeforeSave, coz on every save, User model is triggered then it'll try to find all the props of schema:
    //   password: {
    //     type: String,
    //     required: [true, "Password is required"]
    // },
    //so we say control, that don't validate anything,  simply save.

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access/Refresh tokens."
    );
  }
};






const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Check if either username or email is provided
  if (!(username || email)) {
    throw new ApiError(400, "Username or Email is required");
  }

  // Find the user by username or email
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Validate the password
  const isPasswordValid = await user.isPasswordCorrect(password); // Ensure this is an instance method
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  // Fetch user data excluding sensitive fields
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // Cookie options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };
  console.log(refreshToken)

  // Set cookies and respond
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});


const refreshAccessToken =asyncHandler(async(req,res)=>{
  const incomingRefreshToken =
  req.cookies?.refreshToken || req.body?.refreshToken;

  if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized User");
  }
 

 try {
  const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
   const user=User.findById(decodedToken?._id);
   if(!user){
     throw new ApiError(401,"user not found")
   }
 
   if(incomingRefreshToken!=user.refreshToken){
     throw new ApiError(401,"refreshe token doesnot exist")
   }
 
   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
     user?._id
   );
 
   
   const options = {
     httpOnly: true,
     secure: true,
   };
 
   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
     new ApiResponse(
       200,
       { accessToken, refreshToken },
       "Access Token Refreshed."
     )
   )
 } catch (error) {
  return new ApiError(401, error?.message || "Invalid Refresh Token");
 }
})

const logout=asyncHandler(async(res,req)=>{
  await User.findByIdAndUpdate(
    req?.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out."));

})

const updateUserPassword = asyncHandler(async (req, res) => {
  //get old & new password from user
  const { oldPassword, newPassword } = req.body;
  console.log(req.body);

  //find the user, it's in req.user coz of verifyJWT middleware.
  const user = await User.findById(req.user._id);
  console.log("user", user);
  //check if we've got the right (old) password
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  console.log(isPasswordCorrect);
  if (!isPasswordCorrect) {
    console.log("inside");
    throw new ApiError(400, "Invalid Old Password Provided.");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  console.log("user", user);
  return res.status(200).json(new ApiResponse(200, {}, "Password Changed Successfully"))
});



const updateAccountDetails = asyncHandler(async (req, res) => {
  //get new data from user
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email: email, //two ways to assign values.
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Data updated successfully."));
});
export {registerUser,loginUser,logout}