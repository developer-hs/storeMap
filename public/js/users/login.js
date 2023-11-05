window.addEventListener('DOMContentLoaded', async () => {
  const { onAlertModal } = await import('../utils/utils.js');

  const loginBtn = document.getElementById('login_btn');

  const getMallId = () => {
    return document.getElementById('storeMapMallId').value;
  };
  const getPW = () => {
    return document.getElementById('store_map_pw').value;
  };
  const inputElms = () => {
    return document.querySelectorAll('input');
  };

  const onLogin = async () => {
    const mallId = getMallId();
    const password = getPW();
    const form = { mallId, password };
    const params = new URLSearchParams(window.location.search);
    const redirectURI = params.get('redirect_uri') || 'stores';

    try {
      const res = await axios.post('/api/v1/users/user/login', form);
      if (res.status === 200) {
        window.location.href = `/${redirectURI}`;
      }
    } catch (error) {
      if (error.response.status === 401) {
        onAlertModal(`${error.response.data.message}`);
      } else {
        onAlertModal(`${error.response.data.message}`);
      }

      console.error(error);
    }
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
});
