const express = require('express');
const config = require("config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const auth = require('../../middleware/auth');
const Users = require('../../models/Users');

const {
  check,
  validationResult,
} = require("express-validator");


// router.get('/', auth, async (req, res) => {
//   try{
//     const user = await Users.findById(req.user.id).select('-password');
//     res.json(user)
//   }catch(err){
//     res.status(500).send('Server Error')
//   }
// })

// Login User
router.post('/',
  [
    check("email", "Please include valid Email").isEmail(),
    check(
      "password",
      "Password is required"
    ).exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await Users.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      const isMatched = await bcrypt.compare(password, user.password);
      if(!isMatched){
        return res
        .status(400)
        .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);


module.exports = router;