/*
 * Для запуска сидера введите команду:
 * yarn cli-dev:api seed 20190704102600-add-roles
 * yarn cli:api seed 20190704102600-add-roles
 */
import { getDatabase } from '@innoagency-arenda/database';

const debug = (message) => console.log('seed:seeding:20190704102600-add-roles', message);
const { models, sequelize, Sequelize } = getDatabase();
const { Op } = Sequelize;
const { permissions, roles } = models;

const PERMISSIONS = [
  ['objects', 'Объекты'],
  ['services', 'Сервисы'],
  ['bookings', 'Бронирования'],

  ['logs', 'Логи'],
  ['roles', 'Роли']
];

const ROLES = [
  {
    name: 'super_admin',
    description: 'Администратор платформы',
    permissions: [...PERMISSIONS.map((i) => `${i[0]}.write`)]
  },
  {
    name: 'owner',
    description: 'Арендодатель',
    permissions: ['objects.write', 'services.write', 'bookings.write']
  },
  {
    name: 'lessee',
    description: 'Арендатор',
    permissions: ['bookings.write']
  }
];

export async function seed() {
  debug('Database seeding started');

  const transaction = await sequelize.transaction();

  try {
    await permissions.bulkCreate(
      PERMISSIONS.reduce((arr, [permission, permissionName]) => {
        arr.push({ name: `${permission}.write`, description: `${permissionName}: запись` });
        arr.push({ name: `${permission}.read`, description: `${permissionName}: чтение` });
        return arr;
      }, []),
      {
        transaction,
        ignoreDuplicates: true
      }
    );

    await roles.bulkCreate(
      ROLES.map((role) => ({
        name: role.name,
        description: role.description
      })),
      {
        transaction,
        ignoreDuplicates: true
      }
    );

    await Promise.all(
      ROLES.map(async (role) => {
        const findedRole = await roles.findOne({ where: { name: role.name }, transaction });
        const findedPermissions = await permissions.findAll({
          where: {
            name: {
              [Op.in]: role.permissions
            }
          },
          transaction
        });
        await findedRole.addPermissions(findedPermissions, { transaction, ignoreDuplicates: true });
      })
    );

    await transaction.commit();
    debug('Database seeding completed.');
  } catch (error) {
    await transaction.rollback();
    debug(`Seeding failed ${error.message} (detail: ${error.parent && error.parent.detail})`);
    throw error;
  }
}
