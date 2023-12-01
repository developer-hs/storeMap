export const onAlertModal = (message, width = 'max-content', height = 60, duration = 1300, bgColor = '#353535', color = '#fff') => {
  const body = document.querySelector('body');
  const alertModal = document.createElement('div');
  const alertContent = document.createElement('div');
  alertModal.classList.add('alert_modal');
  alertContent.classList.add('alert_content');

  alertContent.innerText = message;
  if (parseInt(width)) {
    width = String(width) + 'px';
  }
  alertModal.style.cssText = `width:${width}; height:${height}px; background-color:${bgColor};`;
  alertContent.style.color = color;
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

export const encodeUnicode = (str) => {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
    })
  );
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
  const guardChildsHTML = [`<i class="xi-spinner-2 xi-spin"></i>`, `<div>로딩중 입니다.</div>`].join('');

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

export const emailIsValid = (email) => {
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return EMAIL_PATTERN.test(email);
};

export const originIsValid = (origin) => {
  const URL_PATTERN = /^https:\/\/([^/]+)(\/[^/.]+)*$/;
  return URL_PATTERN.test(origin);
};

export const passwordIsValid = (password) => {
  // 비밀번호를 검증할 정규식 패턴
  const pattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // 정규식 패턴과 비밀번호를 비교하여 검증 결과 반환
  return pattern.test(password);
};

/**
 *
 * @param {HTMLElement} elm
 * @returns {Void}
 */
export const logoutHandler = (elm) => {
  const logoutBtn = elm || document.getElementById('logoutBtn');

  if (!logoutBtn) return;

  const logout = async () => {
    try {
      const res = await axios.post('/api/v1/users/user/logout');
      if (res.status === 200 && res.data.ok) {
        location.href = '/users/login';
      }
    } catch (error) {
      console.error(error);
    }
  };

  logoutBtn.addEventListener('click', logout);
};

export const styleSectionToggleInit = () => {
  const sectionCtElms = document.querySelectorAll('.section_ct.fold');
  sectionCtElms.forEach((sectionCtElm) => {
    const sectionTitle = sectionCtElm.querySelector('.section_title');
    const sectionStyle = getComputedStyle(sectionCtElm.querySelector('.section'));
    const sectionContent = sectionCtElm.querySelector('.section_content');
    const sectionMargin = parseInt(sectionStyle.margin.split(' ')[0].replace('px', ''));
    const sectionPadding = parseInt(sectionStyle.padding.split(' ')[0].replace('px', ''));
    const sectionHeight = parseInt(sectionStyle.height.replace('px', ''));
    sectionTitle.addEventListener('click', () => {
      if (sectionCtElm.classList.contains('tab_on')) {
        sectionCtElm.classList.remove('tab_on');
        slideUp(sectionContent, 300);
      } else {
        const sectionContentHeight =
          (sectionMargin + sectionHeight + sectionPadding) * sectionContent.querySelectorAll('.section:not(.displaynone)').length +
          sectionMargin;

        sectionCtElm.classList.add('tab_on');
        slideDown(sectionContent, sectionContentHeight, 300);
      }
    });
  });
};
