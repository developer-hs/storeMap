window.addEventListener('DOMContentLoaded', async () => {
  const utils = await import('../../utils/utils.js');

  const getStoreId = () => {
    return document.getElementById('storeId').dataset.storeId;
  };

  const onSubmit = async () => {
    try {
      const password = document.getElementById('password').value;
      const form = { password };
      const res = await axios.put(`/users/storeuser/${getStoreId()}`, form);
      console.log(res);
      if (res.status === 201) {
        utils.onAlertModal('성공적으로 저장 되었습니다.');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const submitBtnHandler = () => {
    const submitBtnElm = document.getElementById('submit');

    submitBtnElm.addEventListener('click', onSubmit);
  };

  submitBtnHandler();
});
