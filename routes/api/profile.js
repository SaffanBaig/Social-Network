const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');

// get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({'msg': 'No profile found'})
    }
    return res.json(profile)
  }
  catch (err) {
    console.log(err)
    return res.status(500).send('Server Error')
  }
})

module.exports = router;