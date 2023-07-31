const API_BASE_URL = 'https://storemap-389307.du.r.appspot.com';

class StoreMapInitAPI {
  constructor() {
    this.productId = iProductNo;
    this.storeMapElm = document.getElementById('storeMap');
    this.L_STORE_MAP_ADDITIONAL_OPT;
    this.productShowCheck();
  }
  /**
   * @description 현재 상품이 스토어맵을 사용하는지 여부를 받아옴
   * @returns {Boolean}
   */
  async productShowCheck() {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products/show/${this.productId}/check`, {
        params: { origin: window.location.origin },
      });

      if (res.status === 200) {
        if (res.data.ok) this.setStoreMapAdditionalOpt();
        else return;
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
    const prdOptChildElms = document.querySelectorAll('.xans-product-option .xans-product-addoption');

    for (let i = 0; i < prdOptChildElms.length; i++) {
      if (prdOptChildElms[i].innerHTML.indexOf('스토어픽업') !== -1) {
        prdOptChildElms[i].style.cssText = 'position:absolute; top:-100%; left:-100%; opacity:0; visibility:hidden';
        const storeOptElm = prdOptChildElms[i].querySelector("input[id*='add_option']");
        this.L_STORE_MAP_ADDITIONAL_OPT = storeOptElm;
        this.receiveOptValue();
      }
    }

    if (!this.L_STORE_MAP_ADDITIONAL_OPT) {
      console.error('카페24 태그 구조가 변경되어서 스토어 맵 앱을 실행할 수 없습니다.\n rlagudtjq2016@naver.com으로 문의하시길 바랍니다.');
    } else {
      this.createFrame();
    }
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
    body.prepend(alertModal);

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

  receiveOptValue = () => {
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

  receiveFrameHeight = () => {
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
    this.addStyleSheet();

    this.iframe = document.createElement('iframe');
    this.iframe.src = `${API_BASE_URL}/store_pickup.html`;
    this.iframe.style.cssText = 'width:100%; height:50px; border:none;';
    this.iframe.allow = `geolocation 'self' ${window.location.origin}`;
    this.receiveStoresEmpty();
    this.receiveFrameHeight();
    this.receiveTrigger();

    this.storeMapElm.appendChild(this.iframe);
  };

  receiveTrigger = () => {
    // iframe 에서 성공적으로 initialize 되었다면 trigger 를 반환하여 postMsgTrigger 실행
    window.addEventListener('message', (e) => {
      if (e.data.trigger) {
        this.postMsgTrigger();
      }
    });
  };

  postMsgTrigger = () => {
    // iframe 안에서 origin 을 받기위한 postMessage
    if (this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage({ trigger: true }, '*');
    }
  };

  receiveStoresEmpty = () => {
    // iframe 에서 상품 리스트가 비었다면 empty 전송 iframe 제거
    window.addEventListener(
      'message',
      function (e) {
        if (e.data.empty) {
          this.iframe.remove();
        }
      }.bind(this)
    );
  };

  addStyleSheet = () => {
    const scriptElm = document.createElement('link');
    scriptElm.setAttribute('rel', 'stylesheet');
    scriptElm.setAttribute('type', 'text/css');
    scriptElm.setAttribute('href', 'https://cdn.jsdelivr.net/gh/gygy2006/storeMap/public/css/stores/store_pickup.css');
    document.body.appendChild(scriptElm);
  };
}

const storeMapInit = async () => {
  new StoreMapInitAPI();
};

window.addEventListener('DOMContentLoaded', () => {
  storeMapInit();
});
