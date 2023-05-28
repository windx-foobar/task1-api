/*
 * Для запуска сидера введите команду:
 * yarn cli-dev:api seed 20230528191635-fill-test-users
 * yarn cli:api seed 20230528191635-fill-test-users
 */
import { getDatabase } from '@innoagency-arenda/database';
import { faker } from '@faker-js/faker';

faker.setLocale('ru');

const debug = (message) => console.log('seed:seeding:20230528191635-fill-test-users', message);
const { models, sequelize, Sequelize } = getDatabase();
const { fn } = Sequelize;
const { users } = models;

const USERS = Array(10)
  .fill(null)
  .map((_, idx) => {
    const num = idx + 1;

    let role = 2;
    if (num > 5) {
      role = 3;
    }

    return {
      name: faker.helpers.unique(faker.name.fullName),
      email: `user${num}@mail.ru`,
      password: '123456',
      createdAt: fn('now'),
      updatedAt: fn('now'),
      confirmedAt: fn('now'),
      status: 1,
      role
    };
  });

export async function seed() {
  debug('Database seeding started');

  const transaction = await sequelize.transaction();

  try {
    for (const item of USERS) {
      const usersRow = await users.create(item, { transaction });
      await usersRow.addRole(item.role, { transaction });
    }

    await transaction.commit();
    debug('Database seeding completed.');
  } catch (error) {
    await transaction.rollback();
    debug(`Seeding failed ${error.message} (detail: ${error.parent && error.parent.detail})`);
    throw error;
  }
}
