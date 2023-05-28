export default (sequelize, dataTypes) => {
  const Permissions = sequelize.define('permissions', {
    name: { type: dataTypes.STRING, allowNull: false, validate: { notEmpty: true }, unique: true },
    description: { type: dataTypes.STRING }
  });

  Permissions.associate = ({ roles, rolesPermissions }) => {
    Permissions.belongsToMany(roles, { through: rolesPermissions });
  };

  return Permissions;
};
