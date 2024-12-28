const express = require('express')

const router = express.Router()

router.get('/', (req, res)=>{
    res.send("HELLO FROM Form BOT BACKEND")
})

module.exports = router