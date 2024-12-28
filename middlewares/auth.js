const jwt = require('jsonwebtoken')

const authMiddleware = ((req, res, next) => {
    const token = req.headers.authorization
    try {
        if(!token){
            return res.status(400).json({message: "User not logged in"})
        }
        const decoded = jwt.verify(token, process.env.JWT_TOKEN)
        req.user = decoded.id
        next()
    } catch (error) {
        return res.status(400).json({message: "User not logged in"})
    }
})

module.exports = {authMiddleware}