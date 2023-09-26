const mongoose = require('mongoose');
require("dotenv").config();


async function conectarDB() {

  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conexión exitosa a la base de datos');
  } catch (error) {
    console.error('Error al conectar a la base de datos', error);
  }
}

module.exports = conectarDB;
