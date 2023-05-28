export default (sequelize, dataTypes) => {
  const OwnerCategories = sequelize.define(
    'ownerCategories',
    {
      name: { type: dataTypes.STRING, allowNull: false, validate: { notEmpty: true } }
    },
    {
      tableName: 'lst_owner_categories',
      timestamps: false,
      paranoid: false
    }
  );

  OwnerCategories.associate = ({ users }) => {
    OwnerCategories.hasOne(users);
  };

  return OwnerCategories;
};
