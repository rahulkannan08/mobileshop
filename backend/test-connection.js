require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

console.log('Testing URI (masked):', uri.replace(/:(.+)@/, ':*****@'));

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connected to Atlas at', mongoose.connection.host);
    return mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    if (err.message.toLowerCase().includes('auth')) {
      console.error('Hint: check Atlas DB user/password, URL-encode special chars, and IP whitelist.');
    }
    process.exit(1);
  });