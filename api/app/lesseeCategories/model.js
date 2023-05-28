export default (sequelize, dataTypes) => {
  const LesseeCategories = sequelize.define(
    'lesseeCategories',
    {
      name: { type: dataTypes.STRING, allowNull: false, validate: { notEmpty: true } }
    },
    {
      tableName: 'lst_lessee_categories',
      timestamps: false,
      paranoid: false
    }
  );

  LesseeCategories.associate = ({ users }) => {
    LesseeCategories.hasOne(users);
  };

  return LesseeCategories;
};
