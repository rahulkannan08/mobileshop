const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile_shop';
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // print extra hint for auth errors
    if (err.message && err.message.toLowerCase().includes('auth')) {
      console.error('Hint: check Atlas DB user, password (URL-encode special chars), and IP whitelist.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;