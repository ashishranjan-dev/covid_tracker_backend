import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from '../config/emailConfig.js'
import crypto from "crypto";

// const pagepass=path.join(__dirname,'index.html')

class UserController {
    static userRegistration = async(req, res) => {
        const { name, email, password, password_confrimation } = req.body;

        const user = await UserModel.findOne({ email: email });

        if (user) {
            res.status(400).send({ status: false, message: "Email already exist" });
        } else {
            if (name && email && password && password_confrimation) {
                if (password === password_confrimation) {
                    try {
                        const salt = await bcrypt.genSalt(12);

                        const hashPassword = await bcrypt.hash(password, salt);

                        const doc = new UserModel({
                            name: name,
                            email: email,
                            password: hashPassword,
                            email_token: crypto.randomBytes(64).toString("hex"),
                        });

                        await doc.save();

                        const saved_user = await UserModel.findOne({ email: email });
                        // Generate JWT Token
                        const token = jwt.sign({ userID: saved_user._id },
                            process.env.JWT_SECRET_KEY, { expiresIn: "30d" }
                        );

                        res
                            .status(200)
                            .send({
                                status: true,
                                message: "Registration Success",
                                token: token,
                            });
                    } catch (error) {
                        res
                            .status(500)
                            .send({ status: false, message: "unable to register" });
                    }
                } else {
                    res
                        .status(400)
                        .send({ status: false, message: "Password dosen't match" });
                }
            } else {
                res
                    .status(400)
                    .send({ status: false, message: "All fields are required" });
            }
        }
    };

    //user login

    static userLogin = async(req, res) => {
        try {
            const { email, password } = req.body;
            if (email && password) {
                const user = await UserModel.findOne({ email: email });
                if (user != null) {
                    const isMatch = await bcrypt.compare(password, user.password);

                    if (user.email === email && isMatch) {
                        // Generate JWT Token
                        const token = jwt.sign({ userID: user._id },
                            process.env.JWT_SECRET_KEY, { expiresIn: "30d" }
                        );
                        res
                            .status(200)
                            .send({
                                status: true,
                                message: "Login Successful",
                                token: token,
                            });
                    } else {
                        res
                            .status(400)
                            .send({ status: false, message: "Password is not Valid" });
                    }
                } else {
                    res
                        .status(400)
                        .send({ status: false, message: "You are not a Registered User" });
                }
            } else {
                res
                    .status(400)
                    .send({ status: false, message: "All Fields are Required" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ status: false, false: "Unable to Login" });
        }
    };

    // change password

    static changeUserPassword = async(req, res) => {
        const { old_password, new_password, password_confirmation } = req.body;

        try {
            if (old_password && new_password && password_confirmation) {
                const Match = await bcrypt.compare(old_password, req.user.password);

                if (!Match) {
                    res
                        .status(400)
                        .send({ status: false, message: "old password not correct" });
                } else {
                    if (new_password !== password_confirmation) {
                        res
                            .status(400)
                            .send({
                                status: false,
                                message: " new and confirm Password doesn't match",
                            });
                    } else {
                        const salt = await bcrypt.genSalt(12);
                        const newHashPassword = await bcrypt.hash(new_password, salt);

                        await UserModel.findByIdAndUpdate(req.user._id, {
                            $set: { password: newHashPassword },
                        });
                        res
                            .status(200)
                            .send({ status: true, message: "Password changed succesfully" });
                    }
                }
            } else {
                res
                    .status(400)
                    .send({ status: false, message: "All Fields are Required" });
            }
        } catch (error) {
            res
                .status(500)
                .send({ status: false, message: "cannot change your password" });
        }
    };

    // get user data

    static userData = async(req,res)=>{

            try {

                const data=await UserModel.findById(req.user._id).select('-password')


                if(data!=null){
                    res.status(200).send({status: true, message: "Sucessfully fetched",data:data});

                }else{
                    res.status(400).send({status: false, message: "no data found"});
                }

               
                
            } catch (error) {

                res.status(400).send({status: false, message: "no data available",});
                
            }
        



    }

    static sendUserPasswordResetEmail = async (req, res) => {
        const { email } = req.body
        if (email) {
          const user = await UserModel.findOne({ email: email })
          if (user) {
            const secret = user._id + process.env.JWT_SECRET_KEY
            const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' })
            const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
            console.log(link)
            // // Send Email
              let info = await transporter.sendMail({
               from: process.env.EMAIL_FROM,
               to: user.email,
              subject: "Covid tracker - Password Reset Link",
               html: `<a>hope u all r doing well.use mask follow covid guidelines and keep yourself and your family secure</a></br></br></br><a href=${link}>Click Here</a> to Reset Your Password`
             })
 

            res.send({ "status": "success", "message": "Password Reset Email Sent... Please Check Your Email" })
          } else {
            res.send({ "status": "failed", "message": "Email doesn't exists" })
          }
        } else {
          res.send({ "status": "failed", "message": "Email Field is Required" })
        }
      }
    


      static userPasswordReset = async (req, res) => {
        const { password, password_confirmation } = req.body
        const { id, token } = req.params
        const user = await UserModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY

        res.re
        // try {
        //   jwt.verify(token, new_secret)
        //   if (password && password_confirmation) {
        //     if (password !== password_confirmation) {
        //       res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
        //     } else {
        //       const salt = await bcrypt.genSalt(10)
        //       const newHashPassword = await bcrypt.hash(password, salt)
        //       await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } })
        //       res.send({ "status": "success", "message": "Password Reset Successfully" })
        //     }
        //   } else {
        //     res.send({ "status": "failed", "message": "All Fields are Required" })
        //   }
        // } catch (error) {
        //   console.log(error)
        //   res.send({ "status": "failed", "message": "Invalid Token" })
        // }
      }





}

export default UserController;