const jwt = require('jsonwebtoken')
const config = require("config");

module.exports = function(req, res, next)  {
    const token = req.header('x-auth-token');

    // Check if no token
    if(!token){
        return res.status(401).json({msg: 'No token, authorization denied'});
    }

    // Verify token
    try{
        console.log(token)
        console.log(config.get('jwtSecret'))
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        console.log(decoded)
        req.user = decoded.user;
        next();
    }catch(err){
        return res.status(401).json({msg: 'Token is not valid'})
    }
}