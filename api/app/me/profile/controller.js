import { merge } from 'lodash';
import { UniqueConstraintError } from 'sequelize';
import { handleRequestError, badRequestError } from '@innoagency-arenda/server/helpers';
import { getDatabase } from '@innoagency-arenda/database';

const db = getDatabase();
const { oneTimeTokens } = db.models;

export async function index(req, res) {
  try {
    const { roles = [], permissions = [] } = await req.user.getAccess();

    return res.status(200).json({
      user: {
        ...req.user.toJSON(),
        roles,
        permissions
      }
    });
  } catch (error) {
    return handleRequestError({ res, error });
  }
}

export async function update(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    const { name, email } = req.body;
    const profile = merge({}, req.user.profile, req.body.profile || {});
    const payload = merge({}, req.user.payload, req.body.payload || {});

    const isNewEmail = email !== req.user.email;

    let updatedUser;
    try {
      const updateData = { name, email, profile, payload };
      if (isNewEmail) {
        updateData.confirmedAt = null;
      }

      updatedUser = await req.user.update(updateData, { transaction });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return badRequestError('E-mail уже используется другим пользователем');
      }

      throw error;
    }

    let oneTimeTokensRow;
    if (isNewEmail) {
      oneTimeTokensRow = await oneTimeTokens.create(
        {
          action: 'registration',
          email,
          payload: {
            userId: req.user.id
          }
        },
        { transaction }
      );

      await oneTimeTokensRow.sendToUser({ transaction });
    }

    await transaction.commit();
    return res.status(200).json({
      ...updatedUser.toJSON(),
      // TODO: Убрать когда появится отправка письма на почту
      code: isNewEmail ? oneTimeTokensRow.id : undefined
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}

export async function resetPassword(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    const { password, confirm } = req.body;

    if (!password || !confirm) return badRequestError('Не заполнены все обязательные поля');
    if (password !== confirm) return badRequestError('Пароли не совпадают');

    await req.user.update({ password }, { transaction });

    await transaction.commit();
    return res.status(200).json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}
