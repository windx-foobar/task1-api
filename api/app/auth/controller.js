import { getDatabase } from '@innoagency-arenda/database';
import { handleRequestError, badRequestError, notFoundError, serverError } from '@innoagency-arenda/server/helpers';

const db = getDatabase();

const { users, roles, oneTimeTokens } = db.models;
const { fn } = db.Sequelize;

export async function register(req, res) {
  let transaction;

  try {
    transaction = await db.sequelize.transaction();

    const { name, email, role, password, confirm } = req.body;

    if (!name || !email || !role || !password || !confirm) return badRequestError('Не заполнены все обязательные поля');
    if (password !== confirm) return badRequestError('Пароли не совпадают');

    let usersRow = await users.findByEmailOrPhone(email, { transaction });
    if (usersRow) return badRequestError('Пользователь с данным e-mail уже существует');

    usersRow = await users.create({ name, email, password }, { transaction });

    const rolesRow = await roles.findByPk(role, { transaction });
    if (!rolesRow) return notFoundError('Выбранная роль не найдена');

    await usersRow.addRoles([rolesRow], { transaction });
    const oneTimeTokensRow = await usersRow.createRegistrationConfirm({ transaction });

    await transaction.commit();
    return res.status(200).json({
      ...usersRow.toJSON(),
      // TODO: Убрать когда появится отправка письма на почту
      code: oneTimeTokensRow.id
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}

export async function confirmRegister(req, res) {
  let transaction;

  try {
    transaction = await db.sequelize.transaction();

    const { token: code } = req.params;

    const oneTimeTokensRow = await oneTimeTokens.validateAndDestroy(code, null, { transaction });

    await users.update(
      { confirmedAt: fn('now') },
      {
        where: { id: oneTimeTokensRow.payload.userId },
        transaction
      }
    );

    await transaction.commit();
    return res.status(200).json({ message: 'Пользователь успешно подтвержден' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}

export async function login(req, res) {
  try {
    const authTokensRow = await req.user.createAuthToken();
    if (!authTokensRow) return serverError('Ошибка авторизации');

    return res.status(200).json({
      userId: req.user.id,
      token: authTokensRow.token
    });
  } catch (error) {
    return handleRequestError({ res, error });
  }
}

export async function logout(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    const authTokensRow = await req.user.getAuthToken({ transaction });
    await authTokensRow.destroy({ transaction });

    await transaction.commit();
    return res.status(200).json({ message: 'Вы успешно вышли из системы' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}

export async function forgotPassword(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    const { email } = req.body;

    const usersRow = await users.findByEmailOrPhone(email, { transaction });
    if (!usersRow) return notFoundError('Пользователь с данным e-mail не найден');

    const oneTimeTokensRow = await usersRow.restore({ transaction });

    await transaction.commit();
    return res.status(200).json({
      // TODO: Убрать когда появится отправка письма на почту
      code: oneTimeTokensRow.id,
      message: 'Письмо с подтверждением отправлено на почту'
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}

export async function changePassword(req, res) {
  let transaction;

  try {
    transaction = await db.sequelize.transaction();

    const { token: code } = req.params;
    const { password, confirm } = req.body;

    if (!password || !confirm) return badRequestError('Не заполнены все обязательные поля');
    if (password !== confirm) return badRequestError('Пароли не совпадают');

    const oneTimeTokensRow = await oneTimeTokens.validateAndDestroy(code, null, { transaction });

    // Искать пользователя, чтобы обновить данные через инстанс.
    // Это нужно, чтобы сработал хук для шифрования пароля.
    const usersRow = await users.findByPk(oneTimeTokensRow.payload.userId, { transaction });
    if (!usersRow) return serverError('Серверная ошибка');

    await usersRow.update({ password }, { transaction });

    await transaction.commit();
    return res.status(200).json({ message: 'Пароль успешно обновлен' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}

export async function destroyConfirm(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    const { token: code } = req.params;

    try {
      await oneTimeTokens.validateAndDestroy(code, null, { transaction });
    } catch (error) {
      console.warn(error.message);
    }

    await transaction.commit();
    return res.status(200).json({ message: 'Успешно удалено' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}
