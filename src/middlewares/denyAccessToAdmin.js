const User = require("../models/user");
const Role = require("../models/role");

const denyAccessToAdmin = async (req, res, next) => {
    const user = await User.findById(req.userId);
    const roles = await Role.find({ _id: { $in: user.roles } });

    for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "admin") {
            return res.status(403).json({ message: "Acceso denegado para el admin" });
            console.log
        }
    }

    next();
};

module.exports = denyAccessToAdmin;