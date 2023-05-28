export default (sequelize, dataTypes) => {
  const RolesPermissions = sequelize.define(
    'rolesPermissions',
    {
      createdAt: { type: dataTypes.DATE, allowNull: false, defaultValue: sequelize.Sequelize.NOW }
    },
    {
      timestamps: false
    }
  );

  return RolesPermissions;
};
