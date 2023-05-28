import { merge } from 'lodash';
import { handleRequestError, getRequestMeta, notFoundError, badRequestError } from '@innoagency-arenda/server/helpers';
import { getDatabase } from '@innoagency-arenda/database';

const db = getDatabase();
const { objects, logs, files } = db.models;
const { Op } = db.Sequelize;

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

    const { rows = [], count = 0 } = await objects.findAndCountAll({
      where,
      ...conditions,
      include: [{ association: 'objectCategory' }, { association: 'parent' }]
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

    const [objectsRow] = await req.user.getObjects({
      where: { id },
      include: [
        { association: 'objectCategory' },
        { association: 'childs', include: [{ association: 'services' }] },
        { association: 'parent', include: [{ association: 'services' }] },
        { association: 'services' },
        { association: 'files' }
        // { association: 'bookings' }
      ]
    });
    if (!objectsRow) return notFoundError('Объект не найден');

    return res.status(200).json(objectsRow);
  } catch (error) {
    return handleRequestError({ res, error });
  }
}

export async function create(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    let { objectCategoryId, status, parentId, files: dataFiles = [], payload = {} } = req.body;

    if (!+objectCategoryId || !+status) return badRequestError('Не заполнены все обязательные поля');

    parentId = req.body?.parentId || null;

    const { id } = await req.user.createObject(
      {
        objectCategoryId,
        parentId,
        status,
        payload
      },
      { transaction }
    );

    if (dataFiles?.length) {
      await files.update({ parent_id: id, model: 'objects' }, { transaction, where: { id: { [Op.in]: dataFiles } } });
    }

    await transaction.commit();
    return res.status(200).json({ id, message: 'Объект успешно создан' });
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
    let { objectCategoryId, parentId, payload } = req.body;

    const [objectsRow] = await req.user.getObjects({
      where: { id },
      transaction
    });
    if (!objectsRow) return notFoundError('Объект не найден');

    parentId = req.body?.parentId;
    payload = merge({}, objectsRow.payload, payload || {});

    const updateData = { payload };
    if (parentId || parentId === null) {
      updateData.parentId = parentId;
    }
    if (objectCategoryId) {
      updateData.objectCategoryId = objectCategoryId;
    }

    const updatedObjectsRow = await objectsRow.update(updateData, { transaction });

    await transaction.commit();
    return res.status(200).json(updatedObjectsRow);
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}

export async function publish(req, res) {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    const { id } = req.params;

    const [objectsRow] = await req.user.getObjects({
      where: { id, status: 1 },
      transaction
    });
    if (!objectsRow) return notFoundError('Объект не найден');

    const updateData = { status: 2 };

    const updatedObjectsRow = await objectsRow.update(updateData, { transaction });

    await logs.create({
      comment: `Пользователь ${req.user.email} (id = ${req.user.id}) отправил объект ${updatedObjectsRow._name} (id = ${updatedObjectsRow.id}) на проверку`,
      userId: req.user.id
    });

    await transaction.commit();
    return res.status(200).json(updatedObjectsRow);
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

    const [objectsRow] = await req.user.getObjects({
      where: { id },
      transaction
    });
    if (!objectsRow) return notFoundError('Объект не найден');

    await objectsRow.destroy({ transaction });

    await transaction.commit();
    return res.status(200).json({ message: 'Объект успешно удален' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}
