import { merge } from 'lodash';
import {
  handleRequestError,
  getRequestMeta,
  notFoundError,
  badRequestError,
  serverError
} from '@innoagency-arenda/server/helpers';
import { getDatabase } from '@innoagency-arenda/database';

const db = getDatabase();
const { services } = db.models;

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

    const where = { ownerId: req.user.id };

    const { rows = [], count = 0 } = await services.findAndCountAll({
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

    const [servicesRow] = await req.user.getServices({
      where: { id },
      include: [{ association: 'objects' }]
    });
    if (!servicesRow) return notFoundError('Сервис не найден');

    return res.status(200).json(servicesRow);
  } catch (error) {
    return handleRequestError({ res, error });
  }
}

export async function create(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    let { payload = {} } = req.body;

    const { id } = await req.user.createService(
      {
        payload
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(200).json({ id, message: 'Сервис успешно создан' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}

export async function update(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    const { id } = req.params;
    let { status, payload } = req.body;

    const [servicesRow] = await req.user.getServices({
      where: { id },
      transaction
    });
    if (!servicesRow) return notFoundError('Сервис не найден');

    payload = merge({}, servicesRow.payload, payload || {});
    // console.log(payload);

    const updatedServicesRow = await servicesRow.update({ payload }, { transaction });

    await transaction.commit();
    return res.status(200).json(updatedServicesRow);
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}

export async function destroy(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    const { id } = req.params;

    const servicesRow = await req.user.getServices({
      where: { id },
      transaction
    });
    if (!servicesRow) return notFoundError('Сервис не найден');

    // FIXME: Возможно тут стоит еще удалять связи с объектами.

    await servicesRow.destroy({ transaction });

    await transaction.commit();
    return res.status(200).json({ message: 'Сервис успешно удален' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}
