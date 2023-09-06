const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PrivateSchema = new Schema({
  data: {
    type: String,
    required: true
  },
});

const Private = mongoose.model('Private', PrivateSchema);
module.exports = Private;