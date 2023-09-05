const API_BASE_URL = 'https://storemap.store';

class StoreMapInitAPI {
  constructor() {
    this.widget;
    this.iframe;
    this.productId = iProductNo;
    this.storeMapElm = document.getElementById('storeMap');
    this.L_STORE_MAP_ADDITIONAL_OPT;
    this.productShowCheck();
  }

  geoSuccessCb({ coords, timestamp }) {
    this.widget.coords = { latitude: coords.latitude, longitude: coords.longitude }; // geolocation 값이 iframe에 안넘어가서 따로 받아줌
    this.postMsgWidget();
  }
  geoErrCb(error) {
    this.postMsgWidget();
  }

  setWidget = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/ui`);
      if (res.status === 200) {
        this.widget = res.data;
        if (this.widget.ui === 'distance') {
          navigator.geolocation.getCurrentPosition(this.geoSuccessCb.bind(this), this.geoErrCb.bind(this)); // 위치주소를 받기까지 기다려야 하기때문에 콜백함수 내에서 postMessage 처리
        } else {
          this.postMsgWidget();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  postMsgWidget = async () => {
    const widget = JSON.stringify(this.widget);
    return this.iframe.contentWindow.postMessage({ widget }, '*');
  };

  /**
   * @description 현재 상품이 스토어맵을 사용하는지 여부를 받아옴
   * @returns {Boolean}
   */
  async productShowCheck() {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products/show/${this.productId}/check`);

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

  onAlertModal = (message, height = 60, duration = 1300, color = '#fff', bgColor = '#000') => {
    const body = document.querySelector('body');
    const alertModal = document.createElement('div');
    const alertContent = document.createElement('div');
    alertModal.classList.add('alert_modal');
    alertContent.classList.add('alert_content');

    alertContent.innerText = message;
    alertModal.style.cssText = ` height:${height}px; color:${color}; background-color:${bgColor}`;
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
          this.onAlertModal('매장이 선택 되었습니다!');
        }
      }.bind(this)
    );
  };

  receiveAddrCopyMsg = () => {
    window.addEventListener(
      'message',
      function (e) {
        const { addrCopy } = e.data;
        if (addrCopy) {
          this.onAlertModal('주소가 복사 되었습니다!');
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

  createFrame = async () => {
    this.addStyleSheet();
    this.iframe = document.createElement('iframe');
    this.iframe.style.cssText = 'width:100%; height:50px; border:none;';

    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/kakao-key`);
      if (res.status === 200) {
        this.iframe.src = `${API_BASE_URL}/storemap`;
      }
    } catch (error) {
      console.log(error);
    }
    this.receiveStoresEmpty();
    this.receiveFrameHeight();
    this.receiveTrigger();

    this.storeMapElm.appendChild(this.iframe);

    this.receiveAddrCopyMsg();
  };

  receiveTrigger = () => {
    // iframe 이 성공적으로 생성 되었다면 trigger 보내줌 다시 trigger 를 반환(origin 추출위함)
    window.addEventListener('message', async (e) => {
      if (e.data.trigger) {
        this.postMsgTrigger();
        this.setWidget();
        this.postMsgProductId();
      }
    });
  };

  postMsgProductId = () => {
    if (this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage({ productId: this.productId }, '*');
    }
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
    scriptElm.setAttribute('href', 'https://cdn.jsdelivr.net/gh/developer-hs/storeMap/public/css/stores/store_pickup.css');
    document.body.appendChild(scriptElm);
  };
}

const storeMapInit = async () => {
  new StoreMapInitAPI();
};

window.addEventListener('DOMContentLoaded', () => {
  storeMapInit();
});
