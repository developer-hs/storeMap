window.addEventListener('DOMContentLoaded', async () => {
  const { onAlertModal } = await import('../utils/utils.js');
  const getSignBtn = () => {
    return document.getElementById('signBtn');
  };

  const getEmailValue = () => {
    return document.getElementById('email').value;
  };

  const getPasswordValue = () => {
    return document.getElementById('password').value;
  };

  const getPlatform = () => {
    const platformElm = document.getElementById('platform');
    return platformElm.options[platformElm.selectedIndex].value;
  };

  const onSign = async () => {
    const email = getEmailValue();
    const password = getPasswordValue();
    const platform = getPlatform();
    try {
      const res = await axios.post('/api/users/register', {
        email,
        password,
        platform,
      });
      if (res.status === 200) {
        window.location.href = '/stores';
      }
    } catch (error) {
      onAlertModal(error.response.data.message);
    }
  };
  const signHandler = () => {
    const signBtn = getSignBtn();
    signBtn.addEventListener('click', onSign);
  };

  const signInit = () => {
    signHandler();
  };

  signInit();
});
