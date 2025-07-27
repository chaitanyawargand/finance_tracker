const express= require('express');
const transcationController= require('./../controller/expensecontroller');
const authController= require('./../controller/authController');
const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);

router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.route('/transcation')
.post(transcationController.addTranscation)
.get(transcationController.getTranscation)

router.delete('/transcation/:id',transcationController.deleteTranscation)

module.exports = router;