export default (sequelize, dataTypes) => {
  const Roles = sequelize.define('roles', {
    name: { type: dataTypes.STRING, allowNull: false, validate: { notEmpty: true }, unique: true },
    description: { type: dataTypes.STRING }
  });

  Roles.associate = ({ users, usersRoles, rolesPermissions, permissions }) => {
    Roles.belongsToMany(users, { through: usersRoles });
    Roles.belongsToMany(permissions, { through: rolesPermissions });
  };

  return Roles;
};
