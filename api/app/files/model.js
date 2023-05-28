import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import logger from '@innoagency-arenda/server/logger';
import { extension } from '@innoagency-arenda/utils';

import mimetypes from './mimetypes';

export default (sequelize, dataTypes) => {
  const beforeCreateHook = async (file) => {
    if (file.isImage) {
      const filePath = path.resolve(file.path);
      const fileMeta = await sharp(filePath).metadata();
      file.width = fileMeta.width;
      file.height = fileMeta.height;
    }
  };

  const Files = sequelize.define(
    'files',
    {
      originalName: { type: dataTypes.STRING, allowNull: false },
      name: { type: dataTypes.STRING, allowNull: false },
      path: { type: dataTypes.STRING, allowNull: false },
      destination: { type: dataTypes.STRING, allowNull: false },
      mimeType: { type: dataTypes.STRING, allowNull: false },
      encoding: { type: dataTypes.STRING, allowNull: false },
      size: { type: dataTypes.INTEGER },
      width: { type: dataTypes.INTEGER },
      height: { type: dataTypes.INTEGER },
      parent_id: { type: dataTypes.INTEGER },
      model: { type: dataTypes.ENUM('requests', 'accounts') },
      payload: { type: dataTypes.JSON },
      extension: {
        type: dataTypes.VIRTUAL(dataTypes.STRING, ['originalName']),
        get() {
          return this.originalName ? extension(this.originalName) : null;
        }
      },
      isImage: {
        type: dataTypes.VIRTUAL(dataTypes.BOOLEAN, ['mimeType']),
        get() {
          return mimetypes.includes(this.mimeType);
        }
      }
    },
    {
      defaultScope: {
        attributes: [
          'id',
          'originalName',
          'payload',
          'isImage',
          // ['originalName', 'name'],
          'createdAt'
        ]
      },
      scopes: {
        requestClient: {
          where: { 'payload.type': 'requestClient' }
        }
      },
      hooks: {
        beforeCreate: beforeCreateHook,
        async afterDestroy(instance, options) {
          if (options.force) {
            try {
              const filePath = instance.path;
              if (!filePath) throw new Error('Путь до файла не найден в базе (instance.path)');
              if (!fs.existsSync(filePath)) throw new Error('Не найден файл для удаления');

              await fs.promises.unlink(filePath);
            } catch (error) {
              logger.error(error.message, {
                tag: 'files > model > hooks > afterDestroy',
                error: JSON.stringify(error, Object.getOwnPropertyNames(error))
              });
            }
          }
        }
      }
    }
  );

  Files.associate = ({ users, objects }) => {
    Files.belongsTo(users);
    Files.belongsTo(objects, {
      foreignKey: 'parent_id',
      scope: {
        model: objects.name
      }
    });
  };

  return Files;
};
