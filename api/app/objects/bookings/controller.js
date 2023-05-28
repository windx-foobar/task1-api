import dayjs from 'dayjs';
import { handleRequestError, getRequestMeta, notFoundError, badRequestError } from '@innoagency-arenda/server/helpers';
import { getDatabase } from '@innoagency-arenda/database';

const db = getDatabase();
const { objects, bookings } = db.models;

export async function index(req, res) {
  const { pageSize, currentPage, sortBy, orderBy } = getRequestMeta(req);

  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    const { id } = req.params;

    // FIXME: Возможно сделать одним запросом
    const objectsRow = await objects.findByPk(id, { transaction });
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

    const where = {
      objectId: objectsRow.id
    };

    const { rows, count = 0 } = await bookings.findAndCountAll({
      where,
      ...conditions,
      transaction
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

    const objectsRow = await objects.findByPk(id, { transaction });
    if (!objectsRow) return notFoundError('Объект не найден');

    let { start, end, payload } = req.body;

    const createData = {
      status: 1,
      ownerId: objectsRow.ownerId,
      lesseeId: req.user.id,
      payload: payload || {},
      isClient: true
    };

    const dayjsStart = dayjs(start);
    const dayjsEnd = dayjs(end);

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

export async function update(req, res) {}

export async function destroy(req, res) {}
