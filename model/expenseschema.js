const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: String,
  date: {
  type: Date,
  required: true,
  set: function (d) {
    const date = new Date(d);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }
}
}, {
  timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;