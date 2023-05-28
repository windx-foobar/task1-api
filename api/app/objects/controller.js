import { handleRequestError, getRequestMeta, notFoundError } from '@innoagency-arenda/server/helpers';
import { getDatabase } from '@innoagency-arenda/database';

const db = getDatabase();
const { objects } = db.models;

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

    const { rows = [], count = 0 } = await objects.scope('active').findAndCountAll({
      where,
      ...conditions,
      include: [{ association: 'objectCategory' }, { association: 'files' }]
    });

    const mappedRows = rows.map((item) => {
      const plainItem = item.toJSON();

      return { ...plainItem, _price: '-', payload: { ...(plainItem?.payload || {}), price: '-' } };
    });

    return res.status(200).json({
      rows: mappedRows,
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

    const objectsRow = await objects.scope('active').findByPk(id, {
      include: [
        { association: 'objectCategory' },
        // FIXME: Скорее всего то что закомментированно не должны видеть без авторизации
        { association: 'childs' /*, include: [{ association: 'services' }]*/ },
        { association: 'parent' /*, include: [{ association: 'services' }]*/ },
        { association: 'files' }
        // { association: 'services' },
        // { association: 'bookings' }
      ]
    });
    if (!objectsRow) return notFoundError('Объект не найден');

    const plainObjectsRow = objectsRow.toJSON();

    return res.status(200).json({
      ...plainObjectsRow,
      _price: '-',
      payload: {
        ...(plainObjectsRow?.payload || {}),
        price: '-'
      }
    });
  } catch (error) {
    return handleRequestError({ res, error });
  }
}
