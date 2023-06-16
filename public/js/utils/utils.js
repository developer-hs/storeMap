export const onAlertModal = (message, width = 200, height = 60) => {
  const alertModal = document.querySelector('.alert_modal');
  const alertContent = document.querySelector('.alert_content');
  alertContent.innerText = message;
  alertModal.classList.add('on');
  alertModal.style.width = width + 'px';
  alertModal.style.height = height + 'px';
  setTimeout(() => {
    alertModal.classList.remove('on');
  }, 1300);
};

export const reload = () => {
  window.location.reload();
};

export const confirmCheck = (message) => {
  if (confirm(message) == true) {
    return true;
  } else {
    return false;
  }
};

export const getRootPropertyValue = (propertyName) => {
  // 문서의 루트 요소를 가져옴
  const root = document.documentElement;

  // 계산된 스타일 값을 가져옴
  const computedStyle = getComputedStyle(root);

  // 속성 값을 반환
  return computedStyle.getPropertyValue(propertyName);
};
