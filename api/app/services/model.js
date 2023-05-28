export default (sequelize, dataTypes) => {
  const Services = sequelize.define('services', {
    status: { type: dataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    _name: {
      type: dataTypes.VIRTUAL(dataTypes.STRING, ['payload']),
      get() {
        return this.payload?.name;
      }
    },
    _price: {
      type: dataTypes.VIRTUAL(dataTypes.STRING, ['payload']),
      get() {
        return this.payload?.price ?? null;
      }
    },
    payload: {
      type: dataTypes.JSON,
      defaultValue: {}
    }
  });

  Services.associate = ({ objects, users, objectsServices }) => {
    Services.belongsTo(users, { foreignKey: 'ownerId' });
    Services.belongsToMany(objects, { through: objectsServices });
  };

  return Services;
};
