const express = require('express')
const router = express.Router();
const { Spot, User, Booking } = require('../../db/models');
const {restoreUser} = require('../../utils/auth');

module.exports = router;