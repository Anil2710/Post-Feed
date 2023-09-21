const express = require('express');

const Post = require('../models/post');

const multer  = require('multer')

const router = express.Router();

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error('Invalid mime type');
        isValid ? error = null : '';
        cb(null, "backend/images");
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + ext);
    }
});

router.post('', multer({storage: storage}).single('image'), (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename
    });
   post.save().then(createdPost => {
       res.status(201).json({
           message: 'Post added successfully',
           postId: {
            ...createdPost,
            id: createdPost._id
           }
       });
    });
})

router.get('', (req, res, next) => {
    Post.findOne().then(documents => {
        // console.log(documents);
        res.status(200).json({
            message: 'posts fetched successfully',
            posts: documents
        });
    });
})

router.delete("/:id", (req, res, next) => {
    Post.deleteOne({_id: req.params.id}).then(result => {
        console.log(result);
        res.status(200).json({message: 'Post deleted!'});
    });
});

router.put("/:id", multer({storage: storage}).single('image'), (req, res, next) => {
    // console.log(req.file);
    let imagePath = req.body.imagePath;
    if(req.file) {
        const url = req.protocol + '://' + req.get('host');
        imagePath = url + '/images/' + req.file.filename;
    }
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content, 
        imagePath: imagePath
    });
    console.log(post);
    Post.updateOne({_id: req.params.id}, post).then(result => {
        console.log(result);
        res.status(200).json({message:'Update successful'});
    })
})

module.exports = router;