import { handleRequestError, getRequestMeta, notFoundError } from '@innoagency-arenda/server/helpers';
import { getDatabase } from '@innoagency-arenda/database';

const db = getDatabase();
const { objects, logs } = db.models;

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

    if (filter?.status) {
      where.status = filter.status;
    }

    const { rows = [], count = 0 } = await objects.findAndCountAll({
      where,
      ...conditions,
      include: [{ association: 'objectCategory' }, { association: 'files' }]
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
    // console.log(id);

    const objectsRow = await objects.findByPk(id, {
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

    return res.status(200).json(objectsRow);
  } catch (error) {
    return handleRequestError({ res, error });
  }
}

export async function confirm(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();
    const { id } = req.params;

    const objectsRow = await objects.findByPk(id, {
      transaction
    });
    if (!objectsRow) return notFoundError('Объект не найден');

    const updateData = { status: 3 };
    const updatedObjectsRow = await objectsRow.update(updateData, { transaction });

    await logs.create({
      comment: `Пользователь ${req.user.email} (id = ${req.user.id}) одобрил размещение объекта ${updatedObjectsRow._name} (id = ${updatedObjectsRow.id})`,
      userId: req.user.id
    });

    await transaction.commit();
    return res.status(200).json(updatedObjectsRow);
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}

export async function refuse(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();
    const { id } = req.params;

    const objectsRow = await objects.findByPk(id, {
      transaction
    });
    if (!objectsRow) return notFoundError('Объект не найден');

    const updateData = { status: 4 };
    const updatedObjectsRow = await objectsRow.update(updateData, { transaction });

    await logs.create({
      comment: `Пользователь ${req.user.email} (id = ${req.user.id}) отказал в размещении объекта ${updatedObjectsRow._name} (id = ${updatedObjectsRow.id})`,
      userId: req.user.id
    });

    await transaction.commit();
    return res.status(200).json(updatedObjectsRow);
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}
