/*
 * Для запуска сидера введите команду:
 * yarn cli-dev:api seed 20230519165800-add-superadmin
 * yarn cli:api seed 20230519165800-add-superadmin
 */
import mri from 'mri';
import { getDatabase } from '@innoagency-arenda/database';

const debug = (message) => console.log('seed:seeding:20230519165800-add-superadmin', message);
const { models, sequelize, Sequelize } = getDatabase();
const { fn, Op } = Sequelize;
const { users, roles } = models;

const USERS = [
  {
    name: 'superAdmin',
    roles: ['super_admin']
  }
];

export async function seed() {
  debug('Database seeding started');

  const transaction = await sequelize.transaction();
  const argv = mri(process.argv.slice(2), {
    default: {
      mail: 'admin@ya.ru',
      pwd: '123456'
    }
  });

  try {
    const { roles: user_roles, ...rest } = USERS[0];

    const usersRow = await users.create(
      {
        ...rest,
        email: String(argv.mail),
        password: String(argv.pwd),
        confirmedAt: fn('NOW')
      },
      {
        transaction
      }
    );

    const rolesRow = await roles.findOne({
      where: {
        name: {
          [Op.in]: user_roles
        }
      },
      transaction
    });

    await usersRow.addRoles(rolesRow, { transaction });

    await transaction.commit();
    debug('Database seeding completed.');
  } catch (error) {
    await transaction.rollback();
    debug(`Seeding failed ${error.message} (detail: ${error.parent && error.parent.detail})`);
    throw error;
  }
}
