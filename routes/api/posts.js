var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator')
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

// @route POST api/posts
// @desc Create a post
// @access Private
router.post('/',[auth,
        check('text', 'Text is required').not().isEmpty()
    ],
    async (req, res) =>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        try {
            //in order to get avatar in addition
            const user = await User.findById(req.user.id).select('-password');
            const newPost =new Post ({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            });

            let post = await newPost.save();
            res.json(post);
        }catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
});


// @route GET api/posts
// @desc Get all posts
// @access Private
router.get('/', auth, async (req, res) =>{
    try {
        //get all sorted posts fron the newest (-1) to oldest
        const posts = await Post.find().sort({date: -1});
        res.json(posts);
    }catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route GET api/posts/:id
// @desc Get post by id
// @access Private
router.get('/:id', auth, async (req, res) =>{
    try {
        //get all sorted posts fron the newest (-1) to oldest
        const post = await Post.findById(req.params.id);

        res.json(post);
    }catch (err) {
        console.error(err.message);
        if(err.kind ==='ObjectId'){
            return res.status(400).json({msg : 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route DELETE api/posts/:id
// @desc Delete a post
// @access Private
router.delete('/:id',auth,
    async (req, res) =>{
        try {
            const post = await Post.findById(req.params.id);
            //Check user logged in delete his post
            if(post.user.toString() !== req.user.id){
                return res.status(400).json({msg : 'User not authorized'});
            }
            await post.remove();
            res.json({msg: 'Post removed'});
        }catch (err) {
            console.error(err.message);
            if(err.kind ==='ObjectId'){
                return res.status(400).json({msg : 'Post not found'});
            }
            res.status(500).send('Server Error');
        }
    });

// @route PUT api/posts/like/:id
// @desc Like a post
// @access Private
router.put('/like/:id', auth, async (req, res) =>{
    try {
        //get all sorted posts fron the newest (-1) to oldest
        const post = await Post.findById(req.params.id);
        //check if the post already liked by curr user
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({msg : 'Post already liked'});
        }
        //unshift - put on begging, user logged in id
        post.likes.unshift({user: req.user.id});
        post.save();
        res.json(post.likes);
    }catch (err) {
        console.error(err.message);
        if(err.kind ==='ObjectId'){
            return res.status(400).json({msg : 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route PUT api/posts/unlike/:id
// @desc Like a post
// @access Private
router.put('/unlike/:id', auth, async (req, res) =>{
    try {
        //get all sorted posts fron the newest (-1) to oldest
        const post = await Post.findById(req.params.id);
        //check if the post already liked by curr user
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({msg : 'Post not yet liked'});
        }
        post.likes = post.likes.filter(x => x.user.toString() !== req.user.id);
        post.save();
        res.json(post.likes);
    }catch (err) {
        console.error(err.message);
        if(err.kind ==='ObjectId'){
            return res.status(400).json({msg : 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});



// @route POST api/posts/comment/:id
// @desc Comment on a post
// @access Private
router.post('/comment/:id', [
    auth,
        check('text', 'Text is required').not().isEmpty()
    ],
    async (req, res) =>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        try {
            const user = await User.findById(req.user.id).select('-password');
            const post  = await Post.findById(req.params.id);
            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };

            post.comments.unshift(newComment);
            post.save();
            res.json(post.comments);
        }catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
});


// @route DELETE api/posts/comment/:id
// @desc Delete on a post
// @access Private
router.delete('/comment/:id', auth,
    async (req, res) =>{
        try {
            const post  = await Post.findById(req.params.id);
            //Check user logged in delete his post
            if(post.user.toString() !== req.user.id){
                return res.status(400).json({msg : 'User not authorized'});
            }
            var length = post.comments.length;
            post.comments = post.comments.filter(x => x.user.toString() !== req.user.id);
            if(length === post.comments.length){
                return res.status(400).json({msg : 'Comment not found'});
            }

            post.save();
            res.json(post.comments);
        }catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

module.exports = router;
