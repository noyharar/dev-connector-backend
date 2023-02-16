var express = require('express');
var router = express.Router();

// @route GET api/Profile
// @desc
// @access Public
router.get('/', (req, res) => res.send('Profile route'));

module.exports = router;
