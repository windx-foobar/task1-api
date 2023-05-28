export default (sequelize, dataTypes) => {
  const Logs = sequelize.define(
    'logs',
    {
      comment: dataTypes.STRING,
      payload: dataTypes.JSON,
      createdAt: {
        type: dataTypes.DATE,
        defaultValue: sequelize.fn('now')
      }
    },
    {
      paranoid: false,
      timestamps: false
    }
  );

  Logs.associate = ({ users }) => {
    Logs.belongsTo(users);
  };

  return Logs;
};
