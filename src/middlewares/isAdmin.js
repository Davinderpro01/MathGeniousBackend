const User = require("../models/user");
const Role = require("../models/role")

const isAdmin = async (req, res, next) => {
    const user = User.findById(req.userId);
    const roles = Role.find({ _id: { $in: user.roles } });

    for (const role of roles) {
        if (role.name === "admin") {
            next();
            return;
        }
    }

    return res.status(403).json({ message: "Requiere rol de administrador!" });
};

module.exports = isAdmin;
