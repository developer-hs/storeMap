window.addEventListener('DOMContentLoaded', async () => {
  const URL_PATTERN = /^https:\/\/([^/]+)(\/[^/.]+)*$/;
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
    if (!URL_PATTERN.test(origin)) {
      const dangerColor = getRootPropertyValue('--color-danger');
      getOriginElm().style.borderColor = dangerColor;
    } else {
      const blackColor = getRootPropertyValue('--color-success');
      getOriginElm().style.borderColor = blackColor;
    }
  };

  const onOriginSave = async () => {
    const origin = getOrigin();

    if (!URL_PATTERN.test(origin)) {
      return onAlertModal('도메인 형식을 다시 확인해 주세요.', 250, 60, 2000);
    }
    try {
      const originUpdateForm = {
        origin: origin,
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
    originCheck();
    originHandler();
    originSaveBtnHandler();
  };

  const init = () => {
    mypageInit();
  };

  init();
});
