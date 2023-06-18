const getCodeFromSession = () => {
  return sessionStorage.getItem('mall_id');
};

window.addEventListener('DOMContentLoaded', async () => {
  const param = new URLSearchParams(window.location.search);
  const mallId = param.get('mall_id') || getCodeFromSession();
  const code = param.get('code');
  const redirectURI = 'https://storemap-389307.du.r.appspot.com/users/login';

  if (!mallId && !code) {
    alert('잘못된 접근입니다.');
    window.location.href = 'https://www.cafe24.com/';
  }

  if (mallId) {
    sessionStorage.setItem('mall_id', mallId);
  }

  const getAuthCode = () => {
    window.location.href = `https://${mallId}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=eFYBhLMOCSGAFEuw4IIZOF&state=MTIzNDU2Nzg=&redirect_uri=${redirectURI}&scope=mall.read_application,mall.write_application,mall.read_product,mall.write_product`;
  };

  const getAccessToken = async () => {
    const form = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectURI,
    };
    console.log(form);
    console.log(mallId);

    try {
      const res = axios.post(`/cafe24/oauth/${mallId}`, form);
      if (res.status === 200) {
        console.log(res);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (code && mallId) {
    getAccessToken();
  } else if (mallId) {
    getAuthCode();
  }
});
