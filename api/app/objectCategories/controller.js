import { handleRequestError, getRequestMeta, notFoundError } from '@innoagency-arenda/server/helpers';
import { getDatabase } from '@innoagency-arenda/database';

const db = getDatabase();
const { objectCategories } = db.models;

export async function index(req, res) {
  try {
    const rows = await objectCategories.findAll({
      where: {
        parentId: null
      }
    });

    return res.status(200).json({
      rows
    });
  } catch (error) {
    return handleRequestError({ res, error });
  }
}
