const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../model/userschema');
const catchAsync = require('./../utils/catchAsynch');
const AppError = require('./../utils/appError');

const signToken=id=>{
    return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}
const createSendToken = (user, statusCode, res) => {
const token = signToken(user._id);
const cookieOptions = {
expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true };
  if(process.env.NODE_ENV==='production')cookieOptions.secure=true;
  res.cookie('jwt',token,cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
    user
    }
  });
};
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  createSendToken(user, 200, res);
});
exports.signUp=catchAsync(async(req,res,next)=>{
  const newUser= await User.create({
    name:req.body.name,
    email:req.body.email,
    password: req.body.password,
    role:req.body.role || 'user',
    balance:5000,
    passwordConfirm: req.body.passwordConfirm
  })
  createSendToken(newUser,200,res);
})

exports.protect=catchAsync(async(req,res,next)=>{
let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token=req.headers.authorization.split(' ')[1];
}
if(!token) return next(new AppError('You are not logged in! Please log in to get access.', 401));
const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
const currentUser= await User.findById(decoded.id);
  if(!currentUser){
    return next(new AppError('The user belonging to this token does no longer exist.',401));
}
  req.user = currentUser;
  next();
})
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next( new AppError('You do not have permission to perform this action', 403));
    }
    next();
}};

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});
