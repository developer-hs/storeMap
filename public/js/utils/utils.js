export const onAlertModal = (message, width = 200, height = 60) => {
  const body = document.querySelector('body');
  const alertModal = document.createElement('div');
  const alertContent = document.createElement('div');
  alertModal.classList.add('alert_modal');
  alertContent.classList.add('alert_content');

  alertContent.innerText = message;
  alertModal.style.cssText = `width:${width}px; height:${height}px`;
  alertModal.appendChild(alertContent);
  body.appendChild(alertModal);

  setTimeout(() => {
    alertModal.classList.add('on');
  }, 100);

  setTimeout(() => {
    alertModal.classList.remove('on');
  }, 1300);

  setTimeout(() => {
    alertModal.remove();
  }, 1500);
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
