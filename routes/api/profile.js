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

// Get All Profiles
router.get("/", async (req, res) => {
  try{
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])
    res.json(profiles)
  } catch (err) {
    console.log(err.message)
    return res.status(500).send('Server Error')
  }

})

// Get profile by id
router.get("/user/:user_id", async (req, res) => {
  try{
    const profiles = await Profile.findOne({_id: req.params.user_id}).populate('user', ['name', 'avatar'])
    if (!profiles){
      return res.status(400).json({'msg': 'Profile not found'})
    }
    res.json(profiles)
  } catch (err) {
    console.log(err.message)
    if(err.kind == 'ObjectId') return res.status(400).json({'msg': 'Profile not found'})
    return res.status(500).send('Server Error')
  }

})

// Delete Profile, User and Post
router.delete("/", auth, async (req, res) => {
  try{
    await Profile.findOneAndRemove({user: req.user.id})
    await User.findOneAndRemove({_id: req.user.id})
    return res.json({'msg': 'User removed'})
  } catch(err){
    return res.status(500).send('Internal Server Error')
  }
})

// Add Profile Experience
router.put("/", [auth, [
  check('title', 'Title is required').not().isEmpty(),
  check('company', 'Company is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({
      errors: errors.array()
    })
  }
  const {title, company, from, to, location, current, description} = req.body

  const newExp = {
    title, company, from, to, location, current, description
  }
  try {
    const profile = await Profile.findOne({user: req.user.id})
    profile.experience.unshift(newExp)
    await profile.save()
    res.json(profile)
  } catch (error) {
    console.log(error)
    res.status(500).send('Server Error')
  }
})

// Remove experience
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({user: req.user.id})
    // get remove index
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)
    profile.experience.splice(removeIndex, 1)
    await profile.save();
    res.json(profile)
  } catch (error) {
    console.log(error)
    res.status(500).send('Server Error')
  }
})
module.exports = router;