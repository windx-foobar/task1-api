export default (sequelize, dataTypes) => {
  const Notifications = sequelize.define(
    'notifications',
    {
      payload: {
        type: dataTypes.JSON,
        defaultValue: {}
      },
      readedAt: dataTypes.DATE
    },
    {
      paranoid: false,
      timestamps: false
    }
  );

  Notifications.associate = ({ users }) => {
    Notifications.belongsTo(users);
  };

  return Notifications;
};
