window.addEventListener('DOMContentLoaded', async () => {
  const { onAlertModal } = await import('../utils/utils.js');

  const loginBtn = document.getElementById('login_btn');

  const getEmail = () => {
    return document.getElementById('store_map_email').value;
  };
  const getPW = () => {
    return document.getElementById('store_map_pw').value;
  };

  const onLogin = async () => {
    const email = getEmail();
    const password = getPW();
    const form = { email, password };

    try {
      const res = await axios.post('/api/users/login', form);
      if (res.status === 200) {
        window.location.href = '/stores';
      }
    } catch (error) {
      onAlertModal(`${error.response.data.message}`, 300);
      console.error(error);
    }
  };

  loginBtn.addEventListener('click', onLogin);
});
