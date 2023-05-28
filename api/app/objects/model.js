const STATUS_DRAFT = 1;
const STATUS_NEED_CONFIRM = 2;
const STATUS_CONFIRMED = 3;
const STATUS_REFUSE = 4;

export default (sequelize, dataTypes) => {
  const Objects = sequelize.define(
    'objects',
    {
      status: { type: dataTypes.INTEGER, allowNull: false, defaultValue: STATUS_DRAFT },
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
      _description: {
        type: dataTypes.VIRTUAL(dataTypes.STRING, ['payload']),
        get() {
          return this.payload?.description ?? null;
        }
      },
      _statusName: {
        type: dataTypes.VIRTUAL(dataTypes.STRING, ['status']),
        get() {
          if (this.status === STATUS_DRAFT) {
            return 'черновик';
          } else if (this.status === STATUS_NEED_CONFIRM) {
            return 'на утверждении';
          } else if (this.status === STATUS_CONFIRMED) {
            return 'утвержден';
          } else if (this.status === STATUS_REFUSE) {
            return 'отказано';
          }
          return '-';
        }
      },
      payload: {
        type: dataTypes.JSON,
        defaultValue: {}
      }
    },
    {
      scopes: {
        active: {
          where: {
            status: STATUS_CONFIRMED
          }
        }
      }
    }
  );

  Objects.associate = ({ objectCategories, users, bookings, services, reviews, objectsServices, files }) => {
    Objects.belongsTo(users, { foreignKey: 'ownerId' });
    Objects.hasMany(files, {
      foreignKey: 'parent_id',
      scope: {
        model: Objects.name
      }
    });
    Objects.belongsTo(objectCategories);
    Objects.hasMany(bookings);
    Objects.belongsToMany(services, { through: objectsServices });
    Objects.hasMany(reviews);

    /**
     * Ассоциация на самого себя
     * Self referencing
     * ------------------------------
     * @see https://stackoverflow.com/questions/25363782/how-to-have-a-self-referencing-many-to-many-association-in-sequelize
     */
    Objects.hasMany(Objects, {
      as: 'childs',
      foreignKey: 'parentId'
    });
    Objects.belongsTo(Objects, {
      as: 'parent',
      foreignKey: 'parentId'
    });
  };

  return Objects;
};
