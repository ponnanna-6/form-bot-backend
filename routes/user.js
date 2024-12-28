const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../schemas/user.schema')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { authMiddleware } = require('../middlewares/auth')

//register user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if(!name || !email || !password){
            return res.status(400).json({ message: "All fields are required" });
        }

        const userWithEmail = await User.findOne({ email: email });
        if (userWithEmail) {
            return res.status(400).json({ message: "User with email already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        return res.status(200).json({ message: "User created successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred. Please try again later.", error: error});
    }
});

//login user
router.post('/login', async (req, res)=>{
    try {
        const {email, password} = req.body
        const user = await User.findOne({email: email})
        if(!user){
            return res.status(400).json({message: "Email or password incorrect"})
        }
        const compare = await bcrypt.compare(password, user.password)
        if(!compare){
            return res.status(400).json({message: "Email or password incorrect"})
        }
        const payload = {id: user._id}
        const token = jwt.sign(payload, process.env.JWT_TOKEN)

        return res.status(200).json({message: `Welcome ${user.name}`, token: token})
    } catch (err) {
        res.status(400).json(err);
    }
})

//Fetch user by id
router.get('/id/:id', authMiddleware, async (req, res) => {
    try {
        const {id} = req.params
        const users = await User.find({_id : id}).select('-password -__v');
        if(!users.length){
            return res.status(400).json({message:"User not found"});
        }
        res.status(200).json(users);
    } catch (err) {
        res.status(400).json(err);
    }
});

//update user data
router.put('/update', authMiddleware ,async (req, res) => {
    try {
        const id = req.user;
        const {name, email, password, newPassword} = req.body;

        const user = await User.findById(id);
        if(!user){
            return res.status(400).json({message: "User not found for id: "+ id});
        }
        if(newPassword.length) {
            const compare = await bcrypt.compare(password, user.password)
            if(!compare){
                return res.status(400).json({message: "Password incorrect"})
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.findByIdAndUpdate(id, {name, email, password: hashedPassword}, {new: false})
        } else {
            await User.findByIdAndUpdate(id, {name, email}, {new: false})
        }
        res.status(200).json({ message: "User updated successfully!"})
    } catch (error) {
        return res.status(500).json({ message: "An error occurred. Please try again later.", error: error});
    }
});

router.get('/all', authMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('email');
        if(!users.length){
            return res.status(400).json({message:"No user found"});
        }
        res.status(200).json(users);
    } catch (err) {
        res.status(400).json(err);
    }
})
module.exports = router