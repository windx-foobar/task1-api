import fs from 'fs';
import path from 'path';
import multer from 'multer';
import dayjs from 'dayjs';

export const defaultStorage = multer.diskStorage({
  async destination(req, file, cb) {
    const makeDocumentsFolder = async (absolute = false) => {
      let pathFolder = 'uploads/' + dayjs().format('YYYY/MM/DD');

      if (absolute) {
        pathFolder = path.resolve(pathFolder);
      }

      if (!fs.existsSync(pathFolder)) {
        await fs.promises.mkdir(pathFolder, { recursive: true });
      }

      return pathFolder;
    };

    const destinationPath = await makeDocumentsFolder();

    cb(null, destinationPath);
  }
});
