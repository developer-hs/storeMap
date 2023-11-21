import path from 'path';
import { SECURE } from '../app/config/index.js';

export const __dirname = path.resolve();

export const removeDuplicates = (arr1, arr2) => {
  let combined = arr1.concat(arr2); // 두 배열을 결합

  // 각 객체를 문자열로 변환하고 중복을 제거
  let unique = Array.from(new Set(combined.map(JSON.stringify))).map(JSON.parse);

  return unique;
};

export const setToken = async (res, user, accessToken, refreshToken) => {
  res.cookie('ac', accessToken, {
    httpOnly: true,
    secure: SECURE,
    // 예: secure: true (HTTPS 연결에서만 전송)
  });

  res.cookie('rt', refreshToken, {
    httpOnly: true,
    secure: SECURE,
    // 다른 쿠키 옵션들 설정
    // 예: secure: true (HTTPS 연결에서만 전송)
  });

  user.refresh_token = refreshToken;
};

export const setCafe24Token = async (res, user, accessToken, refreshToken) => {
  user.cafe24_refresh_token = refreshToken;

  res.cookie('cafe24_ac', accessToken, {
    httpOnly: true,
    secure: true,
    expires: new Date(Date.now() + 7200000), // 2시간
  });

  res.cookie('cafe24_rt', refreshToken, {
    httpOnly: true,
    secure: true,
    expires: new Date(Date.now() + 3600000 * 48), // 2일
  });

  return { ok: true, message: '성공적으로 저장 되었습니다.' };
};
