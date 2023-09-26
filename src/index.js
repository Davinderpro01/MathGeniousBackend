const express = require('express');
const cors = require('cors');
const conectarDB = require('./database');
const routes = require('./routes');
const { CreateRoles } = require('./libs/initialSetup'); 

const app = express();
CreateRoles();

app.use(express.json());
app.use(cors());

conectarDB();

app.use('/', routes);

app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
}).keepAliveTimeout = 65000;
