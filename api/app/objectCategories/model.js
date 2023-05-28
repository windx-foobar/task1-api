export default (sequelize, dataTypes) => {
  const ObjectCategories = sequelize.define(
    'objectCategories',
    {
      name: { type: dataTypes.STRING, allowNull: false, validate: { notEmpty: true } }
    },
    {
      tableName: 'lst_object_categories',
      timestamps: false,
      paranoid: false
    }
  );

  ObjectCategories.associate = ({ objects }) => {
    ObjectCategories.hasOne(objects);

    /**
     * Ассоциация на самого себя
     * Self referencing
     * ------------------------------
     * @see https://stackoverflow.com/questions/25363782/how-to-have-a-self-referencing-many-to-many-association-in-sequelize
     */
    ObjectCategories.hasMany(ObjectCategories, {
      as: 'childs',
      foreignKey: 'parentId'
    });
    ObjectCategories.belongsTo(ObjectCategories, {
      as: 'parent',
      foreignKey: 'parentId'
    });
  };

  return ObjectCategories;
};
