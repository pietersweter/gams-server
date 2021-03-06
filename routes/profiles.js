const express = require('express');
const debug = require('debug')('profilesRouter');
const profiles = require('../services/profiles');
const generateToken = require('../helpers/generateToken');
const getDefaultAvatars = require('../helpers/getDefaultAvatars');
const authenticate = require('../middleware/authenticate');

const { DEBUG } = process.env;
debug.enabled = DEBUG;

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  const {
    id, username, email, avatarURL,
  } = req.user;
  res.json({
    id, username, email, avatarURL,
  });
});

router.get('/avatars', async (req, res) => {
  res.json(getDefaultAvatars());
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const profile = await profiles.login({ email, password }).catch(() => {
    res.status(401).json({ message: 'Wrong credentials' });
  });
  if (profile) {
    const token = generateToken(profile);
    res.json({ token, username: profile.name, userEmail: profile.email });
  }
});


router.post('/', async (req, res) => {
  try {
    const profile = await profiles.createProfile(req.body);
    const token = generateToken(profile);
    res.status(201).json({ token, username: profile.username, email: profile.email });
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
});

module.exports = router;
