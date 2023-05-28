const phoneReplacer = (firstGroup, secondGroup, thirdGroup, fourthGroup) => {
  return `+7 (${firstGroup}) ${secondGroup}-${thirdGroup}-${fourthGroup}`;
};

const normalizeMobile = (value, withPlus = false) =>
  !!value ? value.replace(/\D/g, '').replace(/^(\+?7|8)?(9\d{9})$/i, `${withPlus ? '+' : ''}7$2`) : value;

const normalizePhone = (value, withPlus = false) =>
  !!value ? value.replace(/\D/g, '').replace(/^(\+?7|8)?(\d{10})$/i, `${withPlus ? '+' : ''}7$2`) : value;

const denormalizeMobile = (value) => {
  const normalized = normalizeMobile(value);
  const [_, firstGroup, ...groups] = normalized.match(/^79(\d{2})(\d{3})(\d{2})(\d{2})$/);

  return phoneReplacer(`9${firstGroup}`, ...groups);
};

const denormalizePhone = (value) => {
  const normalized = normalizeMobile(value);
  const [_, ...groups] = normalized.match(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/);

  return phoneReplacer(...groups);
};

const moneyFormat = (value, defaultValue = null, strict = true) => {
  const numberizedValue = +value;
  if (strict) {
    if (!numberizedValue) return defaultValue;
  } else {
    if (isNaN(numberizedValue)) return defaultValue;
  }

  const intl = new Intl.NumberFormat('ru', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currencyDisplay: 'symbol'
  });

  return intl.format(numberizedValue);
};

/**
 *
 * @param {string} name
 *
 * @return {string}
 */
const extension = (name) => name.toLowerCase().split('.').pop();

module.exports = { normalizePhone, normalizeMobile, denormalizeMobile, denormalizePhone, moneyFormat, extension };
