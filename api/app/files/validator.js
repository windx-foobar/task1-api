import { isEmpty, get } from 'lodash';
import { handleRequestError } from 'api/utils';
import { createValidator, required, id, float, mobile, email, customMessage } from '../../../shared/utils/validation';

export default async function validator(req, res, next) {
  const stack = req.route?.stack || [];
  const controllerName = stack[stack.length - 1]?.name;
  const hasValidator = RULES[controllerName];

  if (!!hasValidator) {
    await RULES[controllerName](req, res, next);
  } else {
    console.log(`no validator for ${controllerName}`);
    next();
  }
}

const RULES = {
  async uploadEx(req, res, next) {
    const body = createValidator({
      parentId: [required],
      payload: [required]
    });

    const bodyErrors = body(req.body);

    if (!isEmpty(bodyErrors)) {
      return res.status(400).json({ message: 'Проверьте корректность данных', errors: bodyErrors });
    }

    next();
  }
};
