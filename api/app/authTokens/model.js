export default (sequelize, dataTypes) => {
  const AuthTokens = sequelize.define(
    'authTokens',
    {
      token: { type: dataTypes.UUID, defaultValue: dataTypes.UUIDV4, primaryKey: true },
      createdAt: {
        type: dataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('now')
      }
    },
    { paranoid: false, timestamps: false }
  );

  AuthTokens.associate = ({ users }) => {
    AuthTokens.belongsTo(users);
  };

  return AuthTokens;
};
