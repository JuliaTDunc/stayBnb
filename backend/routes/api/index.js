const router = require('express').Router();
const { restoreUser } = require("../../utils/auth.js");
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const { setTokenCookie } = require('../../utils/auth.js');
const { User } = require('../../db/models');
const spotRouter = require('./spots.js');
const bookingRouter = require('./bookings.js');
router.use(restoreUser);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);
router.use('/spots', spotRouter);
router.use('/bookings', bookingRouter)

router.post('/test', (req, res) => {
    res.json({ requestBody: req.body });
});

module.exports = router;
