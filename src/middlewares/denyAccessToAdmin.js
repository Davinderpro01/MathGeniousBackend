const User = require("../models/user");
const Role = require("../models/role");

const denyAccessToAdmin = async (req, res, next) => {
    const user = User.findById(req.userId);
    const roles = Role.find({ _id: { $in: user.roles } });

    for (const role of roles) {
        if (role.name === "admin") {
            return res.status(403).json({ message: "Acceso denegado para el admin" });
        }
    }

    next();
};

module.exports = denyAccessToAdmin;