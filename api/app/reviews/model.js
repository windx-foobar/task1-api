export default (sequelize, dataTypes) => {
  const Reviews = sequelize.define('reviews', {
    status: { type: dataTypes.INTEGER, allowNull: false, defaultValue: 1 },

    payload: {
      type: dataTypes.JSON,
      defaultValue: {}
    }
  });

  Reviews.associate = ({ objects, users }) => {
    Reviews.belongsTo(users, { foreignKey: 'lesseeId' });
    Reviews.belongsTo(objects);
  };

  return Reviews;
};
