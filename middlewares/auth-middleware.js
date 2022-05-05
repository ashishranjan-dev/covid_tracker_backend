import jwt from 'jsonwebtoken'
import UserModel from '../models/User.js'


var checkUserAuth = async(req, res, next) => {
    let token
    const { authorization } = req.headers


    if (authorization && authorization.startsWith('Bearer')) {
        try {
            // Get Token from header
            token = authorization.split(' ')[1]

            // Verify Token
            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY)

            // Get User from Token       we will not get password here 
            req.user = await UserModel.findById(userID)

            next()
        } catch (error) {
            console.log(error)
            res.status(401).send({ "status": false, "message": "Unauthorized User" })
        }
    }
    if (!token) {
        res.status(401).send({ "status": false, "message": "Unauthorized User, No Token" })
    }
}

export default checkUserAuth