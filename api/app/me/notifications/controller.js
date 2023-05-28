import { handleRequestError } from '@innoagency-arenda/server/helpers';
import { getDatabase } from '@innoagency-arenda/database';

const db = getDatabase();
const { notifications } = db.models;
const { fn } = db.Sequelize;

export async function index(req, res) {
  try {
    const notificationsRows = await req.user.getNotifications();

    return res.status(200).json(notificationsRows);
  } catch (error) {
    return handleRequestError({ res, error });
  }
}

export async function markAsReaded(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    await notifications.update({ readedAt: fn('now') }, { transaction, where: { userId: req.user.id } });

    await transaction.commit();
    return res.status(200).json({ message: 'Уведомления помечены как прочитанные' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}
