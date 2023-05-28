const Excel = require('exceljs');

const docs = {};

docs.xlsx = async (filePath) => {
  const workbook = new Excel.Workbook();
  try {
    await workbook.xlsx.readFile(filePath);
    // workbook.eachSheet((worksheet, sheetId) => {
    //   console.log('sheet:', sheetId, worksheet.name)
    // })
  } catch (error) {
    throw error;
  }

  return workbook;
};

module.exports = docs;
