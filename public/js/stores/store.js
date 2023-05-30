window.addEventListener('DOMContentLoaded', () => {
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
    return document.getElementById('store').dataset.storeId;
  };

  /**
   * @returns {String , String , Boolean}
   */
  const getDatas = () => {
    let result;
    const name = document.getElementById('storeName').value;
    const addr = document.getElementById('storeAddr').value;
    let useStatus = document.getElementById('storeUseStatus').checked;

    result = { name, addr, useStatus: useStatus };

    return result;
  };

  /**
   * @returns {HTMLElement}
   */
  const getExcelModalBtn = () => {
    return document.getElementById('excelModalBtn');
  };

  const getExcelUploadModalBg = () => {
    return document.getElementById('excelUploadModalBg');
  };
  /**
   * @returns {HTMLElement}
   */
  const getSubmitBtn = () => {
    return document.getElementById('submitBtn');
  };
  /**
   * @returns {HTMLElement}
   */
  const getexcelUploadBtn = () => {
    return document.getElementById('excelUploadBtn');
  };

  /**
   *
   * @returns {Boolean}
   */
  const getExcelUseStatus = () => {
    return document.getElementById('excelUseStatus').checked;
  };
  /**
   * @description 엑셀을 이용한 여러개의 매장 생성
   * @return {void}
   */

  const createManyHandler = () => {
    storeManyCreate();
  };

  const storeManyCreate = async () => {
    const fileInput = getexcelUploadBtn();
    const file = fileInput.files[0];
    const excelUseStatus = getExcelUseStatus();
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('useStatus', excelUseStatus);

    try {
      const res = await axios.post('/stores/many', formData);
      if (res.status === 200) {
        window.location.href = '/stores';
      }
    } catch (error) {
      console.error(error);
    }
  };

  const storeUpdate = async (form) => {
    try {
      const res = await put(`/stores/store/${getStoreId()}`, form);
      console.log(res.status);
      if (res.status === 200) {
        window.location.href = '/stores';
      }
    } catch (err) {
      console.log(`stores put request err : ${err}`);
    }
  };

  const storeCreate = async (form) => {
    try {
      const res = await post('/stores/store', form);
      if (res.status === 200) {
        window.location.href = '/stores';
      }
    } catch (err) {
      console.log(`store create request err : ${err}`);
    }
  };
  /**
   * @returns {void}
   */

  const submitHandler = () => {
    const form = getDatas();
    for (let key in form) {
      if (!form[key] === '') {
        return;
      }
    }
    if (type === 'u') {
      // update 일 경우
      storeUpdate(form);
    } else if (type === 'c') {
      // 새로 생성할 경우
      storeCreate(form);
    }
  };

  const onSubmit = () => {
    getSubmitBtn().addEventListener('click', submitHandler);
  };

  const storeCreateMany = () => {
    getexcelUploadBtn().addEventListener('change', createManyHandler);
  };

  const openExcelModal = () => {
    getExcelModalBtn().addEventListener('click', () => {
      getExcelUploadModalBg().classList.add('on');
    });
  };

  const closeExcelModal = () => {
    const ExcelUploadModalBg = getExcelUploadModalBg();
    ExcelUploadModalBg.addEventListener('click', (e) => {
      if (e.target !== ExcelUploadModalBg) {
        return;
      }
      ExcelUploadModalBg.classList.remove('on');
    });
  };

  const toggleExcelModal = () => {
    openExcelModal();
    closeExcelModal();
  };
  const init = () => {
    onSubmit();
    storeCreateMany();
    toggleExcelModal();
  };

  init();
});
