class NotFoundError extends Error {
  /**
   *
   * @param {Object} errors
   * @param {string} [errors.message]
   *
   * @example ```
   * throw new NotFoundError({ message: 'Error', key: 'Value' })
   * ```
   */
  constructor(errors) {
    super(errors.message);
    delete errors.message;

    this.name = 'NotFoundError';
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
 * @throws NotFoundError
 */
const notFoundError = (message) => {
  throw new NotFoundError({ message });
};

module.exports = { NotFoundError, notFoundError };
