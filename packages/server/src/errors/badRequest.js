class BadRequestError extends Error {
  /**
   *
   * @param {Object} errors
   * @param {string} [errors.message]
   *
   * @example ```
   * throw new BadRequestError({ message: 'Error', key: 'Value' })
   * ```
   */
  constructor(errors) {
    super(errors.message);
    delete errors.message;

    this.name = 'BadRequestError';
    this.errors = errors;

    Error.captureStackTrace(this, BadRequestError);
  }
}

/**
 * Выброс ошибки с сообщением
 *
 * @param {string} message
 *
 * @return {void}
 *
 * @throws BadRequestError
 */
const alreadyExistsError = (message) => {
  throw new BadRequestError({ message });
};
const badRequestError = alreadyExistsError;

module.exports = { BadRequestError, badRequestError, alreadyExistsError };
