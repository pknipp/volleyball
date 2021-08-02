const asyncHandler = require('express-async-handler');
const { check, validationResult } = require('express-validator');
const Sequelize = require('sequelize');
const router = require('express').Router();

const { User, Game, Reservation } = require('../../db/models');
const { authenticated, generateToken } = require('./security-utils');
const { uploadFile } = require('../../s3helper.js');
const checkAddress = require('./checkAddress');

// const BUCKET = 'volleyballbucket';

const email = check('email').isEmail().withMessage('Give a valid email address').normalizeEmail();
// const firstName = check('firstName').not().isEmpty().withMessage('Provide first name');
// const lastName = check('lastName').not().isEmpty().withMessage('Provide last name');
const password = check('password').not().isEmpty().withMessage('Provide a password');

router.post('', [email, password],
  asyncHandler(async (req, res, next) => {
    let [user, message, status] = [{}, '', 400];
    const errors = validationResult(req).errors;
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
        // confirm that Google Maps API can find a route between user's address & NYC
        let checked = await checkAddress(req.body.address);
        if (checked.success) {
          req.body.address = checked.address;
          user = (await User.build(req.body)).setPassword(req.body.password);
          const { jti, token } = generateToken(user);
          user.tokenId = jti;
          res.cookie("token", token);
          await user.save();
          user = user.toSafeObject();
          status = 201;
        } else {
          message = `There is something wrong with your address (${req.body.address}).`
        }
      }
    }
    res.status(status).json({user: {...user, message}});
  }));

router.put('', [authenticated, email, password],
  asyncHandler(async (req, res, next) => {
    let [user, message, status] = [req.user, '', 200];
    const errors = validationResult(req).errors;
    if (user.id === 1) {
      message = "You cannot edit our 'demo' user, whose details are needed in order to allow our site's visitors  to login easily.  Feel free to use the 'Signup' route to create a new user if you'd like to test out the   'Manage Account' route.";
      status = 400;
    } else if (errors.length) {
      message = errors[0].msg;
      status = 400;
    } else {
      let otherUser1 = await User.findOne({
        where: {
          [Sequelize.Op.and]: [
            { email: req.body.email },
            { [Sequelize.Op.not]: { id: user.id } }
          ]
        }
      });
      let otherUser2 = await User.findOne({
        where: {
          [Sequelize.Op.and]: [
            { nickName: req.body.nickName },
            { [Sequelize.Op.not]: { id: user.id } }
          ]
        }
      });
      if (otherUser1) {
        message = `That email (${req.body.email}) is taken.`;
        delete req.body.email;
      } else if (otherUser2) {
        message = `That nickname (${req.body.nickName}) is taken.`;
        delete req.body.nickName
      } else {
        // confirm that Google Maps API can find a route between user's address & NYC
        let checked = await checkAddress(req.body.address);
        if (checked.success) {
          req.body.address = checked.address;
        } else {
          message = `There is something wrong with your new home address (${req.body.address}).`
          delete req.body.address;
        }
      }
      Object.entries(req.body).filter(([key,]) => key !== 'password').forEach(([key, value]) => {
        user[key] = value;
      });
      user = user.setPassword(req.body.password);
      const { jti, token } = generateToken(user);
      user.tokenId = jti;
      res.cookie("token", token);
      await user.save();
    }
    res.status(status).json({ user: { ...user.toSafeObject(), message } });
  })
);

router.get('', asyncHandler(async (req, res, next) => {
  const users = await User.findAll();
  res.json({users});
}));

router.delete("", [authenticated], asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.id === 1) return res.json({ message: "You cannot delete my 'demo' user, because visitors to my site use that for testing purposes.  Create a new user via the 'Signup' route if you'd like to test out the deletion of a user." })

  try {
    await user.destroy();
    user.tokenId = null;
    res.clearCookie('token');
    res.json({});
  } catch (e) {
    res.status(400).send(e);
  }
}));

module.exports = router;
