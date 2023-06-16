window.addEventListener('DOMContentLoaded', async () => {
  const { getRootPropertyValue, onAlertModal, reload } = await import(
    '../utils/utils.js'
  );

  const getOriginElm = () => {
    return document.getElementById('domain');
  };

  const getOrigin = () => {
    return getOriginElm().value;
  };

  const getOriginSaveBtnElm = () => {
    return document.getElementById('originSaveBtn');
  };

  const originCheck = () => {
    const origin = getOrigin();
    if (!origin) {
      const dangerColor = getRootPropertyValue('--color-danger');
      getOriginElm().style.borderColor = dangerColor;
    } else {
      const blackColor = getRootPropertyValue('--color-black');
      getOriginElm().style.borderColor = blackColor;
    }
  };

  const onOriginSave = async () => {
    try {
      const originUpdateForm = {
        origin: getOrigin(),
      };
      const res = await axios.put('/users/origin', originUpdateForm);
      if (res.status === 200) {
        onAlertModal('성공적으로 도메인이 등록되었습니다.', 300);
      }
    } catch (error) {
      onAlertModal(error.response.data.message);
      console.error(error);
    }
  };

  const originHandler = () => {
    const originElm = getOriginElm();
    originElm.addEventListener('input', originCheck);
  };

  const originSaveBtnHandler = () => {
    getOriginSaveBtnElm().addEventListener('click', onOriginSave);
  };

  const mypageInit = () => {
    originHandler();
    originSaveBtnHandler();
  };

  const init = () => {
    mypageInit();
  };

  init();
});
