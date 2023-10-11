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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
}).keepAliveTimeout = 65000;