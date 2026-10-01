const redisClient = require("../config/redis");
const User = require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

const register = async(req,res)=>{
    try{
        //validate the data
        validate(req.body);
        const {firstName, emailId, password}=req.body;
        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'user';

        const user = await User.create(req.body);
        const token = jwt.sign({_id:user._id, emailId:emailId, role:'user'},process.env.JWT_KEY,{expiresIn: 60*60})
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(201).send("User Registered Sucessfully");
    }
    catch(err){
        res.status(401).send("Error: "+err);
    }
} 

const login = async(req,res)=>{
    try{
        const {emailId, password} = req.body;

        if(!emailid)
            throw new Error("Invalid Credentials");

        if(!paasword)
            throw new Error("Invalid Credetials");

        const user = User.findOne({emailId});

        const match = bcrypt.compare(password,user.paasword);

        if(!match)
            throw new Error("Invalid Credentials");

        const token = jwt.sign({_id:user._id, emailId:emailId, role:'user'},process.env.JWT_KEY,{expiresIn: 60*60})
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(200).send("Logged in Sucessfully");
    }
    catch(err){
        res.status(401).send("Error: "+err);
    }
}

const logout = async(req,res)=>{
    try{
        const {token} = req.cookies;

        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);

        res.cookie("token",null,{expires: new Date(Date.now())});
        res.send("Logged Out Successfully");
    }
    catch(err){
        res.status(401).send("Error: "+err);
    }
}

const adminRegister = async(req,res)=>{
   try{
        //validate the data
        
        validate(req.body);
        const {firstName, emailId, password}=req.body;
        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'admin';

        const user = await User.create(req.body);
        const token = jwt.sign({_id:user._id, emailId:emailId, role:'admin'},process.env.JWT_KEY,{expiresIn: 60*60})
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(201).send("User Registered Sucessfully");
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}

module.exports = {register, login, logout,adminRegister}
