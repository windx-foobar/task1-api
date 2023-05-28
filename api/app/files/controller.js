import fs from 'fs';
import path from 'path';
import cyrillicToTranslit from 'cyrillic-to-translit-js';
import contentDisposition from 'content-disposition';
import { getDatabase } from '@innoagency-arenda/database';
import { handleRequestError, commonError, badRequestError } from '@innoagency-arenda/server/helpers';

import mimetypes from './mimetypes';

const db = getDatabase();
const { models } = db;

export async function upload(req, res) {
  let transaction;
  const { parent = null, id = null, payload = '{}' } = req.body;
  const json = JSON.parse(payload);

  try {
    transaction = await db.sequelize.transaction();

    let parentRecord = { id };

    if (parent && id) {
      if (!models[parent]) {
        throw new Error(`Модель ${parent} не найдена`);
      }

      parentRecord = await models[parent].unscoped().findByPk(id, { transaction });
      if (!parentRecord) throw new Error(`Владелец ${parent}:${id} не найден`);
    }

    const { filename: name, mimetype: mimeType, originalname: originalName, size, ...rest } = req.file;
    const { id: userId } = req.user;

    if (!size) {
      throw new Error('Размер файла не определен');
    }

    let file = await models.files.create(
      {
        name,
        mimeType,
        originalName,
        user_id: userId,
        size,
        ...rest,
        userId: req.user.id,
        payload: json,
        model: parent,
        parent_id: parentRecord.id
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(200).json(file);
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleRequestError({ res, error });
  }
}

export async function show(req, res) {
  const { id } = req.params;
  const { files } = models;

  try {
    let file;

    const isUuid = typeof id === 'string' && !Number(id) && id.trim().length;

    const findOptions = {
      attributes: ['path', 'originalName', 'mimeType', 'name', 'parent_id', 'model', 'userId']
    };

    if (isUuid) {
      file = await files.findOne({
        ...findOptions,
        where: { uuid: id }
      });
    } else {
      file = await files.findByPk(id, findOptions);
    }

    if (!file) throw new Error(`Файл не найден`);
    const name = cyrillicToTranslit().transform(file.originalName.includes('.') ? file.originalName : file.name);

    res.setHeader('Content-Type', file.mimeType);

    // Не скачивать, а показать:
    if (!req.query?.show) res.setHeader('Content-Disposition', contentDisposition(name));

    if (!fs.existsSync(path.resolve(file.path))) {
      res.status(404).json({ message: 'Not found', errorCode: 404, errors: 'Not found' });
      return;
    }

    return fs.createReadStream(path.resolve(file.path)).pipe(res);
  } catch (error) {
    return handleRequestError({ res, error });
  }
}

export async function destroy(req, res) {
  const { id } = req.params;
  const { files } = models;

  try {
    const file = await files.unscoped().findByPk(id);

    if (!file) throw new Error(`Файл не найден`);

    await file.destroy({ force: true });
    return res.status(200).json();
  } catch (error) {
    return handleRequestError({ res, error });
  }
}
