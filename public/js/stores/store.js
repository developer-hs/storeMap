window.addEventListener('DOMContentLoaded', () => {
  const param = new URLSearchParams(window.location.search);
  const type = param.get('type');

  if (!type) {
    alert('잘못된 접근입니다.');
    window.location.href = '/stores';
  }
  const submitBtn = document.getElementById('submitBtn');

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

  submitBtn.addEventListener('click', async () => {
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
  });
});
