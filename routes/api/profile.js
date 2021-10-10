const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
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

router.post('/', [auth, [
  check("status", "Status is required").not().isEmpty(),
  check("skills", "Skills are required").not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({'msg': errors.array()});
  }
  // Get all the data from body
  const {company, website, location, bio, status, githubusername, skills, youtube, facebook, 
  instagram, twitter, linkedin
  } = req.body;

  const profileFields = {};

  profileFields.user = req.user.id;
  if (company) profileFields.company = company;
  if (website) profileFields.website = website;
  if (location) profileFields.location = location;
  if (bio) profileFields.bio = bio;
  if (status) profileFields.status = status;
  if (githubusername) profileFields.githubusername = githubusername;
  if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }
  profileFields.social = {};
  if (youtube) profileFields.social.youtube = youtube;
  if (twitter) profileFields.social.twitter = twitter;
  if (instagram) profileFields.social.instagram = instagram;
  if (linkedin) profileFields.social.linkedin = linkedin;

  try{
    let profile = await Profile.findOne({user: req.user.id});
    if (profile){
      // Update profile
      profile = await Profile.findOneAndUpdate({ user: req.user.id}, {$set: profileFields}, {new: true});
      return res.json(profile);
    }
    // Create Profile
    profile = new Profile(profileFields)
    await profile.save();
    return res.json(profile)

  }catch (err){
    console.log(err.message)
    return res.status(500).send('Server Error')
  }

})

module.exports = router;