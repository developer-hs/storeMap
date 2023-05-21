import { put } from '../../../utils/api';

const updateBtn = document.getElementById('updateBtn');

/**
 * @returns {String , String , Boolean} - 생성된 주소 문자열
 */
const getDatas = () => {
  let result;
  const storeId = document.getElementById('store').dataset.storeId;
  const storeName = document.getElementById('storeName').value;
  const storeAddr = document.getElementById('storeAddr').value;
  const storeUseStatus = document.getElementById('storeUseStatus').value;
  result = { storeName, storeAddr, storeUseStatus };

  return result;
};

updateBtn.addEventListener('click', () => {
  put(`/stores/${storeId}`);
});
