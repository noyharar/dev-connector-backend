var express = require('express');
var router = express.Router();

// @route GET api/posts
// @desc
// @access Public
router.get('/', (req, res) => res.send('Posts route'));

module.exports = router;
