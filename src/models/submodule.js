const mongoose = require('mongoose');

const submoduleSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
});

const Submodule = mongoose.model('Submodule', submoduleSchema);

module.exports = Submodule;