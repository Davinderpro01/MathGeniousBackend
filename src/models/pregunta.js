const mongoose = require('mongoose');

const preguntaSchema = new mongoose.Schema({
  enunciado: String,
  opciones: [String],
  respuestaCorrecta: Number, // Índice de la opción correcta en el array de opciones
  nivel: String,
  Tema: String
});

const Pregunta = mongoose.model('Pregunta', preguntaSchema);

module.exports = Pregunta;  