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
    await axios
      .post('/api/users/login', form)
      .then((res) => {
        return (window.location.href = '/stores');
      })
      .catch((err) => {
        onAlertModal('잘못된 비밀번호 입니다.');
        console.error(err);
      });
  };

  loginBtn.addEventListener('click', onLogin);
});
