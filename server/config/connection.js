const mongoose = require('mongoose');

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost/schools-db',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

module.exports = mongoose.connection;
