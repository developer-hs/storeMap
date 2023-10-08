window.addEventListener('DOMContentLoaded', async () => {
  const URL_PATTERN = /^https:\/\/(([A-Za-z0-9-가-힣]{1,63}\.)+([A-Za-z0-9-가-힣]+))[^\/]$/;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const { getRootPropertyValue, onAlertModal, reload } = await import('../utils/utils.js');

  const getOrigin = () => {
    return getOriginElm().value;
  };
  const getID = () => {
    return document.getElementById('id').value;
  };
  const getPW = () => {
    return document.getElementById('password').value;
  };
  const getName = () => {
    return document.getElementById('name').value;
  };
  const getEmail = () => {
    return getEmailElm().value;
  };
  const getOriginElm = () => {
    return document.getElementById('domain');
  };

  const getSubmitBtnElm = () => {
    return document.getElementById('submit');
  };
  const getEmailElm = () => {
    return document.getElementById('email');
  };

  const setNotValidStyle = (elm) => {
    const dangerColor = getRootPropertyValue('--color-danger');
    elm.style.borderColor = dangerColor;
    elm.nextElementSibling.style.color = dangerColor;
  };

  const setValidStyle = (elm) => {
    const greyColor = getRootPropertyValue('--color-grey');
    const blackColor = getRootPropertyValue('--color-black');
    elm.style.borderColor = greyColor;
    elm.nextElementSibling.style.color = blackColor;
  };

  const originCheck = () => {
    const origin = getOrigin();
    if (URL_PATTERN.test(origin)) {
      setValidStyle(getOriginElm());
    } else {
      setNotValidStyle(getOriginElm());
    }
  };

  const emailCheck = () => {
    const email = getEmail();

    if (EMAIL_PATTERN.test(email)) {
      setValidStyle(getEmailElm());
    } else {
      setNotValidStyle(getEmailElm());
    }
  };

  const formIsValid = () => {
    if (!EMAIL_PATTERN.test(getEmail())) {
      return { ok: false, message: '이메일을 다시 확인해 주세요.' };
    }
    if (!URL_PATTERN.test(getOrigin())) {
      return { ok: false, message: '도메인을 다시 확인해 주세요.' };
    }
    return { ok: true };
  };

  const onSave = async () => {
    const validChk = formIsValid();

    if (!validChk.ok) {
      return onAlertModal(validChk.message);
    }
    const data = {
      form: { origin: getOrigin(), email: getEmail(), name: getName() },
      password: getPW(),
    };

    try {
      const res = await axios.put('/api/v1/users/user', data);
      if (res.status === 201) {
        onAlertModal(res.data.message);
      }
    } catch (error) {
      console.error(error);
      onAlertModal(error.response.data.message);
    }
  };

  const onSaveHandler = () => {
    getSubmitBtnElm().addEventListener('click', onSave);
  };

  const emailHandler = () => {
    emailCheck();
    const emailElm = getEmailElm();
    emailElm.addEventListener('input', emailCheck);
  };

  const originHandler = () => {
    originCheck();
    const originElm = getOriginElm();
    originElm.addEventListener('input', originCheck);
  };

  const mypageInit = () => {
    emailHandler();
    originHandler();
    onSaveHandler();
  };

  const init = () => {
    mypageInit();
  };

  init();
});
