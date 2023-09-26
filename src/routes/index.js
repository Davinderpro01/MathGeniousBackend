const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Pregunta = require('../models/pregunta');
const Statistics = require('../models/statistics');
const Role = require('../models/role');
const Module = require('../models/module');
const Submodule = require('../models/submodule');
const Video = require('../models/video');
const isAdmin = require("../middlewares/isAdmin");
const denyAccessToAdmin = require("../middlewares/denyAccessToAdmin");
require("dotenv").config();

const router = express.Router();


function validarToken(req, res, next) {
  // Obtener el token de la cabecera de autorización
  const token = req.headers.authorization;

  try {
    // Verificar si el token existe
    if (!token) {
      return res.status(401).json({ message: 'Acceso no autorizado' });
    }

    // Verificar y decodificar el token
    const decodedToken = jwt.verify(token, process.env.claveSecreta);

    // Agregar el usuario decodificado al objeto de solicitud para usarlo en las rutas protegidas
    req.usuario = decodedToken;

    // Asignar el userId al objeto req
    req.userId = decodedToken.userId;

    // Continuar con la siguiente función 
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Acceso no autorizado' });
  }
}


  


router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password, roles } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      nombre,
      email,
      password: hashedPassword,
    });

    if (roles){
      const foundRoles = await Role.find({name: {$in: roles}})
      newUser.roles = foundRoles.map(role => role._id)
    }else{
      const role = await Role.findOne({name: "user"})
      newUser.roles = [role._id];
    }

    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error en el registro de usuario', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.post('/ingreso', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales de inicio de sesión inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales de inicio de sesión inválidas' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.claveSecreta, { expiresIn: '3h' });


    res.json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error en el inicio de sesión', error);
    res.status(500).json({ message: 'Error en el servidor' });
  } 
});

