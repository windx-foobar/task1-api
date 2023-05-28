export default (sequelize, dataTypes) => {
  const ObjectsServices = sequelize.define(
    'objectsServices',
    {},
    {
      timestamps: false,
      paranoid: false
    }
  );

  return ObjectsServices;
};
