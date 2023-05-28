import dayjs from 'dayjs';

export default (sequelize, dataTypes) => {
  const Bookings = sequelize.define('bookings', {
    payload: {
      type: dataTypes.JSON,
      defaultValue: {}
    },
    isClient: {
      type: dataTypes.BOOLEAN,
      defaultValue: false
    },

    startDate: {
      type: dataTypes.DATE,
      set() {}
    },
    startTime: {
      type: dataTypes.INTEGER,
      set() {}
    },
    endDate: {
      type: dataTypes.DATE,
      set() {}
    },
    endTime: {
      type: dataTypes.INTEGER,
      set() {}
    },
    startAt: {
      type: dataTypes.DATE,
      allowNull: false,
      set(value) {
        this.setDataValue('startDate', value);
        this.setDataValue('startTime', dayjs(value).format('HH:mm:ssZ'));
        this.setDataValue('startAt', value);
      }
    },
    endAt: {
      type: dataTypes.DATE,
      allowNull: false,
      set(value) {
        this.setDataValue('endDate', value);
        this.setDataValue('endTime', dayjs(value).format('HH:mm:ssZ'));
        this.setDataValue('endAt', value);
      }
    },
    confirmedAt: dataTypes.DATE
  });

  Bookings.associate = ({ objects, users }) => {
    Bookings.belongsTo(objects);
    Bookings.belongsTo(users, { foreignKey: 'lesseeId', as: 'lessee' });
    Bookings.belongsTo(users, { foreignKey: 'ownerId', as: 'owner' });
  };

  return Bookings;
};
