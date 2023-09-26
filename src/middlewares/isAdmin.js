const User = require("../models/user");
const Role = require("../models/role")

const isAdmin = async (req, res, next) => {
    const user = await User.findById(req.userId);
    const roles = await Role.find({ _id: { $in: user.roles } });

    for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "admin") {
            next();
            return;
        }
    }

    return res.status(403).json({ message: "Requiere rol de administrador!" });
};

module.exports = isAdmin;
