class RequestValidationError extends Error {
  /**
   *
   * @param {Object} errors
   * @param {string} [errors.message]
   *
   * @example ```
   * throw new RequestValidationError({ message: 'Error', key: 'Value' })
   * ```
   */
  constructor(errors) {
    super(errors.message);
    delete errors.message;

    this.name = 'RequestValidationError';
    this.errors = errors;
  }
}

/**
 * Выброс ошибки с сообщением
 *
 * @param {string} message
 *
 * @return {void}
 *
 * @throws RequestValidationError
 */
const commonError = (message) => {
  throw new RequestValidationError({ message });
};

module.exports = { RequestValidationError, commonError };
