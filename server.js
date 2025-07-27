const mongoose = require('mongoose');
const dotenv = require('dotenv');

// error handling for sync function
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message,err.stack);
  process.exit(1);
});
dotenv.config();
const app = require('./app');

const db= process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
mongoose
  .connect(db)
  .then(() => console.log('✅ MongoDB connected'));

  const port = process.env.PORT || 3000;
const server= app.listen(port, () => {
  console.log(`Server running on port ${port}`); });

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});