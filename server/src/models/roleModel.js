const mongoose = require('mongoose')
const Schema = mongoose.Schema

const roleSchema = new Schema(
    {
        name: String,
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Role = mongoose.model('Role', roleSchema);

module.exports = { Role}
