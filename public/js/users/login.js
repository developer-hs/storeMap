window.addEventListener('DOMContentLoaded', async () => {
  const { onAlertModal } = await import('../utils/utils.js');

  const loginBtn = document.getElementById('login_btn');

  const getMallId = () => {
    return document.getElementById('storeMapMallId').value;
  };
  const getPW = () => {
    return document.getElementById('store_map_pw').value;
  };

  const onLogin = async () => {
    const mallId = getMallId();
    const password = getPW();
    const form = { mallId, password };

    try {
      const res = await axios.post('/api/users/login', form);
      if (res.status === 200) {
        window.location.href = '/stores';
      }
    } catch (error) {
      if (error.response.status === 401) {
        onAlertModal(`${error.response.data.message}`, 420);
      } else {
        onAlertModal(`${error.response.data.message}`, 300);
      }

      console.error(error);
    }
  };

  loginBtn.addEventListener('click', onLogin);
});
