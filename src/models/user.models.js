
import mongoose ,{ Schema,} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userschema= new Schema(
    {
        username:{
            type: String,
            required:true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true

        },
        email:{
            type: String,
            required:true,
            unique: true,
            trim: true,
            lowercase: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String,    //cludinary url
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
      ],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String,
        }
      

    },
    {timestamps:true}
)




userschema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next(); 
});

userschema.methods.isPasswordCorrect = async function (password) {
    if (!password || !this.password) {
        throw new Error('Password or hashed password is missing');
    }
    return await bcrypt.compare(String(password), String(this.password));
};
userschema.methods.AccessToken=function(){
    jwt.sign(
        {
            _id:this._id,
            username:this.username,

        },process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_TIME}
    )
}

userschema.methods.RefreshToken=function(){
    jwt.sign(
        {
            _id:this._id,
            
        },process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_TIME}
    )
}
export const User = mongoose.model("User",userschema)