import axios from 'axios';

// API 요청을 위한 기본 설정
const instance = axios.create({
  baseURL: 'http://localhost:8080', // API의 기본 URL 설정
  headers: {
    'Content-Type': 'application/json', // 요청 헤더에 JSON 형식 설정
  },
});

// GET 요청을 보내는 함수
export const get = async (url, params) => {
  try {
    const response = await instance.get(url, { params });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('API 요청 중 오류가 발생했습니다.');
  }
};

// POST 요청을 보내는 함수
export const post = async (url, data) => {
  try {
    const response = await instance.post(url, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('API 요청 중 오류가 발생했습니다.');
  }
};

// PUT 요청을 보내는 함수
export const put = async (url, data) => {
  try {
    const response = await instance.put(url, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('API 요청 중 오류가 발생했습니다.');
  }
};

// DELETE 요청을 보내는 함수
export const remove = async (url) => {
  try {
    const response = await instance.delete(url);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('API 요청 중 오류가 발생했습니다.');
  }
};
