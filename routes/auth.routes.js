const { Router } = require('express');
const router = new Router();
const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const User = require('../models/user');

// GET route ==> to display the signup form to users
router.get('/signup', (req, res) => res.render('auth/signup'));

// POST route ==> to process form data
// router.post('/signup', (req, res, next) => {
//   console.log('The form data: ', req.body);
//   const { username, password } = req.body;

//   bcryptjs
//     .genSalt(saltRounds)
//     .then((salt) => bcryptjs.hash(password, salt))
//     .then((hashedPassword) => {
//       //   console.log(`Password hash: ${hashedPassword}`);
//       return User.create({
//         username,
//         passwordHash: hashedPassword
//       });
//     })
//     .then((userFromDB) => {
//       console.log('Newly created user is: ', userFromDB);
//       res.redirect('/userprofile');
//     })
//     .catch((error) => next(error));
// });

// ### Sign-up POST route ###
router.post('/signup', (req, res, next) => {
  console.log('SESSION =====> ', req.session);
  console.log('The form data: ', req.body);
  const { username, password } = req.body;
  let user;
  User.findOne({ username })
    .then((document) => {
      user = document;
      if (user) {
        throw new Error('USERNAME_ALREADY_REGISTERED');
      } else {
        return bcryptjs.hash(password, 10);
      }
    })
    .then((passwordHashAndSalt) => {
      return User.create({
        username,
        passwordHash: passwordHashAndSalt
      });
    })
    .then((entry) => {
      console.log('New user created', entry);
      req.session.currentUser = entry;
      res.redirect('/userprofile');
    })
    .catch((error) => {
      next(error);
    });
});

// GET route for user profile page
// router.get('/userprofile', (req, res) =>
//   res.render('users/userprofile', { userInSession: req.session.currentUser })
// );
router.get('/userprofile', (req, res) => {
  res.render('users/userprofile', { userInSession: req.session.currentUser });
});

// GET route ==> to display the login form to users
router.get('/login', (req, res) => res.render('auth/login'));

// POST login route ==> to process form data
router.post('/login', (req, res, next) => {
  console.log('SESSION =====> ', req.session);
  const { username, password } = req.body;

  if (username === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'Please enter both username and password to login.'
    });
    return;
  }

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        res.render('auth/login', {
          errorMessage: 'Username is not registered. Try with other username.'
        });
        return;
      } else if (bcryptjs.compareSync(password, user.passwordHash)) {
        req.session.currentUser = user;
        console.log(req.session.currentUser);
        res.redirect('/userprofile');
      } else {
        res.render('auth/login', { errorMessage: 'Incorrect password.' });
      }
    })
    .catch((error) => next(error));
});

module.exports = router;
