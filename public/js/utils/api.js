// API 요청을 위한 기본 설정
const instance = axios.create({
  baseURL: 'http://localhost:8080', // API의 기본 URL 설정
  headers: {
    'Content-Type': 'application/json', // 요청 헤더에 JSON 형식 설정
  },
  withCredentials: true,
});

export // GET 요청을 보내는 함수
const get = async (url, params, callback = null) => {
  try {
    const response = await instance.get(url, { params });
    return response;
  } catch (error) {
    handleError(error, callback);
  }
};

export // POST 요청을 보내는 함수
const post = async (url, data, callback = null) => {
  try {
    const response = await instance.post(url, data);
    return response;
  } catch (error) {
    handleError(error, callback);
  }
};

export // PUT 요청을 보내는 함수
const put = async (url, data, callback = null) => {
  try {
    const response = await instance.put(url, data);
    return response;
  } catch (error) {
    handleError(error, callback);
  }
};

export // DELETE 요청을 보내는 함수
const remove = async (url, callback = null) => {
  try {
    const response = await instance.delete(url);
    return response;
  } catch (error) {
    handleError(error, callback);
  }
};

export // 오류 처리 함수
const handleError = (error, callback) => {
  if (callback) {
    callback(error);
  } else {
    console.error(error);
    throw new Error('API 요청 중 오류가 발생했습니다.');
  }
};
