const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require('../models/submission');

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
};

const publicUser = (user) => ({
    id: user._id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    emailId: user.emailId,
    role: user.role,
    problemSolved: user.problemSolved,
});

const issueSession = (user, res, remember = false) => {
    const expiresIn = remember ? '30d' : '1d';
    const token = jwt.sign(
        { _id: user._id, emailId: user.emailId, role: user.role },
        process.env.JWT_KEY,
        { expiresIn }
    );
    const options = remember
        ? { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 }
        : COOKIE_OPTIONS;
    res.cookie('token', token, options);
};

const register = async (req, res) => {
    try {
        validate(req.body);
        const username = req.body.username.trim().toLowerCase();
        const emailId = req.body.emailId.trim().toLowerCase();
        const existing = await User.findOne({ $or: [{ username }, { emailId }] });
        if (existing) return res.status(409).json({ error: 'That username or email is already registered.' });

        const user = await User.create({
            username,
            emailId,
            password: await bcrypt.hash(req.body.password, 10),
            role: 'user',
        });
        issueSession(user, res);
        return res.status(201).json({ user: publicUser(user) });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ error: 'That username or email is already registered.' });
        return res.status(400).json({ error: error.message || 'Could not create account.' });
    }
};

const login = async (req, res) => {
    try {
        const emailId = req.body?.emailId?.trim().toLowerCase();
        const password = req.body?.password;
        if (!emailId || typeof password !== 'string') {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ emailId });
        const passwordMatches = user && await bcrypt.compare(password, user.password);
        if (!passwordMatches) return res.status(401).json({ error: 'Invalid email or password.' });

        issueSession(user, res, req.body.remember === true);
        return res.status(200).json({ user: publicUser(user) });
    } catch (error) {
        return res.status(500).json({ error: 'Could not sign in. Please try again.' });
    }
};

const logout = async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (token) {
            const payload = jwt.verify(token, process.env.JWT_KEY);
            const remainingSeconds = Math.max(1, payload.exp - Math.floor(Date.now() / 1000));
            await redisClient.set(`token:${token}`, 'Blocked', { EX: remainingSeconds });
        }
        res.clearCookie('token', COOKIE_OPTIONS);
        return res.status(200).json({ message: 'Signed out successfully.' });
    } catch (error) {
        res.clearCookie('token', COOKIE_OPTIONS);
        return res.status(200).json({ message: 'Signed out successfully.' });
    }
};

const adminRegister = async (req, res) => {
    try {
        validate(req.body, { requireUsername: false });
        const emailId = req.body.emailId.trim().toLowerCase();
        const existing = await User.findOne({ emailId });
        if (existing) return res.status(409).json({ error: 'That email is already registered.' });

        const user = await User.create({
            firstName: req.body.firstName.trim(),
            lastName: req.body.lastName.trim(),
            emailId,
            password: await bcrypt.hash(req.body.password, 10),
            role: 'admin',
        });
        issueSession(user, res);
        return res.status(201).json({ user: publicUser(user) });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ error: 'That email is already registered.' });
        return res.status(400).json({ error: error.message || 'Could not create administrator.' });
    }
};

const deleteProfile = async (req, res) => {
    try {
        const userId = req.result._id;
        await User.findByIdAndDelete(userId);
        await Submission.deleteMany({ userId });
        res.clearCookie('token', COOKIE_OPTIONS);
        return res.status(200).json({ message: 'Account deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Could not delete account.' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.result._id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found.' });
        return res.status(200).json({ user: publicUser(user) });
    } catch (error) {
        return res.status(500).json({ error: 'Could not load profile.' });
    }
};

module.exports = { register, login, logout, adminRegister, getProfile, deleteProfile };
