const getMallIdFromSession = () => {
  return sessionStorage.getItem('mall_id');
};

window.addEventListener('DOMContentLoaded', async () => {
  const param = new URLSearchParams(window.location.search);
  const code = param.get('code');
  const mallId = getMallIdFromSession();
  const redirectURI = 'https://storemap.store/cafe24/oauth';

  if (!mallId) {
    alert('성공적으로 다운로드 되었습니다\n다시 접속해 주세요.');
    window.history.go(-4);
  }
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
        window.location.href = '/users/login';
      }
    } catch (error) {
      console.error(error);
    }
  };

  getAccessToken();
});
