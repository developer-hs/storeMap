import path from 'path';
export const __dirname = path.resolve();

export const removeDuplicates = (arr1, arr2) => {
  let combined = arr1.concat(arr2); // 두 배열을 결합

  // 각 객체를 문자열로 변환하고 중복을 제거
  let unique = Array.from(new Set(combined.map(JSON.stringify))).map(
    JSON.parse
  );

  return unique;
};
