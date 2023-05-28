import { handleRequestError, getRequestMeta, notFoundError } from '@innoagency-arenda/server/helpers';
import { getDatabase } from '@innoagency-arenda/database';

const db = getDatabase();

// export async function index(req, res) {
//   const { pageSize, currentPage, sortBy, orderBy } = getRequestMeta(req);

//   try {
//     let { filter = '{}' } = req.query;
//     try {
//       filter = JSON.parse(filter);
//     } catch (error) {
//       console.trace(error);
//     }

//     const conditions = {
//       order: [[sortBy, orderBy ? 'DESC' : 'ASC']],
//       limit: Number(pageSize) || undefined,
//       offset: Math.max((currentPage - 1) * pageSize, 0)
//     };

//     const where = {};

//     const { rows = [], count = 0 } = await objects.findAndCountAll({
//       where,
//       ...conditions,
//       include: [{ association: 'objectCategory' }, { association: 'files' }]
//     });

//     return res.status(200).json({
//       rows,
//       _meta: {
//         currentPage,
//         perPage: pageSize,
//         pageCount: Math.ceil(count / pageSize),
//         totalCount: count
//       }
//     });
//   } catch (error) {
//     return handleRequestError({ res, error });
//   }
// }

export async function objectStatus(req, res) {
  try {
    const lst = [
      { id: 1, name: 'черновик' },
      { id: 2, name: 'на утверждении' },
      { id: 3, name: 'утвержден' },
      { id: 4, name: 'отказано' }
    ];

    return res.status(200).json(lst);
  } catch (error) {
    return handleRequestError({ res, error });
  }
}
