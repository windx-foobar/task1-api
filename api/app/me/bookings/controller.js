import { handleRequestError, getRequestMeta, notFoundError } from '@innoagency-arenda/server/helpers';
import { getDatabase } from '@innoagency-arenda/database';

const db = getDatabase();
const { bookings } = db.models;

export async function index(req, res) {
  const { pageSize, currentPage, sortBy, orderBy } = getRequestMeta(req);

  try {
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

    const where = {};
    if (req.hasRole('owner')) {
      where.ownerId = req.user.id;
    }

    if (req.hasRole('lessee')) {
      where.lesseeId = req.user.id;
    }

    const { rows = [], count = 0 } = await bookings.findAndCountAll({
      where,
      ...conditions
    });

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
    return handleRequestError({ res, error });
  }
}

export async function show(req, res) {
  try {
    const { id } = req.params;

    let bookingsRows = [];

    const findOptions = {
      where: { id },
      include: [{ association: 'object' }, { association: 'lessee' }, { association: 'owner' }]
    };

    if (req.hasRole('owner')) {
      bookingsRows = await req.user.getOwnerBookings(findOptions);
    }

    if (req.hasRole('lessee')) {
      bookingsRows = await req.user.getLesseeBookings(findOptions);
    }

    const [bookingsRow] = bookingsRows;
    if (!bookingsRow) return notFoundError('Бронирование не найдено');

    return res.status(200).json(bookingsRow);
  } catch (error) {
    return handleRequestError({ res, error });
  }
}

export async function create(req, res) {}

export async function update(req, res) {}

export async function destroy(req, res) {}