router.get('/perfil', validarToken, async (req, res) => {
  try {
    const usuario = req.usuario;

    const user = await User.findOne({ email: usuario.email }).populate('roles').exec();
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Acceso autorizado a la ruta protegida', user });
  } catch (error) {
    console.error('Error al buscar el usuario en la base de datos', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


//enviar preguntas
router.post('/preguntas', async (req, res) => {
  try {
    const { enunciado, opciones, respuestaCorrecta, nivel, Tema } = req.body;

    const nuevaPregunta = new Pregunta({
      enunciado,
      opciones,
      respuestaCorrecta,
      nivel,
      Tema
    });

    await nuevaPregunta.save();

    res.status(201).json({ message: 'Pregunta creada exitosamente' });
  } catch (error) {
    console.error('Error al crear la pregunta', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener preguntas
router.get('/preguntas', async (req, res) => {
  try {
    const preguntas = await Pregunta.find();

    res.json(preguntas);
  } catch (error) {
    console.error('Error al obtener las preguntas', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener la pregunta según el ID proporcionado en la URL
router.get('/preguntas/:id', async (req, res) => {
  try {
    const pregunta = await Pregunta.findById(req.params.id); 

    if (!pregunta) {
      return res.status(404).json({ message: 'Pregunta no encontrada' });
    }

    res.json(pregunta);
  } catch (error) {
    console.error('Error al obtener la pregunta', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Editar pregunta
router.put('/preguntas/:id', async (req, res) => {
  try {
    const preguntaId = req.params.id;
    const { enunciado, opciones, respuestaCorrecta, nivel, Tema } = req.body;

    const pregunta = await Pregunta.findByIdAndUpdate(
      preguntaId,
      { enunciado, opciones, respuestaCorrecta, nivel, Tema },
      { new: true }
    );

    if (!pregunta) {
      return res.status(404).json({ message: 'Pregunta no encontrada' });
    }

    res.json({ message: 'Pregunta editada exitosamente', pregunta });
  } catch (error) {
    console.error('Error al editar la pregunta', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Eliminar pregunta
router.delete('/preguntas/:id', async (req, res) => {
  try {
    const preguntaId = req.params.id;

    const pregunta = await Pregunta.findByIdAndDelete(preguntaId);

    if (!pregunta) {
      return res.status(404).json({ message: 'Pregunta no encontrada' });
    }

    res.json({ message: 'Pregunta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la pregunta', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// Obtener estadísticas por usuario
router.get('/obtener-estadisticas/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const statistics = await Statistics.find({ userId }).exec();
    if (!statistics || statistics.length === 0) {
      return res.status(404).json({ message: 'Estadísticas no encontradas' });
    }

    res.json(statistics);
  } catch (error) {
    console.error('Error al obtener las estadísticas', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// Guardar estadísticas
router.post('/guardar-sesion-historial', async (req, res) => {
  try {
    const {
      userId,
      correctAnswers,
      incorrectAnswers,
      totalTimePractice,
      averageScore,
      sessionHistory,
      timeProgress,
      achievements,
      themeProgress,
    } = req.body;

    const newStatistics = new Statistics({
      userId,
      totalCorrectAnswers: correctAnswers,
      totalIncorrectAnswers: incorrectAnswers,
      totalTimePractice,
      averageScore,
      sessionHistory,
      timeProgress,
      achievements,
      themeProgress,
    });

    await newStatistics.save();

    res.status(201).json({ message: 'Estadísticas guardadas exitosamente' });
  } catch (error) {
    console.error('Error al guardar las estadísticas', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Actualizar estadísticas por usuario
router.put('/actualizar-estadisticas/:id', async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedStatistics = req.body;

    const statistics = await Statistics.findOneAndUpdate({ userId }, updatedStatistics, { new: true }).exec();
    if (!statistics) {
      return res.status(404).json({ message: 'Estadísticas no encontradas' });
    }

    res.json({ message: 'Estadísticas actualizadas exitosamente', statistics });
  } catch (error) {
    console.error('Error al actualizar las estadísticas', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// Eliminar estadísticas por usuario
router.delete('/eliminar-estadisticas/:id', async (req, res) => {
  try {
    const userId = req.params.userId;

    const deletedStatistics = await Statistics.findOneAndDelete({ userId }).exec();
    if (!deletedStatistics) {
      return res.status(404).json({ message: 'Estadísticas no encontradas' });
    }

    res.json({ message: 'Estadísticas eliminadas exitosamente' });
  } catch (error) {
    console.error('Error al eliminar las estadísticas', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// Crear un nuevo módulo
router.post('/api/modules', async (req, res) => {
  try {
    const { nombre, descripcion, imagen } = req.body;
    const newModule = new Module({ nombre, descripcion, imagen });
    const savedModule = await newModule.save();
    res.status(201).json(savedModule);
  } catch (error) {
    console.error(error); // Imprime el error en la consola
    res.status(500).json({ message: 'Error al crear el módulo.', error: error.message });
  }
});

// Obtener la lista de módulos
router.get('/api/modules', async (req, res) => {
  try {
    const modules = await Module.find();
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de módulos.' });
  }
});

// Obtener un módulo por su ID
router.get('/api/modules/:id', async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ message: 'Módulo no encontrado.' });
    }
    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el módulo.' });
  }
});

// Actualizar un módulo por su ID
router.put('/api/modules/:id', isAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, imagen } = req.body;
    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, imagen },
      { new: true }
    );
    if (!updatedModule) {
      return res.status(404).json({ message: 'Módulo no encontrado.' });
    }
    res.status(200).json(updatedModule);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el módulo.' });
  }
});

// Eliminar un módulo por su ID
router.delete('/api/modules/:id', isAdmin, async (req, res) => {
  try {
    const deletedModule = await Module.findByIdAndDelete(req.params.id);
    if (!deletedModule) {
      return res.status(404).json({ message: 'Módulo no encontrado.' });
    }
    res.status(200).json({ message: 'Módulo eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el módulo.' });
  }
});




// Crear un nuevo tema
router.post('/api/modules/:moduleId/submodules', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const newSubmodule = new Submodule({ nombre, descripcion });
    const savedSubmodule = await newSubmodule.save();

    // Agregar el tema al módulo correspondiente
    const module = await Module.findById(req.params.moduleId);
    module.submodulos.push(savedSubmodule._id);
    await module.save();

    res.status(201).json(savedSubmodule);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el tema.' });
  }
});

// Obtener la lista de temas de un módulo
router.get('/api/modules/:moduleId/submodules', async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId).populate('submodulos');
    res.status(200).json(module.submodulos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de temas.' });
  }
});

// Obtener un tema por su ID
router.get('/api/submodules/:id', async (req, res) => {
  try {
    const submodule = await Submodule.findById(req.params.id);
    if (!submodule) {
      return res.status(404).json({ message: 'Tema no encontrado.' });
    }
    res.status(200).json(submodule);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el tema.' });
  }
});

// Actualizar un tema por su ID
router.put('/api/submodules/:id', isAdmin, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const updatedSubmodule = await Submodule.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion },
      { new: true }
    );
    if (!updatedSubmodule) {
      return res.status(404).json({ message: 'Tema no encontrado.' });
    }
    res.status(200).json(updatedSubmodule);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el tema.' });
  }
});

// Eliminar un tema por su ID
router.delete('/api/submodules/:id', isAdmin, async (req, res) => {
  try {
    const deletedSubmodule = await Submodule.findByIdAndDelete(req.params.id);
    if (!deletedSubmodule) {
      return res.status(404).json({ message: 'Tema no encontrado.' });
    }
    res.status(200).json({ message: 'Tema eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el tema.' });
  }
});






// Crear un nuevo video
router.post('/api/submodules/:submoduleId/videos', async (req, res) => {
  try {
    const { title, description, url } = req.body;
    const newVideo = new Video({ title, description, url });
    const savedVideo = await newVideo.save();

    // Agregar el video al tema correspondiente
    const submodule = await Submodule.findById(req.params.submoduleId);
    submodule.videos.push(savedVideo._id);
    await submodule.save();

    res.status(201).json(savedVideo);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el video.' });
  }
});

// Obtener la lista de videos de un tema
router.get('/api/submodules/:submoduleId/videos', async (req, res) => {
  try {
    const submodule = await Submodule.findById(req.params.submoduleId).populate('videos');
    res.status(200).json(submodule.videos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de videos.' });
  }
});

// Obtener un video por su ID
router.get('/api/videos/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video no encontrado.' });
    }
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el video.' });
  }
});

// Actualizar un video por su ID
router.put('/api/videos/:id', isAdmin, async (req, res) => {
  try {
    const { title, description, url } = req.body;
    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      { title, description, url },
      { new: true }
    );
    if (!updatedVideo) {
      return res.status(404).json({ message: 'Video no encontrado.' });
    }
    res.status(200).json(updatedVideo);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el video.' });
  }
});

// Eliminar un video por su ID
router.delete('/api/videos/:id', isAdmin, async (req, res) => {
  try {
    const deletedVideo = await Video.findByIdAndDelete(req.params.id);
    if (!deletedVideo) {
      return res.status(404).json({ message: 'Video no encontrado.' });
    }
    res.status(200).json({ message: 'Video eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el video.' });
  }
});


module.exports = router;

