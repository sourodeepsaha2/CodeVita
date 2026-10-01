const express = require('express')

const authRouter = express.Router();
const {register,login,logout,adminRegister} = require('../controllers/userAuthent');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');


authRouter.post('/register', register); //Register
authRouter.post('/login', login); //login
authRouter.post('logout', userMiddleware, logout); //logout
authRouter.post('/admin/register',adminMiddleware, adminRegister);
authRouter.get('/getProfile', getProfile); //GetProfile

module.exports = authRouter;