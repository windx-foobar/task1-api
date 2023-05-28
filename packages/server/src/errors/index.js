module.exports = {
  ...require('./requestValidation'),
  ...require('./notFound'),
  ...require('./acessDenied'),
  ...require('./badRequest'),
  ...require('./serverError')
};
