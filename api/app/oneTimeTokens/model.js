import Sequelize from 'sequelize';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import { notFoundError, serverError } from '@innoagency-arenda/server/helpers';

dayjs.extend(duration);
dayjs.extend(utc);

const { Op } = Sequelize;

const EMAIL_EXPIRATION_TIME = dayjs.duration(1, 'hour');
// const PARTNER_EXPIRATION_TIME = moment.duration(1, 'day');
const CONFIRM_INVITE_EXPIRATION_TIME = dayjs.duration(365, 'day');
const SMS_EXPIRATION_TIME = dayjs.duration(10, 'minutes');
const ACCOUNT_EMAIL_EXPIRATION_TIME = dayjs.duration(1, 'hour');
const ACCOUNT_PASSWORD_EXPIRATION_TIME = dayjs.duration(1, 'hour');
const ACCOUNT_PASSWORD_RECOVERY_EXPIRATION_TIME = dayjs.duration(1, 'hour');
const EXPIRATION_INTERVAL = dayjs.duration(30, 'minutes').asMilliseconds();
const CROSS_AUTH_INTERVAL = dayjs.duration(10, 'minutes');
const ACTIONS = ['registration', 'change-password', 'confirm-invite', 'confirm-profile', 'confirmation-account'];

export default (sequelize, dataTypes) => {
  const OneTimeTokens = sequelize.define('oneTimeTokens', {
    id: { type: dataTypes.UUID, primaryKey: true, defaultValue: dataTypes.UUIDV4 },
    action: {
      type: dataTypes.ENUM(ACTIONS),
      allowNull: false
    },
    phone: dataTypes.STRING,
    email: dataTypes.STRING,
    payload: dataTypes.JSON,

    code: {
      type: dataTypes.VIRTUAL,
      get() {
        return null;
      }
    }
  });

  OneTimeTokens.validate = async (id, code = null, options) => {
    const token = await OneTimeTokens.findByPk(id, options);
    if (!token) {
      const err = new Error(code ? 'Ваш SMS-код не найден' : 'Ваша ссылка недействительна');
      err.errorCode = 'notFound';
      throw err;
    }

    let expirationTime;

    switch (token.action) {
      case 'confirm-invite':
        expirationTime = CONFIRM_INVITE_EXPIRATION_TIME;
        break;
      case 'confirmation-account':
        expirationTime = ACCOUNT_EMAIL_EXPIRATION_TIME;
        code = token.code;
        break;
      case 'change-password':
        expirationTime = ACCOUNT_PASSWORD_EXPIRATION_TIME;
        code = token.code;
        break;
      case 'recovery-password':
        expirationTime = ACCOUNT_PASSWORD_RECOVERY_EXPIRATION_TIME;
        code = token.code;
        break;
      case 'confirm-leak':
        expirationTime = ACCOUNT_EMAIL_EXPIRATION_TIME;
        code = token.code;
        break;
      case 'cross-auth':
        expirationTime = CROSS_AUTH_INTERVAL;
        code = null;
        break;
      default:
        expirationTime = token.email ? EMAIL_EXPIRATION_TIME : SMS_EXPIRATION_TIME;
    }

    if (dayjs().isAfter(dayjs.utc(token.updatedAt).add(expirationTime))) {
      const err = new Error(`Срок действия ${token.email ? 'вашей ссылки' : 'вашего кода'} истек`);
      err.errorCode = 'expired';
      throw err;
    }
    if (token.code !== code) throw new Error('Неверный код');
    return token;
  };

  OneTimeTokens.validateAndDestroy = async function (id, code = null, { transaction } = {}) {
    let oneTimeTokensRow;

    try {
      oneTimeTokensRow = await this.validate(id, code, { transaction });
    } catch (error) {
      return notFoundError(error.message);
    }

    try {
      await oneTimeTokensRow.destroy({ force: true });

      return oneTimeTokensRow;
    } catch (error) {
      return serverError(error);
    }
  };

  OneTimeTokens.clearExpiredTokens = () => {
    const notExpiredFrom = (expirationTime) => dayjs().subtract(expirationTime).toDate();

    return OneTimeTokens.destroy({
      where: {
        [Op.or]: [
          {
            email: { [Op.not]: null },
            payload: {
              partnerCode: { [Op.eq]: null }
            },
            updatedAt: { [Op.lt]: notExpiredFrom(EMAIL_EXPIRATION_TIME) }
          },
          {
            phone: { [Op.not]: null },
            payload: {
              partnerCode: { [Op.eq]: null }
            },
            updatedAt: { [Op.lt]: notExpiredFrom(SMS_EXPIRATION_TIME) }
          },
          {
            action: { [Op.eq]: 'confirm-invite' },
            updatedAt: { [Op.lt]: notExpiredFrom(CONFIRM_INVITE_EXPIRATION_TIME) }
          },
          {
            action: { [Op.eq]: 'confirmation-account' },
            updatedAt: { [Op.lt]: notExpiredFrom(ACCOUNT_EMAIL_EXPIRATION_TIME) }
          }
        ]
      }
    });
  };

  OneTimeTokens.startExpiringTokens = () => {
    OneTimeTokens.clearExpiredTokens();
    OneTimeTokens.stopExpiringTokens(); // Don't allow multiple intervals to run at once.
    OneTimeTokens.expirationInterval = setInterval(OneTimeTokens.clearExpiredTokens, EXPIRATION_INTERVAL);
    OneTimeTokens.expirationInterval.unref(); // allow to terminate the node process even if this interval is still running
  };

  OneTimeTokens.stopExpiringTokens = () => {
    if (OneTimeTokens.expirationInterval) {
      clearInterval(OneTimeTokens.expirationInterval);
    }
  };

  OneTimeTokens.prototype.sendToUser = async function sendToUser({ transaction }) {
    console.log('Не реализован метод OneTimeTokens.prototype.sendToUser. Отправка уведомления пропущена.');

    // if (this.phone) {
    //   const smsResult = await notifier.sendSms(this.phone, `Код подтверждения: ${this.code}`);
    //   if (smsResult === false) throw new Error('Не удалось отправить смс');
    // } else if (this.email) {
    //   const confirmUrl = new URL(`/token/${this.id}/confirm`, appUrl);
    //   const cancelUrl = new URL(`/token/${this.id}/destroy`, appUrl);
    //   if (!this.payload.name) {
    //     const user = await sequelize.models.users.findOne({ where: { email: this.email }, transaction });
    //     this.payload.name = user.name;
    //   }
    //   const subject = _t(`${this.action}.subject`);
    //   const message = _t(`${this.action}.message`, {
    //     name: this.payload.name,
    //     confirmUrl,
    //     cancelUrl
    //   });
    //
    //   await notifier.sendOuterMail({
    //     to: this.email,
    //     subject,
    //     message,
    //     critical: true
    //   });
    // }
  };

  // OneTimeTokens.startExpiringTokens();
  return OneTimeTokens;
};
