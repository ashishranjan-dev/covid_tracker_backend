import express from "express";

const router = express.Router();

import UserController from "../controllers/userController.js";
import checkUserAuth from "../middlewares/auth-middleware.js";


router.use('/changepassword', checkUserAuth)
router.use('/getuserinfo', checkUserAuth)


// public routes

router.post('/register', UserController.userRegistration);
router.post('/login', UserController.userLogin);
router.post('/send-reset-password-email', UserController.sendUserPasswordResetEmail)
router.post('/reset/:id/:token', UserController.userPasswordReset)


// protected routes

router.post('/changepassword', UserController.changeUserPassword)
router.get('/getuserinfo', UserController.userData)




export default router