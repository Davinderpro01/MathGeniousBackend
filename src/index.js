const express = require('express');
const cors = require('cors');
const conectarDB = require('./database');
const routes = require('./routes');
const { CreateRoles } = require('./libs/initialSetup'); 
const corsOptions = {
  origin: 'http://localhost:4200', 
};
const app = express();
CreateRoles();

app.use(express.json());
app.use(cors(corsOptions));

conectarDB();

app.use('/', routes);

app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
}).keepAliveTimeout = 65000;
