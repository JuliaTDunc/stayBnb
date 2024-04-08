const router = require('express').Router();

const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const spotsRouter = require('./spots.js');
const bookingsRouter = require('./bookings.js');
const reviewsRouter = require('./reviews.js');
const spotImageRouter = require('./')



const { setTokenCookie } = require('../../utils/auth.js');
const { User } = require('../../db/models');
router.get('/set-token-cookie', async (_req, res) => {
    const user = await User.findOne({
        where: {
            username: 'Demo-lition'
        }
    });
    setTokenCookie(res, user);
    return res.json({ user: user });
});
const { restoreUser } = require("../../utils/auth.js");
router.use((req, res, next)=>{
    restoreUser(req,res, () => {
        if(req.user){
            next();
        } else{
            req.user = null;
            next();
        }
    })
});
router.get(
    '/restore-user',
    (req, res) => {
        return res.json(req.user);
    }
);
const { requireAuth } = require('../../utils/auth.js');
router.get(
    '/require-auth',
    requireAuth,
    (req, res) => {
        return res.json(req.user);
    }
);

router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/spots', spotsRouter);
router.use('/bookings', bookingsRouter);
router.use('/reviews', reviewsRouter);


router.post('/test', function (req, res) {
    res.json({ requestBody: req.body });
});

  
module.exports = router;
