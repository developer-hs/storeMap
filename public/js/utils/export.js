export const exportExcel = (data) => {
  // step 1. workbook 생성
  const wb = XLSX.utils.book_new();

  // step 2. 시트 만들기
  const newWorksheet = excelHandler.getWorksheet(data);

  // step 3. workbook에 새로만든 워크시트에 이름을 주고 붙인다.
  XLSX.utils.book_append_sheet(wb, newWorksheet, excelHandler.getSheetName());

  // step 4. 엑셀 파일 만들기
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

  // step 5. 엑셀 파일 내보내기

  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), excelHandler.getExcelFileName());
};
const excelHandler = {
  getExcelFileName: function () {
    return 'store_list.xlsx';
  },
  getSheetName: function () {
    return 'store_list';
  },
  /**
   *
   * @param {Array[Array]} data
   * @returns
   */
  getExcelData: function (data) {
    return [['name', 'address'], ...data];
  },
  getWorksheet: function (data) {
    return XLSX.utils.aoa_to_sheet(this.getExcelData(data));
  },
};
const s2ab = (s) => {
  const buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
  const view = new Uint8Array(buf); //create uint8array as viewer
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
  return buf;
};
