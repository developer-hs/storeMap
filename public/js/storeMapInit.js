const API_BASE_URL = 'https://storemap-389307.du.r.appspot.com';

class StoreMapInitAPI {
  constructor() {
    this.productId = iProductNo;
    this.L_STORE_MAP_ADDITIONAL_OPT;
    this.setStoreMapAdditionalOpt();
  }
  /**
   * @description 현재 상품이 스토어맵을 사용하는지 여부를 받아옴
   * @returns {Boolean}
   */
  async productShowCheck() {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products/show/${this.productId}/check`);
      if (res.status === 200) {
        return res.data.ok;
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @description 실제 쇼핑몰에서 스토어맵 옵션에 해당하는 옵션 엘리먼트를 가져옴
   * @returns {HTMLElement?}
   */
  setStoreMapAdditionalOpt = () => {
    const prdOptChildElms = document.querySelector('.xans-product-option .xans-product-addoption').children;

    for (let i = 0; i < prdOptChildElms.length; i++) {
      if (prdOptChildElms[i].innerText === '삭제시[스토어_픽업_앱]에서_OFF_권장[필수]') {
        // prdOptChildElms[i].parentNode.style.cssText = 'position:absolute; top:-100%; left:-100%; opacity:0; visibility:hidden';
        const storeOptElm = prdOptChildElms[i].nextElementSibling.querySelector("input[id*='add_option']");
        this.L_STORE_MAP_ADDITIONAL_OPT = storeOptElm;
        this.recieveOptValue();
      }
    }

    if (!this.L_STORE_MAP_ADDITIONAL_OPT) {
      console.error('카페24 태그 구조가 변경되어서 스토어 맵 앱을 실행할 수 없습니다.\n rlagudtjq2016@naver.com으로 문의하시길 바랍니다.');
      return;
    }

    return undefined;
  };

  onAlertModal = (message, width = 200, height = 60, duration = 1300, color = '#fff', bgColor = '#000') => {
    const body = document.querySelector('body');
    const alertModal = document.createElement('div');
    const alertContent = document.createElement('div');
    alertModal.classList.add('alert_modal');
    alertContent.classList.add('alert_content');

    alertContent.innerText = message;
    alertModal.style.cssText = `width:${width}px; height:${height}px; color:${color}; background-color:${bgColor}`;
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

  postMsgCurrentScrY = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    this.iframe.contentWindow.postMessage({ scrollY }, '*');
  };

  recieveOptValue = () => {
    window.addEventListener(
      'message',
      function (e) {
        const { storeMapOptValue } = e.data;
        if (storeMapOptValue) {
          this.L_STORE_MAP_ADDITIONAL_OPT.value = storeMapOptValue;
          this.postMsgCurrentScrY();
          this.onAlertModal('매장이 선택 되었습니다!', 220);
        }
      }.bind(this)
    );
  };

  recieveFrameHeight = () => {
    window.addEventListener(
      'message',
      function (e) {
        const { height } = e.data;
        if (height) {
          this.iframe.style.height = height + 'px';
        }
      }.bind(this)
    );
  };

  createFrame = () => {
    this.iframe = document.createElement('iframe');
    this.iframe.src = `${API_BASE_URL}/store_pickup.html`;
    this.iframe.style.cssText = 'width:100%; height:auto; border:none;';
    this.recieveFrameHeight();
  };
}

const storeMapInit = async () => {
  const storeMapInitAPI = new StoreMapInitAPI();
  const showCheck = await storeMapInitAPI.productShowCheck();

  if (!showCheck) {
    return;
  }

  try {
    storeMapInitAPI.createFrame();
    const storeMap = document.getElementById('storeMap');
    storeMap.appendChild(storeMapInitAPI.iframe);
  } catch (error) {
    console.error(error);
  }
};

window.addEventListener('DOMContentLoaded', () => {
  storeMapInit();
});
