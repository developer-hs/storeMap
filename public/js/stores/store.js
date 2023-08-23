window.addEventListener('DOMContentLoaded', async () => {
  const utils = await import('../utils/utils.js');
  const param = new URLSearchParams(window.location.search);
  const type = param.get('type');

  if (!type) {
    alert('잘못된 접근입니다.');
    window.location.href = '/stores';
  }

  /**
   * @returns {String}
   */
  const getStoreId = () => {
    return document.querySelector('.store').id;
  };

  /**
   * @returns {String , String , Boolean}
   */
  const getRequireDatas = () => {
    let result;
    const name = document.getElementById('storeName').value;
    const address = document.getElementById('storeAddr').value;
    let useStatus = document.getElementById('storeUseStatus').checked;

    result = { name, address, useStatus: useStatus };

    return result;
  };

  const getDatas = () => {
    let result;
    const name = document.getElementById('storeName').value;
    const address = document.getElementById('storeAddr').value;
    let useStatus = document.getElementById('storeUseStatus').checked;

    result = { name, address, useStatus: useStatus };

    return result;
  };
  /**
   * @returns {HTMLElement}
   */
  const getExcelModalBtnElm = () => {
    return document.getElementById('excelModalBtn');
  };

  const getExcelUploadModalBgElm = () => {
    return document.getElementById('excelUploadModalBg');
  };
  /**
   * @returns {HTMLElement}
   */
  const getSubmitBtnElm = () => {
    return document.getElementById('submitBtn');
  };
  /**
   * @returns {HTMLElement}
   */
  const getexcelUploadBtnElm = () => {
    return document.getElementById('excelUploadBtn');
  };
  /**
   * @returns {HTMLElement}
   */
  const getCoordBtnElm = () => {
    return document.getElementById('coordBtn');
  };
  /**
   * @returns {HTMLElement}
   */
  const getdeleteBtnElm = () => {
    return document.getElementById('deleteBtn');
  };
  /**
   *
   * @returns {Boolean}
   */
  const getExcelUseStatus = () => {
    return document.getElementById('excelUseStatus').checked;
  };

  const getStoreAddress = () => {
    return document.getElementById('storeAddr').value;
  };
  /**
   * @description 엑셀을 이용한 여러개의 매장 생성
   * @return {void}
   */

  const storeCreateMany = async () => {
    const fileInput = getexcelUploadBtnElm();
    const file = fileInput.files[0];

    if (!file) {
      return;
    }
    const excelUseStatus = getExcelUseStatus();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('useStatus', excelUseStatus);

    try {
      const res = await axios.post(`/stores/many`, formData);
      if (res.status === 200) {
        if (res.data.message) {
          alert(res.data.message);
        }
        window.location.href = '/stores';
      }
    } catch (error) {
      console.error(error);
    }
  };

  const storeUpdate = async (form) => {
    try {
      const res = await axios.put(`/stores/store/${getStoreId()}`, {
        ...form,
      });

      if (res.status === 200) {
        window.location.href = '/stores';
      }
    } catch (err) {
      console.log(`stores put request err : ${err}`);
    }
  };

  const storeCreate = async (form) => {
    try {
      const res = await axios.post('/stores/store', form);

      if (res.status === 200) {
        window.location.href = '/stores';
      }
    } catch (err) {
      utils.onAlertModal(err.response.data.message);
    }
  };
  /**
   * @returns {void}
   */

  const onSubmit = async () => {
    const address = getStoreAddress();

    if (!address) {
      alert('입력하신 주소를 다시 한번 확인해 주세요');
      return;
    }

    const requiredDatas = getRequireDatas();
    for (let key in requiredDatas) {
      if (!requiredDatas[key] === '') {
        return;
      }
    }

    const coord = await getCoord(address);
    console.log(coord);
    if (!coord) {
      alert('입력하신 주소를 다시 한번 확인해 주세요');
      return;
    }

    const form = { ...getDatas(), ...coord };

    if (type === 'u') {
      // update 일 경우
      storeUpdate(form);
    } else if (type === 'c') {
      // 새로 생성할 경우
      storeCreate(form);
    }
  };

  const submitHandler = () => {
    getSubmitBtnElm().addEventListener('click', onSubmit);
  };

  const createManyHandler = () => {
    getexcelUploadBtnElm().addEventListener('change', storeCreateMany);
  };

  const openExcelModal = () => {
    getExcelModalBtnElm().addEventListener('click', () => {
      getExcelUploadModalBgElm().classList.add('on');
    });
  };

  const closeExcelModal = () => {
    const ExcelUploadModalBg = getExcelUploadModalBgElm();
    ExcelUploadModalBg.addEventListener('click', (e) => {
      if (e.target !== ExcelUploadModalBg) {
        return;
      }
      ExcelUploadModalBg.classList.remove('on');
    });
  };

  const getCoord = async (address) => {
    if (!address) {
      return;
    }

    try {
      const res = await axios.get('/stores/geocode', { params: { address } });
      if (res.status === 200) {
        return res.data;
      }
    } catch (error) {
      if (error.response && error.response.status === 502) {
        console.error('네이버에 등록되지 않은 주소', error);
      } else {
        console.error(error);
      }
    }

    return false;
  };

  const onDelete = async () => {
    const res = await axios.delete(`/stores/store/${getStoreId()}`);
    if (res.status === 200) {
      window.location.href = '/stores';
    }
  };

  const coordBtnHandler = () => {
    getCoordBtnElm().addEventListener('click', getCoord);
  };

  const deleteBtnHandler = () => {
    getdeleteBtnElm().addEventListener('click', onDelete);
  };

  const toggleExcelModal = () => {
    openExcelModal();
    closeExcelModal();
  };

  const init = () => {
    if (type === 'c') {
      createManyHandler();
      toggleExcelModal();
    } else if (type === 'u') {
      deleteBtnHandler();
    }
    submitHandler();
  };

  init();
});
