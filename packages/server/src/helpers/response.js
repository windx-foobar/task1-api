const { ValidationError } = require('sequelize');

const { RequestValidationError, NotFoundError, AccessDeniedError, BadRequestError, ServerError } = require('../errors');

const getErrorText = (error) => {
  if (error instanceof ValidationError) return error.errors.map((row) => row.message).join(', ');
  if (error?.parent?.detail) return `${error.message}. ${error.parent.detail}`;
  return error?.message;
};

const handleRequestError = ({ res, error, skipTrace = false }) => {
  if (!skipTrace) {
    console.trace(error);
  }

  const message = getErrorText(error);
  const { errorCode = null } = error;

  switch (true) {
    case error instanceof RequestValidationError:
      res.status(412).json({ message, errorCode, errors: error.errors });
      break;
    case error instanceof ValidationError:
      res.status(412).json({ message, errorCode });
      break;
    case error instanceof NotFoundError:
      res.status(404).json({ message, errorCode, errors: error.errors });
      break;
    case error instanceof AccessDeniedError:
      res.status(403).json({ message, errorCode, errors: error.errors });
      break;
    case error instanceof BadRequestError:
      res.status(400).json({ message, errorCode, errors: error.errors });
      break;
    case error instanceof ServerError:
    case error instanceof Error:
    case true:
    default:
      res.status(500).json({ message, errorCode });
      break;
  }
};

const getRequestMeta = (req) => {
  let { pageSize = 30, currentPage = 1, sortBy = 'createdAt', orderBy = true, showDisabled = false } = req.query;

  return { pageSize: +pageSize, currentPage: +currentPage, sortBy, orderBy, showDisabled: !!showDisabled };
};

module.exports = { handleRequestError, getRequestMeta };
