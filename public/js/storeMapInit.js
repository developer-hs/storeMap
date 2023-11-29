const API_BASE_URL = 'https://storemap.store';

class StoreMapInitAPI {
  constructor(elm) {
    this.storeMapElm = elm;
    this.widgets;
    this.iframe;
    this.productId = iProductNo;
    this.optType = 'common'; // common : 일반적인 추가옵션 기능을 가지고있는 쇼핑몰 , observe : 필수 or 선택 옵션이 존재할 경우 옵션을 선택해야 추가옵션이 나오는 쇼핑몰
    this.L_STORE_MAP_ADDITIONAL_OPT;
    this.productShowCheck();
  }

  geoSuccessCb({ coords, timestamp }) {
    this.widgets.widget.coords = { latitude: coords.latitude, longitude: coords.longitude }; // geolocation 값이 iframe에 안넘어가서 따로 받아줌
    this.postMsgWidget();
  }
  geoErrCb(error) {
    this.postMsgWidget();
  }

  setWidget = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/users/ui`);

      if (res.status === 200) {
        this.widgets = res.data;
        if (this.widgets.widget.ui === 'distance') {
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
    const widgets = JSON.stringify(this.widgets);
    return this.iframe.contentWindow.postMessage({ widgets }, '*');
  };

  /**
   * @description 현재 상품이 스토어맵을 사용하는지 여부를 받아온 후 추가옵션 체크
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
   * @description 실제 쇼핑몰에서 스토어맵 옵션에 해당하는 엘리먼트를 지정한 뒤 Iframe 생성
   */
  setStoreMapAdditionalOpt = () => {
    const prdOptChildElms = document.querySelectorAll('.xans-product-option .xans-product-addoption');

    for (let i = 0; i < prdOptChildElms.length; i++) {
      if (prdOptChildElms[i].innerHTML.includes('스토어픽업')) {
        prdOptChildElms[i].style.cssText = 'position:absolute; top:-100%; left:-100%; opacity:0; visibility:hidden';
        const storeOptElm = prdOptChildElms[i].querySelector("input[id*='add_option']");
        this.L_STORE_MAP_ADDITIONAL_OPT = storeOptElm;
      }
    }

    this.receiveOptValue();

    if (!this.L_STORE_MAP_ADDITIONAL_OPT) {
      this.optType = 'observe';
      this.createFrame();
      const bodyObv = new MutationObserver((mutations) => {
        const addOptionElms = document.querySelectorAll("input[id*='add_option']");
        addOptionElms.forEach((addOptionElm) => {
          const tbody = addOptionElm.parentNode.parentNode.parentNode;
          if (tbody.tagName === 'TBODY') {
            // 기본적인 CAFE24 코드에 변화가 없다면 tobdy tag(추가옵션을 담고있는 tbody)
            const trElms = tbody.querySelectorAll('tr'); // 추가옵션들을 가져옴
            for (const trElm of trElms) {
              // 추가옵션들을 순회
              const thElm = trElm.querySelector('th');
              if (thElm.innerText.includes('스토어픽업')) {
                // 추가옵션명에 스토어픽업 이 들어있다면
                trElm.style.cssText = 'position:absolute; left:0; top:0; visibility:hidden; opacity:0;'; // 스토어픽업 tr 태그를 숨김
                if (trElms.length === 1 && tbody.parentNode.parentNode.parentNode.tagName === 'TR') {
                  // 추가옵션이 스토어픽업이고, 다른 추가옵션이 존재하지 않고, CAFE24 코드에 변화가 없다면(tr tag)
                  tbody.parentNode.parentNode.parentNode.style.cssText =
                    'opacity: 0; visibility: hidden; position:absolute; left:0; top :0;'; // 추가옵션 태그를 숨김
                }
              }
            }
          } else {
            console.error(
              '카페24 태그 구조가 변경되어서 스토어 맵 앱을 실행할 수 없습니다.\n utilityapp@naver.com으로 문의하시길 바랍니다.'
            );
          }
        });
      });

      bodyObv.observe(document.body, {
        childList: true,
        subtree: true,
      });
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
    alertModal.style.cssText = `position: fixed; z-index: 2147483647; left: 50%; top: -100px; transform: translate3d(-50%, 0, 0); display: flex; justify-content: center; align-items: center; border-radius: 10px; box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.15); transition: all 0.5s ease; padding: 0 30px; height:${height}px; color:${color}; background-color:${bgColor};`;
    alertModal.appendChild(alertContent);
    body.prepend(alertModal);

    setTimeout(() => {
      alertModal.classList.add('on');
      alertModal.style.top = '50px';
    }, 100);

    setTimeout(() => {
      alertModal.classList.remove('on');
      alertModal.style.top = '-100px';
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
          switch (this.optType) {
            case 'common':
              this.L_STORE_MAP_ADDITIONAL_OPT.value = storeMapOptValue;
              break;
            case 'observe':
              const setOptValue = () => {
                const addOptionElms = document.querySelectorAll("input[id*='add_option']");
                addOptionElms.forEach((addOptionElm) => {
                  addOptionElm.value = storeMapOptValue;
                });
              };

              setOptValue();

              const bodyObv = new MutationObserver((mutations) => {
                setOptValue();
              });

              bodyObv.observe(document.body, {
                childList: true,
                subtree: true,
              });
              break;
          }

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
        const { addrCopy, address } = e.data;
        if (addrCopy) {
          window.navigator.clipboard.writeText(address);
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
    this.iframe = document.createElement('iframe');
    this.iframe.style.cssText = 'width:100%; height:50px; border:none;';

    try {
      const res = await axios.get(`${API_BASE_URL}/storemap/iframe`);
      if (res.status === 200) {
        this.iframe.src = res.data;
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
        await this.setWidget();
        this.postMsgTrigger();
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
}

const storeMapInit = (elm) => {
  new StoreMapInitAPI(elm);
};

storeMapInit(storeMap);
