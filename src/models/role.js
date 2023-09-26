const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
    {
        name: String
    }, 
    {
        versionKey: false
    }
);

const Role = mongoose.model('Rol', roleSchema);

module.exports = Role;  