import {asyncHandler} from '../utils/asyncHandler.js'; 
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError} from '../utils/ApiErrror.js';

const registerUser = asyncHandler(async (req, res) => {
   //get user details from frontend
   //validation - not empty
   //check if user already exists:USERNAME,EMAIL    
   //CHECK FOR IMAGES,CHECK FOR AVATAR  
   //upload them to cloudinary , avatar 
   //create user object -creation entry in db
   //remove password and refresh token field from response 
   //check for user creation 
   //return res 
   
   const {fullName, email, password, username} = req.body
   console.log("email: ", email);

   if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
   ){
     throw new ApiError(400, "All fields are required")
   }

    const existedUser= await User.findOne({
    $or:[{username},{email}]
   })

   if(existedUser){
    throw new ApiError(409," User with email or username already exist")
   }
   


   const avatarLocalPath = req.files?.avatar?.[0]?.path;
   const coverImageLocalPath= req.files?.coverImage?.[0]?.path;
   console.log("Avatar Path:", avatarLocalPath);
   console.log("Cover Image Path:", coverImageLocalPath);

   
   


   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
   }

  const avatar=await  uploadOnCloudinary(avatarLocalPath)

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  
   if(!avatar){
    throw new ApiError(400,"Avatar file is required")
   }
    const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage:coverImage.url || "",
    email,
    password,
    username: username.toLowerCase()
   })

  const createdUser =  await User.findById(user._id).select(
    "-password -refreshToken"
  )                                                      

  if(!createdUser){
    throw new ApiError(500,"something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200 , createdUser,"User registered Successfully")
  )



})

export {registerUser}; 