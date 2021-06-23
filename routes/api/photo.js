const asyncHandler = require('express-async-handler');
const { check, validationResult } = require('express-validator');
const Sequelize = require('sequelize');
const router = require('express').Router();
const multer = require('multer');
const { create } = require("../../db/user-repository");
const { User, Game, Reservation } = require('../../db/models');
const { authenticated, generateToken } = require('./security-utils');
const { uploadFile } = require('../../s3helper.js');
const uuid = require('uuid');
const { S3 } = require('aws-sdk');

const BUCKET = 'volleyballbucket';

const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '')
    }
})

const email = check('email').isEmail().withMessage('Give a valid email address').normalizeEmail();
// const firstName = check('firstName').not().isEmpty().withMessage('Provide first name');
// const lastName = check('lastName').not().isEmpty().withMessage('Provide last name');
const password = check('password').not().isEmpty().withMessage('Provide a password');
const upload = multer({ storage }).single('image');

router.post('', upload, email, password,
    asyncHandler(async (req, res, next) => {

        let myImage = req.file.originalname.split(".");
        const fileType = myImage[myImage.length - 1];

        const params = {
            Bucket: BUCKET,
            Key: `${uuid()}.${fileType}`,
            Body: req.file.buffer,
        }

        let message = "";
        const errors = validationResult(req).errors;
        let response = { user: {} };
        if (errors.length) {
            message = errors[0].msg;
        } else {
            let otherUser1 = await User.findOne({ where: { email: req.body.email } });
            let otherUser2 = await User.findOne({ where: { nickName: req.body.nickName } });
            if (otherUser1) {
                message = "That email is taken.";
            } else if (otherUser2) {
                message = "That nickname is taken.";
            } else {
                S3.uploadFile(params, (error, data) => {
                    if (error) {
                        req.status(500).send(error)
                    }
                })
                req.body.photoUrl = params.Key;
                console.log(params.Key)
                const user = await create(req.body);
                const { jti, token } = generateToken(user);
                user.tokenId = jti;
                res.cookie("token", token);
                response.user = { ...response.user, ...user.toSafeObject() }
                //await user.save();
            }
        }
        response.user.message = message;
        res.json(response);
    }));

// router.put('', [authenticated], email, password,
//     asyncHandler(async (req, res, next) => {
//         let user = req.user;
//         let message;
//         const errors = validationResult(req).errors;
//         if (user.id === 1) {
//             message = "You cannot edit our 'demo' user, whose details are needed in order to allow our site's visitors  to login easily.  Feel free to use the 'Signup' route to create a new user if you'd like to test out the   'Manage Account' route.";
//         } else if (errors.length) {
//             message = errors[0].msg;
//         } else {
//             let otherUser1 = await User.findOne({
//                 where: {
//                     [Sequelize.Op.and]: [
//                         { email: req.body.email },
//                         { [Sequelize.Op.not]: { id: user.id } }
//                     ]
//                 }
//             });
//             let otherUser2 = await User.findOne({
//                 where: {
//                     [Sequelize.Op.and]: [
//                         { nickName: req.body.nickName },
//                         { [Sequelize.Op.not]: { id: user.id } }
//                     ]
//                 }
//             });
//             if (otherUser1) {
//                 message = "That email is taken.";
//             } else if (otherUser2) {
//                 message = "That nickname is taken.";
//             } else {
//                 Object.entries(req.body).filter(([key,]) => key !== 'password').forEach(([key, value]) => {
//                     user[key] = value;
//                 });
//                 user = user.setPassword(req.body.password);
//                 const { jti, token } = generateToken(user);
//                 user.tokenId = jti;
//                 res.cookie("token", token);
//                 await user.save();
//                 message = "Success!";
//             }
//         }
//         res.json({ user: { ...user.toSafeObject(), message } });
//     })
// );

// router.get('', asyncHandler(async (req, res, next) => {
//     const users = await User.findAll();
//     res.json(users);
// }));

// router.delete("", [authenticated], asyncHandler(async (req, res) => {
//     const user = req.user;
//     if (user.id === 1) return res.json({ message: "You cannot delete my 'demo' user, because visitors to my site use that for testing purposes.  Create a new user via the 'Signup' route if you'd like to test out the deletion of a user." })

//     try {
//         await user.destroy();
//         user.tokenId = null;
//         res.clearCookie('token');
//         res.json({});
//     } catch (e) {
//         res.status(400).send(e);
//     }
// }));

module.exports = router;