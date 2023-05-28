import { isEmpty, uniq, cloneDeep } from 'lodash';
import { hashPassword, comparePasswords } from '@innoagency-arenda/server/utils';

export default (sequelize, dataTypes) => {
  const { oneTimeTokens } = sequelize.models;

  const Users = sequelize.define(
    'users',
    {
      name: { type: dataTypes.STRING, allowNull: true, validate: { notEmpty: true } },
      email: { type: dataTypes.STRING, allowNull: true, unique: true, validate: { notEmpty: true, isEmail: true } },
      phone: { type: dataTypes.STRING, allowNull: true, unique: true },
      password: { type: dataTypes.STRING, allowNull: true, validate: { notEmpty: true } },
      hashedPassword: {
        type: dataTypes.VIRTUAL,
        set: function (val) {
          this.setDataValue('hashedPassword', val);
        }
      },

      profile: {
        type: dataTypes.JSON,
        defaultValue: {}
      },
      payload: {
        type: dataTypes.JSON,
        defaultValue: {}
      },

      confirmedAt: dataTypes.DATE,
      lockedAt: dataTypes.DATE
    },
    {
      defaultScope: {
        attributes: { exclude: ['password'] }
      },
      scopes: {},
      indexes: [
        { unique: true, fields: ['email'] },
        { unique: true, fields: ['phone'] }
      ],
      hooks: {
        beforeCreate: async (user) => {
          if (isEmpty(user.phone)) user.phone = null;
          if (user.password === 'hashedPassword' && user.hashedPassword) {
            user.password = user.hashedPassword;
          } else {
            await user.hashPassword();
          }
        },
        beforeUpdate: async (user, options) => {
          if (!user.changed('password')) return;

          if (user.password === 'hashedPassword' && user.hashedPassword) {
            user.password = user.hashedPassword;
          } else {
            await user.hashPassword();
          }
        }
      }
    }
  );

  Users.associate = ({
    roles,
    usersRoles,
    logs,
    lesseeCategories,
    ownerCategories,
    authTokens,
    objects,
    bookings,
    notifications,
    services,
    reviews
  }) => {
    Users.hasMany(logs);
    Users.belongsToMany(roles, { through: usersRoles });
    Users.belongsTo(lesseeCategories);
    Users.belongsTo(ownerCategories);
    Users.hasOne(authTokens);
    Users.hasMany(objects, { foreignKey: 'ownerId' });
    Users.hasMany(bookings, { foreignKey: 'lesseeId', as: 'lesseeBookings' });
    Users.hasMany(bookings, { foreignKey: 'ownerId', as: 'ownerBookings' });
    Users.hasMany(notifications);
    Users.hasMany(services, { foreignKey: 'ownerId' });
    Users.hasMany(reviews, { foreignKey: 'lesseeId' });
  };

  Users.getContactInfo = (value) => {
    const isEmail = /@/i.test(value);
    return isEmail ? { type: 'email', value: value.toLowerCase() } : { type: 'phone', value: normalizeMobile(value) };
  };

  Users.findByEmailOrPhone = function findByEmailOrPhone(emailOrPhone, options) {
    const { type, value } = this.getContactInfo(emailOrPhone);
    return this.findOne({ where: { [type]: value }, ...options });
  };

  Users.prototype.authenticate = async function authenticate(password) {
    if (!this.password) return false;
    return comparePasswords(password, this.password);
  };

  Users.prototype.hashPassword = async function () {
    if (!this.changed('password')) return;
    try {
      const { password } = this;
      this.password = await hashPassword(password); // eslint-disable-line no-param-reassign
    } catch (error) {
      throw error;
    }
  };

  Users.prototype.getAccess = async function getAccess(options = {}) {
    const roles = await this.getRoles({
      include: [{ association: 'permissions' }],
      ...options
    });

    let userPermissions = roles.reduce((arr, role) => {
      arr = arr.concat(role.permissions);
      return arr;
    }, []);

    return {
      roles: roles.map((role) => role.name),
      permissions: uniq(userPermissions.map((permission) => permission.name))
    };
  };

  Users.prototype.createRegistrationConfirm = async function ({ transaction } = {}) {
    const oneTimeToken = await oneTimeTokens.create(
      {
        action: 'registration',
        email: this.email,
        payload: {
          userId: this.id
        }
      },
      { transaction }
    );

    await oneTimeToken.sendToUser({ transaction });

    return oneTimeToken;
  };

  Users.prototype.restore = async function ({ transaction } = {}) {
    const oneTimeToken = await oneTimeTokens.create(
      {
        action: 'change-password',
        email: this.email,
        payload: {
          userId: this.id
        }
      },
      { transaction }
    );

    await oneTimeToken.sendToUser({ transaction });

    return oneTimeToken;
  };

  Users.prototype.toJSON = function () {
    const base = cloneDeep(this.get({ plain: true }));

    delete base.password;

    return base;
  };

  return Users;
};
