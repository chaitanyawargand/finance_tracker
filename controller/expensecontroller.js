const AppError = require('../utils/appError');
const expense= require('./../model/expenseschema');
const catchAsync= require('./../utils/catchAsynch')

exports.addTranscation= catchAsync(async(req,res,next)=>{
    const trans= await expense.create({
        user:req.user.id,
        amount:req.body.amount,
        category:req.body.category,
        description:req.body.description,
        date:req.body.date,
    })
    res.status(200).json({
        status:'success',
        expense:trans,
    })
})
exports.getTranscation= catchAsync(async(req,res,next)=>{
    let {year,month,category}= req.query;
    const filter={user:req.user.id};
    month=month?parseInt(month) : null;
    year=year ? parseInt(year) : null;
    if(month&&!year) {
    year=new Date().getFullYear();
  }
   if(month && year){
  const startDate=new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const endDate=new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    filter.date={ $gte: startDate, $lte: endDate };
  } else if(!month && year){
  const startDate=new Date(Date.UTC(year,0, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
    filter.date={ $gte: startDate, $lte: endDate };
  }
  if(category) filter.category=category;
    const trans=await expense.find(filter);
   if(!trans) return next(new AppError('NO expense found',400));
   res.status(200).json({
    status:'success',
    result:trans.length,
    expenses:trans,
   })
})
exports.deleteTranscation=catchAsync(async(req,res,next)=>{
   const userId=req.user.id;
  const trans=await expense.findById(req.params.id);
  if (!trans) {
    return next(new AppError('No expense found with that ID', 404));
  }
  if (trans.user.toString()!==userId) {
    return next(new AppError('You are not authorized to delete this expense', 403));
  }
    await expense.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
})
