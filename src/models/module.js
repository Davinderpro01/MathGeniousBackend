const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  imagen: { type: String, required: true },
  submodulos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submodule' }]
});

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
