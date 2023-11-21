window.addEventListener('DOMContentLoaded', async () => {
  const { onAlertModal } = await import('../utils/utils.js');

  const loginBtn = document.getElementById('loginBtn');

  const getMallId = () => {
    return document.getElementById('storeMapMallID').value;
  };
  const getPW = () => {
    return document.getElementById('storeMapPW').value;
  };
  const getStoreUserID = () => {
    return document.getElementById('storeUserID').value;
  };
  const inputElms = () => {
    return document.querySelectorAll('input');
  };
  const getLoginType = () => {
    return document.querySelector("input[name='loginType']:checked").dataset.type;
  };

  const adminLogin = async (form) => {
    const params = new URLSearchParams(window.location.search);
    const redirectURI = params.get('redirect_uri') || 'stores';
    const res = await axios.post('/api/v1/users/user/admin/login', form);
    if (res.status === 200) {
      window.location.href = `/${redirectURI}`;
    }
  };

  const storeUserLogin = async (form) => {
    const res = await axios.post('/api/v1/users/user/manager/login', form);
    if (res.status === 200) {
      const { storeId } = res.data;
      if (storeId === undefined) return onAlertModal('해당 매장의 계정을 다시 생성해 주세요.');
      const params = new URLSearchParams(window.location.search);
      const redirectURI = params.get('redirect_uri') || `stores/store/manager/${storeId}`;
      window.location.href = `/${redirectURI}`;
    }
  };

  const onLogin = async () => {
    const mallId = getMallId();
    const password = getPW();
    const form = { mallId, password };
    try {
      switch (getLoginType()) {
        case 'admin':
          await adminLogin(form);
          break;
        case 'store':
          form['id'] = getStoreUserID();
          await storeUserLogin(form);
          break;
      }
    } catch (error) {
      if (error.response.data.message) {
        onAlertModal(`${error.response.data.message}`);
      }

      console.error(error);
    }
  };

  const onTypeChange = (targetElment) => {
    const storeUserElms = document.querySelectorAll('.store_disp');
    if (targetElment.dataset.type === 'store') {
      storeUserElms.forEach((storeUserElm) => {
        storeUserElm.classList.remove('displaynone');
      });
    } else {
      storeUserElms.forEach((storeUserElm) => {
        storeUserElm.classList.add('displaynone');
      });
    }
  };

  const typeChangeHandler = () => {
    const typeBtnElms = document.querySelectorAll('.login_type_btn input');
    typeBtnElms.forEach((typeBtnElm) => {
      typeBtnElm.addEventListener('change', () => {
        onTypeChange(typeBtnElm);
      });
    });
    initInputElmsValue();
    document.getElementById('storeMapMallID').value = 'rlagudtjq2016';
    document.getElementById('storeMapPW').value = 'as7315850!';
    document.getElementById('storeUserID').value = 'dev';
  };

  const initInputElmsValue = () => {
    const inputElms = document.querySelectorAll('.form input');
    inputElms.forEach((inputElm) => {
      inputElm.value = '';
    });
  };

  loginBtn.addEventListener('click', onLogin);

  inputElms().forEach((inputElm) => {
    inputElm.addEventListener('keyup', (e) => {
      const key = e.key || e.keyCode;

      if (key === 'Enter' || key === 13) {
        onLogin();
      }
    });
  });

  const loginFormInit = () => {
    typeChangeHandler();
  };

  loginFormInit();
});
