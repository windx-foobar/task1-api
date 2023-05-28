export default (sequelize, dataTypes) => {
  const UsersRoles = sequelize.define(
    'usersRoles',
    {
      createdAt: { type: dataTypes.DATE, allowNull: false, defaultValue: sequelize.Sequelize.NOW }
    },
    {
      timestamps: false
    }
  );

  return UsersRoles;
};
