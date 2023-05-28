/*
 * Для запуска сидера введите команду:
 * yarn cli-dev:api seed 20230528163620-fill-excel-data
 * yarn cli:api seed 20230528163620-fill-excel-data
 */
import path from 'path';
import { getDatabase } from '@innoagency-arenda/database';
import docs from '@innoagency-arenda/docs';

const debug = (message) => console.log('seed:seeding:20230528163620-fill-excel-data', message);
const { models, sequelize, Sequelize } = getDatabase();
const { fn } = Sequelize;
const { objects } = models;

export async function seed() {
  debug('Database seeding started');

  const transaction = await sequelize.transaction();

  const parseWorkTime = (str) => {
    const daysMap = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

    const clearTime = (str, lastTime = false) => {
      const regex = /(\d)(\d).*/;
      const [_, firstDigit, secondDigit] = str.match(regex);

      if (!+firstDigit) {
        if (+secondDigit === 0) return lastTime ? 24 : 1;
        return +secondDigit;
      }
      return +`${firstDigit}${secondDigit}`;
    };

    str = str.trim();

    if (/круглосуточно/.test(str)) {
      // return Infinity;
      return Array(7)
        .fill(null)
        .map(() => [1, 24]);
    }

    const regex1 = /^(\d\d:\d\d).*(\d\d:\d\d)$/;
    const regex1Matches = str.match(regex1);
    if (regex1Matches) {
      return Array(7)
        .fill(null)
        .map(() => [clearTime(regex1Matches[1]), clearTime(regex1Matches[2], true)]);
    }

    const readyToRegexDaysMap = `(${daysMap.join('|')})`;
    const regex2 = new RegExp(
      `^((\\d)?\\d:\\d\\d).*(\\d\\d:\\d\\d)\\s*\\(${readyToRegexDaysMap}\\s*и?\\s*${readyToRegexDaysMap}?.*выходн(ой|ые)\\)`
    );
    const regex2Matches = str.match(regex2);
    if (regex2Matches) {
      const firstIdxSkip = daysMap.findIndex((item) => item === regex2Matches[4]?.toLowerCase() || '');
      const secondIdxSkip = daysMap.findIndex((item) => item === regex2Matches[5]?.toLowerCase() || '');

      const firstTime = regex2Matches[2] ? regex2Matches[1] : '0' + regex2Matches[1];
      const secondTime = regex2Matches[3];

      return Array(7)
        .fill(null)
        .map((_, idx) => {
          // FIXME: Вернуть эту проверку, т.к. она заполняет пустым массивом нерабочие дни
          // if ([firstIdxSkip, secondIdxSkip].includes(idx)) return [];
          return [clearTime(firstTime), clearTime(secondTime, true)];
        });
    }

    return [];
  };

  try {
    const filePath = path.resolve(__dirname, 'data/площадки АКИ.xlsx');
    const workbook = await docs.xlsx(filePath);

    const objectsData = [];

    const worksheet = workbook.worksheets[0];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;

      const getVal = (idx) => row.getCell(idx).value;

      let [name, description, address, workTime, phone, email, url] = [
        getVal(2), // Наименование объекта
        getVal(4), // Краткое описание
        getVal(5), // Адрес
        getVal(6), // Режим работы
        getVal(7), // Номер телефона
        getVal(8), // Электронная почта
        getVal(9) // Сайт
      ];
      workTime = parseWorkTime(workTime);
      name = name.trim();
      url = url?.hyperlink || url;

      objectsData.push({
        status: 3, // STATUS_CONFIRMED
        payload: { name, description, address, workTime, phone, email, url }
      });
    });

    await objects.bulkCreate(objectsData, { transaction });

    await transaction.commit();
    debug('Database seeding completed.');
  } catch (error) {
    await transaction.rollback();
    debug(`Seeding failed ${error.message} (detail: ${error.parent && error.parent.detail})`);
    throw error;
  }
}
