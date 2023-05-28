class ServerError extends Error {
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

    this.name = 'ServerError';
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
 * @throws ServerError
 */
const serverError = (message) => {
  throw new ServerError({ message });
};

module.exports = { ServerError, serverError };
