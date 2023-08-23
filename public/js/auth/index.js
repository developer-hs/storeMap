const getCodeFromSession = () => {
  return sessionStorage.getItem('mall_id');
};

window.addEventListener('DOMContentLoaded', async () => {
  const param = new URLSearchParams(window.location.search);
  const code = param.get('code');
  const mallId = getCodeFromSession();
  const redirectURI = 'https://storemap.store/cafe24/oauth';

  if (!code) {
    alert('잘못된 접근입니다.');
    window.location.href = 'https://www.cafe24.com/';
  }

  const getAccessToken = async () => {
    const form = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectURI,
    };
    try {
      const res = await axios.post(`/cafe24/oauth/${mallId}`, form);
      if (res.status === 200) {
        window.location.href = '/stores';
      }
    } catch (error) {
      console.error(error);
    }
  };

  getAccessToken();
});
