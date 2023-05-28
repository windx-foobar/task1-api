import { isEmpty, merge } from 'lodash';
import { handleRequestError, getRequestMeta, notFoundError, badRequestError } from '@innoagency-arenda/server/helpers';
import { getDatabase } from '@innoagency-arenda/database';
import dayjs from 'dayjs';

const db = getDatabase();
const { bookings } = db.models;
const { fn } = db.Sequelize;

export async function index(req, res) {
  const { pageSize, currentPage, sortBy, orderBy } = getRequestMeta(req);

  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    const { id } = req.params;

    const [objectsRow] = await req.user.getObjects({
      where: { id },
      transaction
    });
    if (!objectsRow) return notFoundError('Объект не найден');

    let { filter = '{}' } = req.query;
    try {
      filter = JSON.parse(filter);
    } catch (error) {
      console.trace(error);
    }

    const conditions = {
      order: [[sortBy, orderBy ? 'DESC' : 'ASC']],
      limit: Number(pageSize) || undefined,
      offset: Math.max((currentPage - 1) * pageSize, 0)
    };

    const where = { objectId: objectsRow.id };

    const { rows = [], count = 0 } = await bookings.findAndCountAll({
      where,
      ...conditions
    });

    await transaction.commit();
    return res.status(200).json({
      rows,
      _meta: {
        currentPage,
        perPage: pageSize,
        pageCount: Math.ceil(count / pageSize),
        totalCount: count
      }
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}

export async function show(req, res) {}

// FIXME: Вынести создание bookings в отдельный сервис или метод модели
export async function create(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    const { id } = req.params;

    const [objectsRow] = await req.user.getObjects({ where: { id }, transaction });
    if (!objectsRow) return notFoundError('Объект не найден');

    let { start, end, payload } = req.body;

    const createData = {
      status: 1,
      ownerId: objectsRow.ownerId,
      lesseeId: req.user.id,
      payload: payload || {},
      isClient: false,
      confirmedAt: fn('now')
    };

    const dayjsStart = dayjs(start || null);
    const dayjsEnd = dayjs(end || null);

    if (!dayjsStart.isValid()) {
      return badRequestError('Дата и время начала бронирования заполнены неверно');
    }

    if (!dayjsEnd.isValid()) {
      return badRequestError('Дата и время окончания бронирования заполнены неверно');
    }

    createData.startAt = dayjsStart.toDate();
    createData.endAt = dayjsEnd.toDate();

    const bookingsRow = await objectsRow.createBooking(createData, { transaction });

    await transaction.commit();
    return res.status(200).json(bookingsRow);
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}

export async function update(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    const { id, calendar_id: bookingId } = req.params;

    const [objectsRow] = await req.user.getObjects({
      where: { id },
      include: [{ association: 'bookings', where: { id: bookingId }, required: false }],
      transaction
    });
    if (!objectsRow) return notFoundError('Объект не найден');

    const [bookingsRow] = objectsRow.bookings;
    if (!bookingsRow) return notFoundError('Календарь не найден');

    let { start, end, status, payload } = req.body;

    const updateData = {};

    const dayjsStart = dayjs(start || null);
    const dayjsEnd = dayjs(end || null);

    if (dayjsStart.isValid()) {
      updateData.startAt = dayjsStart.toDate();
    }

    if (dayjsEnd.isValid()) {
      updateData.endAt = dayjsEnd.toDate();
    }

    if (!isEmpty(payload)) {
      updateData.payload = merge({}, bookingsRow.payload, payload);
    }

    if (typeof status === 'number') {
      updateData.status = status;
    }

    const updatedBookingsRow = await bookingsRow.update(updateData, { transaction });

    await transaction.commit();
    return res.status(200).json(updatedBookingsRow);
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}

export async function destroy(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    const { id, calendar_id: bookingId } = req.params;

    const [objectsRow] = await req.user.getObjects({
      where: { id },
      include: [{ association: 'bookings', where: { id: bookingId }, required: false }],
      transaction
    });
    if (!objectsRow) return notFoundError('Объект не найден');

    const [bookingsRow] = objectsRow.bookings;
    if (!bookingsRow) return notFoundError('Календарь не найден');

    await bookingsRow.destroy({ transaction });

    await transaction.commit();
    return res.status(200).json({ message: 'Календарь успешно удален' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}
