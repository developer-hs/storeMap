export const onAlertModal = (
  message,
  width = 200,
  height = 60,
  duration = 1300
) => {
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
  }, duration);

  setTimeout(() => {
    alertModal.remove();
  }, duration + 200);
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

export const createLoadingGaurd = () => {
  const loadingGuard = document.createElement('div');
  loadingGuard.classList.add('loading_guard');
  const guardChildsHTML = [
    `<i class="xi-spinner-2 xi-spin"></i>`,
    `<div>로딩중 입니다.</div>`,
  ].join('');

  loadingGuard.innerHTML += guardChildsHTML;

  return loadingGuard;
};

export const paintLoadingGuard = (loadingGuard) => {
  const contentElm = document.getElementById('content');
  contentElm.prepend(loadingGuard);
};

export const removeLoadingGuard = (loadingGuard) => {
  loadingGuard.remove();
};

export const slideUp = (element, duration) => {
  element.style.transitionProperty = 'height, margin, padding';
  element.style.transitionDuration = duration + 'ms';
  element.style.height = element.offsetHeight + 'px';
  element.offsetHeight; // 리플로우 강제 발생
  element.style.overflow = 'hidden';

  element.style.height = '0';
  element.style.paddingTop = '0';
  element.style.paddingBottom = '0';
  element.style.marginTop = '0';
  element.style.marginBottom = '0';

  setTimeout(function () {
    element.style.removeProperty('padding-top');
    element.style.removeProperty('padding-bottom');
    element.style.removeProperty('margin-top');
    element.style.removeProperty('margin-bottom');
    element.style.removeProperty('transition-duration');
    element.style.removeProperty('transition-property');
  }, duration);
};

export const slideDown = (element, height, duration) => {
  element.style.transitionProperty = 'height, margin, padding';
  element.style.transitionDuration = duration + 'ms';
  element.style.overflow = 'hidden';
  element.style.height = height + 'px';

  setTimeout(function () {
    element.style.removeProperty('overflow');
  }, duration);
};
