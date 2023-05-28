class AccessDeniedError extends Error {
  /**
   *
   * @param {Object} errors
   * @param {string} [errors.message]
   *
   * @example ```
   * throw new AccessDeniedError({ message: 'Error', key: 'Value' })
   * ```
   */
  constructor(errors) {
    super(errors.message);
    delete errors.message;

    this.name = 'AccessDeniedError';
    this.errors = errors;

    Error.captureStackTrace(this, AccessDeniedError);
  }
}

/**
 * Выброс ошибки с сообщением
 *
 * @param {string} message
 *
 * @return {void}
 *
 * @throws AccessDeniedError
 */
const accessDeniedError = (message) => {
  throw new AccessDeniedError({ message });
};

module.exports = { AccessDeniedError, accessDeniedError };
