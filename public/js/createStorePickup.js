const L_HEIGHT = 80;
const API_BASE_URL = 'https://storemap.store';

let L_GEOLOCATION_WIDGET = Boolean,
  L_STORE_LIST = [],
  L_SHOWING_INFOWINDOW,
  L_USER_NAVER_COORD,
  L_SCROLL_Y,
  L_NORMAL_MARKER_IMG,
  L_NOW_MARKER_IMG;

let PREV_MARKER, L_MAP;

let userMarkers = [];

const initLatLng = new naver.maps.LatLng(37.3595316, 127.1052133);
const initZoom = 3;

class StoreMapAPI {
  constructor() {
    this.init();
  }

  /**
   * 스토어맵 디자인 정보를 받아옴
   * @returns {void}
   */
  async UISetting() {
    if (this.widgets.widget.ui === 'default') {
      L_GEOLOCATION_WIDGET = false;
    } else {
      L_GEOLOCATION_WIDGET = true;
    }
    L_NORMAL_MARKER_IMG = this.widgets.marker.normalMarker;
    L_NOW_MARKER_IMG = this.widgets.marker.nowMarker;

    document.documentElement.style.setProperty('--ui-color', this.widgets.widget.uiColor);
    document.documentElement.style.setProperty('--ui-title-text-color', this.widgets.widget.titleTextColor);
    document.documentElement.style.setProperty('--ui-distance-text-color', this.widgets.widget.distanceTextColor);
    document.documentElement.style.setProperty('--ui-active-text-color', this.widgets.widget.activeTextColor);
    document.documentElement.style.setProperty('--ui-text-color', this.widgets.widget.textColor);
    document.documentElement.style.setProperty('--ui-address-text-color', this.widgets.widget.addressTextColor);
    document.documentElement.style.setProperty('--ui-map-title-text-color', this.widgets.widget.mapTitleTextColor);
    document.documentElement.style.setProperty('--ui-map-address-text-color', this.widgets.widget.mapAddressTextColor);
    document.documentElement.style.setProperty('--ui-map-renew-btn-color', this.widgets.widget.mapRenewBtnColor);
    document.documentElement.style.setProperty('--ui-quicksearch-title-text-color', this.widgets.widget.quickSearchTitleTextColor);
    document.documentElement.style.setProperty('--ui-quicksearch-title-hover-color', this.widgets.widget.quickSearchTitleTextHoverColor);
    document.documentElement.style.setProperty('--ui-quicksearch-distance-text-color', this.widgets.widget.quickSearchDistanceTextColor);
    document.documentElement.style.setProperty(
      '--ui-quicksearch-distance-hover-color',
      this.widgets.widget.quickSearchDistanceTextHoverColor
    );
    document.documentElement.style.setProperty('--ui-quicksearch-address-text-color', this.widgets.widget.quickSearchAddressTextColor);
    document.documentElement.style.setProperty(
      '--ui-quicksearch-address-hover-color',
      this.widgets.widget.quickSearchAddressTextHoverColor
    );
    document.documentElement.style.setProperty('--ui-overlay-title-text-color', this.widgets.widget.overlayTitleTextColor);
    document.documentElement.style.setProperty('--ui-overlay-address-text-color', this.widgets.widget.overlayAddressTextColor);
    document.documentElement.style.setProperty('--ui-overlay-close-btn-text-color', this.widgets.widget.overlayCloseBtnTextColor);
    document.documentElement.style.setProperty('--ui-overlay-pickup-btn-text-color', this.widgets.widget.overlayPickupBtnTextColor);
  }

  /**
   * @description 스토어 리스트를 받아옴
   * @returns { Array }
   */
  getStoreList = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/stores`, { params: { origin: this.origin } });

      if (res.status === 200) {
        L_STORE_LIST = res.data;
        if (L_STORE_LIST.length >= 1) {
          storePickupInit();
        } else {
          this.postMsgStoresEmpty();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  postMsgStoresEmpty = () => {
    // 상품 리스트가 비었다면 empty 전송하여 iframe 제거
    window.parent.postMessage({ empty: true }, '*');
  };

  postMsgFrameHeight = () => {
    const pickupStoreElm = getPickupStoreElm();
    const pickupSteElmObv = new MutationObserver((mutations) => {
      const height = pickupStoreElm.clientHeight;

      window.parent.postMessage({ height }, '*');
    });

    const config = { attributes: true, childList: true, subtree: true };
    pickupSteElmObv.observe(pickupStoreElm, config);
  };

  postMsgTrigger = () => {
    // iframe 이 성공적으로 생성 되었다면 trigger 전송
    window.parent.postMessage({ trigger: true }, '*');
  };

  receiveTrigger = () => {
    // 부모 페이지에서 성공적으로 trigger 를 받았다면 다시 trigger 반환하여 origin 추출
    window.addEventListener(
      'message',
      async function (e) {
        if (e.data.trigger) {
          this.postMsgFrameHeight();
          this.origin = e.origin;
        }
      }.bind(this)
    );
  };

  receiveProductId = () => {
    window.addEventListener('message', function (e) {
      if (e.data.productId) {
        this.productId = e.data.productId;
      }
    });
  };

  receiveWidget = () => {
    window.addEventListener(
      'message',
      function (e) {
        if (e.data.widgets) {
          this.widgets = JSON.parse(e.data.widgets);
          this.UISetting();

          if (this.widgets.widget.coords) {
            const latitude = this.widgets.widget.coords.latitude; // 위도
            const longitude = this.widgets.widget.coords.longitude; // 경도
            L_USER_NAVER_COORD = createNaverCoord(latitude, longitude);
          }
          getPickupStoreBtnElm().classList.remove('loading');
          getPickupStoreBtnElm().innerHTML = '';
        }
      }.bind(this)
    );
  };

  init = () => {
    this.postMsgTrigger();
    this.receiveWidget();
    this.receiveTrigger();
    this.receiveProductId();
  };
}

const getRootPropertyValue = (propertyName) => {
  // 문서의 루트 요소를 가져옴
  const root = document.documentElement;

  // 계산된 스타일 값을 가져옴
  const computedStyle = getComputedStyle(root);

  // 속성 값을 반환
  return computedStyle.getPropertyValue(propertyName);
};
/**
 * @description 맵 노출 전 스토어맵 오픈시키는 버튼
 * @return {HTMLElement}
 */
const getPickupStoreBtnElm = () => {
  return document.getElementById('pickUpStoreBtn');
};
/**
 * @return {HTMLElement} 맵 타이틀 엘리먼트를 가져옴
 */
const getMapTitleElm = () => {
  return document.getElementById('mapTitle');
};
/**
 * @return {HTMLElement} 맵 엘리먼트를 가져옴
 */
const getMapElm = () => {
  return document.getElementById('map');
};

/**
 * @description 매장 리스트 요소를 감싸는 div 요소 반환하는 함수
 * @returns {HTMLElement} - 매장 리스트 요소를 감싸는 div 요소 반환
 */
const getStoreListWrapper = () => {
  return document.querySelector('.store-info-container');
};

/**
 * @description 매장 리스트 swiper 슬라이드 요소를 추가하는 함수
 * @param {HTMLElement} swiperSlide - 추가할 swiper 슬라이드 요소
 * @returns {void}
 */
const addSlide = (swiperSlide) => {
  getStoreListWrapper().appendChild(swiperSlide);
};

/**
 * @description 새로운 swiper 슬라이드 요소를 생성하는 함수
 * @returns {HTMLElement} - 새로운 swiper 슬라이드 요소 반환
 */
const createNewSlide = () => {
  let swiperSlide = document.createElement('div');
  swiperSlide.classList.add('swiper-slide');

  return swiperSlide;
};

/**
 * @returns {HTMLElement}
 */
const getAddrElm = () => {
  return document.getElementById('address');
};

/**
 * @returns {String}
 */
const getSearchedAddr = () => {
  return document.getElementById('address').value;
};

/**
 * @description 실제 쇼핑몰에서 스토어맵 옵션에 해당하는 옵션 엘리먼트의 값을 선택한 매장의 이름으로 지정
 * @param {String} name
 */
const postMsgOptValue = (store) => {
  window.parent.postMessage({ storeMapOptValue: `${store.name} - ${store.address}` }, '*');
};

/**
 * @description 선택한 매장의 검색 타입에 알맞은 데이터를 input#address 에 넣어줌 매장 선택 모든동작이 이 함수를 거침
 * @param {Object} store
 */
const setSearchAddrValue = (store) => {
  const AddrElm = getAddrElm();

  const setSearchTxtStoreName = () => {
    AddrElm.value = store.name;
  };

  const setSearchTxtStoreAddr = () => {
    AddrElm.value = store.address;
  };

  typeCall(setSearchTxtStoreName, setSearchTxtStoreAddr);
  AddrElm.dataset.storeId = store._id;
};
/**
 * @returns {HTMLElement}
 */
const getSubmitElm = () => {
  return document.getElementById('submit');
};

/**
 * @returns {HTMLElement}
 */
const getStoreName = () => {
  return document.getElementById('storeName');
};
/**
 * @returns {HTMLElement}
 */
const getStoreAddress = () => {
  return document.getElementById('storeAddress');
};
/**
 * @description 검색창을 초기화시킴
 * @returns {void}
 */
const initSearchedAddr = () => {
  const AddrElm = getAddrElm();
  AddrElm.value = '';
};

// 네이버 지도를 생성하는 함수
const createNaverMap = () => {
  const mapElm = getMapElm(); // 지도를 표시할 div
  const mapOption = {
    center: initLatLng, // 지도의 중심좌표
    zoom: initZoom, // 지도의 확대 레벨
  };

  // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
  L_MAP = new naver.maps.Map(mapElm, mapOption);
  // mapHandler();
  // 지도를 생성하고 기본적인 설정을 한다
};

// 매장정보(enter , search)검색 시 작동하는 함수
const searchHandler = () => {
  // 검색어 입력창에서 Enter 키를 눌렀을 때 좌표 검색 함수를 실행한다
  getAddrElm().addEventListener('keydown', async (e) => {
    const keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
      if (!(await searchStoreIsValid())) {
        // 비슷한 검색어 조차 찾을 수 없을경우
        return;
      }
      pickup(findStoreBySearched());
    }
  });
  // 검색 버튼을 클릭했을 때 좌표 검색 함수를 실행한다
  getSubmitElm().addEventListener('click', async (e) => {
    e.preventDefault();
    if (!(await searchStoreIsValid())) {
      // 비슷한 검색어 조차 찾을 수 없을경우
      return;
    }
    pickup(findStoreBySearched());
  });
};

// --------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------

/**
 * @description 지도 보기 버튼 클릭 시 지도를 보여주는 함수
 * @returns {void}
 */
const showMap = () => {
  const map = getMapElm();
  const mapTitle = getMapTitleElm();
  mapTitle.style.display = 'block';
  map.style.display = 'initial';
  map.style.display = 'block';
  map.style.visibility = 'visible';
  map.style.opacity = 1;
  getAddrElm().focus();
};

/**
 * @description 지도가 열려 있는지 여부를 확인하는 함수
 * @returns {boolean} - 지도가 열려 있는 경우 true, 그렇지 않은 경우 false 반환
 */
const mapOpenChk = () => {
  const pendingMap = getMapElm();
  // pendingMap 요소에 'off' 클래스가 포함되어 있지 않은 경우 false 반환
  if (!pendingMap.classList.contains('off')) return false;

  return true;
};

/**
 * @description 페이지가 처음 로딩될 때 매장 검색을 수행하는 함수
 * @returns {void}
 */
const firstOpenMap = () => {
  showMap();
  createNaverMap();
  searchHandler(); // 검색어를 받아 좌표를 검색하는 함수를 실행한다
};

/**
 * @description 매장 검색, 동 검색 선택 버튼 클릭 시 동작하는 함수
 * @returns {void}
 */
const onSearchType = (searchTypeElm) => {
  // 검색 타입 변경 버튼 이벤트 추가
  if (searchTypeElm.classList.contains('on')) {
    return;
  }

  // 현재 선택된 검색 타입 버튼의 on 클래스 제거, 클릭한 검색 타입 버튼에 on 클래스 추가
  document.querySelector('.search_type.on').classList.remove('on');
  searchTypeElm.classList.add('on');

  HideQuickSearchElm();
  // 검색어 input 요소 초기화
  initSearchedAddr();
};

const searchTypeHandler = () => {
  const searchTypeElms = document.querySelectorAll('.search_type');
  searchTypeElms.forEach((searchTypeElm) => {
    searchTypeElm.addEventListener('click', () => {
      onSearchType(searchTypeElm);
    });
  });
};

const getGeocodeAddr = (addr) => {
  return new Promise((resolve, reject) => {
    naver.maps.Service.geocode({ query: addr }, async function (status, response) {
      if (response.v2.meta.totalCount === 0) return false;

      resolve(response.v2.addresses[0]);
    });
  });
};

const searchStoreIsValid = async () => {
  const store = findStoreBySearched();
  let y, x;
  if (!store) {
    if (getSearchedAddr().length < 2) {
      window.parent.postMessage({ alertMessage: '2글자 이상 입력해 주세요.' }, '*');
      return false;
    }

    naver.maps.Service.geocode({ query: getSearchedAddr() }, async function (status, response) {
      if (response.v2.meta.totalCount === 0) {
        try {
          const res = await axios.get(`/api/v1/stores/search/address?search=${getSearchedAddr()}`);
          if (res.status === 200 && res.data.items.length > 0) {
            const geocodeAddr = await getGeocodeAddr(res.data.items[0].address);
            if (!geocodeAddr) return;

            x = geocodeAddr.x;
            y = geocodeAddr.y;
          }
        } catch (error) {
          return;
        }
      } else {
        x = response.v2.addresses[0].x;
        y = response.v2.addresses[0].y;
      }

      const naverCoord = new naver.maps.LatLng(y, x);

      createUserMarker(naverCoord);
      setDistance(naverCoord);
      paintStoreList();
    });

    return false;
  }

  return true;
};
/**
 * @param {storePickupBtnElm:HTMLElement, store:Object} 매장 정보를 받아옴
 */
const pickupBtnHandler = (storePickupBtnElm, store) => {
  storePickupBtnElm.addEventListener('click', () => {
    pickup(store);
  });
};

/**
 *
 * @param {Object} store
 * @param {Boolean} pickBtn
 * @returns {Boolean?}
 */
const pickup = async (store) => {
  setSearchAddrValue(store); // 주소 입력창에 정보를 채워줌
  if (!(await searchStoreIsValid())) {
    return false;
  }

  searchAddrToCoord(store);
  HideQuickSearchElm(); // 서치리스트 숨김
  postMsgOptValue(store); // 실제 옵션에 값을 담아줌
  getStoreName().innerText = store.name;
  getStoreAddress().innerText = store.address;
};

const quickSearchHandler = (quickSearchStoreElm, store) => {
  quickSearchStoreElm.addEventListener('click', () => {
    pickup(store);
  });
};

const onInfoWindow = (store) => {
  setSearchAddrValue(store); // 서치 인풋에 타입별 값을 채워넣음
  const overlay = createInfoWindow(store);
  if (L_SHOWING_INFOWINDOW) {
    closeOpenedInfoWindow();
  }
  L_SHOWING_INFOWINDOW = overlay; // 닫기버튼 클릭시 없애기 위함
  L_MAP.setZoom(13);
  L_MAP.setCenter(store.marker.getPosition());
  overlay.open(L_MAP, store.marker);
};

const markerHandler = (store) => {
  naver.maps.Event.addListener(store.marker, 'click', function (e) {
    if (L_GEOLOCATION_WIDGET) {
      // 선택한 마커 기준으로 스토어리스트를 다시 그려줌
      setDistance(store.naverCoord);
      paintStoreList();
    }

    closeOpenedInfoWindow();
    onInfoWindow(store);
  });
};

const mapHandler = () => {
  naver.maps.Event.addListener(L_MAP, 'click', function () {
    closeOpenedInfoWindow();
  });
};

const onRenewUserMarker = () => {
  if (L_GEOLOCATION_WIDGET) {
    createUserMarker(L_USER_NAVER_COORD);
    setDistance(L_USER_NAVER_COORD);
    paintStoreList();
  } else {
    L_MAP.setCenter(initLatLng);
    L_MAP.setZoom(initZoom);
    closeOpenedInfoWindow();
  }
};

const renewBtnHandler = () => {
  const renewBtnElm = document.getElementById('mapRenewBtn');
  renewBtnElm.addEventListener('click', onRenewUserMarker);
};

const createStoreChildElmAsString = (store) => {
  const result =
    `<div class="left">` +
    `<h1 class="store_name">${store.name}</h1>` +
    `<div class="addr_ct">` +
    `<span class="address" style="color: rgb(151, 151, 151);">${store.address}</span><img class="copy_addr" src="https://oneulwineshop.cafe24.com/web/icons/copy.svg" style="width : 15px; height:15px; margin-left: 5px; cursor:pointer;"></img>` +
    `</div>` +
    `</div>` +
    `<div class="right">` +
    `<svg 
            class="store_pick_btn"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 30 30"
            width="30"
            height="30"
          >` +
    `<g>` +
    `<path d="M15,0C6.73,0,0,6.73,0,15s6.73,15,15,15,15-6.73,15-15S23.27,0,15,0Zm0,27.27c-6.77,0-12.27-5.51-12.27-12.27S8.23,2.73,15,2.73s12.27,5.51,12.27,12.27-5.51,12.27-12.27,12.27Z" />` +
    `<path d="M20.62,9.7l-7.71,7.71-3.54-3.54c-.53-.53-1.4-.53-1.93,0-.53,.53-.53,1.4,0,1.93l4.5,4.5c.26,.26,.6,.4,.96,.4h0c.36,0,.71-.14,.96-.4l8.68-8.68c.53-.53,.53-1.4,0-1.93-.53-.53-1.4-.53-1.93,0Z" />` +
    `</g>` +
    `</svg>` +
    `</div>`;

  return result;
};

const distanceUnitConversion = (distance) => {
  if (!L_GEOLOCATION_WIDGET) return '';

  if (distance >= 1) {
    distance = distance.toFixed(1);
  } else {
    distance = distance.toFixed(2);
  }

  return distance < 1 ? `${distance * 1000}m` : `${distance}km`;
};
/**
 * @description 매장 리스트를 화면에 출력하는 함수
 * @returns {void}
 */
const paintStoreList = () => {
  let cnt = 0;
  let swiperSlide = createNewSlide(); // 슬라이더 생성
  let storeList = [...L_STORE_LIST];

  if (L_GEOLOCATION_WIDGET) {
    storeList.forEach((store) => {
      store.naverCoord = createNaverCoord(store.latitude, store.longitude);
      createStoreMarker(store);
      markerHandler(store);
    });

    storeList = storeList.filter((store) => {
      return store.distance <= 10;
    });
  } else {
    L_STORE_LIST.forEach((store) => {
      store.naverCoord = createNaverCoord(store.latitude, store.longitude);
      createStoreMarker(store);
      markerHandler(store);
    });
  }

  let storeLen = Object.keys(storeList).length; // 매장 갯수

  for (let key in storeList) {
    const store = storeList[key];
    if (cnt && cnt % 5 === 0) {
      addSlide(swiperSlide); // 5개 = 1페이지가 넘어갔을 때 슬라이드 삽입
      swiperSlide = createNewSlide();
    }

    const storeElm = document.createElement('div');
    storeElm.classList.add('store');
    const storeChildString = createStoreChildElmAsString(store);
    storeElm.innerHTML = storeChildString;

    if (L_GEOLOCATION_WIDGET) {
      let distance = store.distance;

      if (distance <= 0) {
        // 스토어 한개를 생략하고 넘어가기 때문에 storeLen 값 감소
        storeLen--;
        continue;
      }

      const distanceElm = document.createElement('span');
      distanceElm.classList.add('distance');
      const distanceStr = `${distanceUnitConversion(distance)}  `;
      distanceElm.innerText = distanceStr;
      storeElm.querySelector('.addr_ct').prepend(distanceElm);
    }

    const storePickBtn = storeElm.querySelector('.store_pick_btn');
    pickupBtnHandler(storePickBtn, store);

    swiperSlide.appendChild(storeElm);

    if (cnt - storeLen - 1 < 5 && cnt === storeLen - 1) {
      // 5개가 안찼고 마지막일 경우
      addSlide(swiperSlide);
    }

    document.querySelector('#pickupStore .store_list_ct .cont').classList.add('on');
    cnt++;
  }

  copyAddrHandler();
};
/**
 * @description 매장 리스트에 페이징 기능을 추가하는 함수
 * @returns {void}
 */
const createPagination = () => {
  const paging = 10; // 한 페이지에 표시할 매장 수
  new Swiper('.store_list_ct .swiper-container', {
    slidesPerView: 1,
    allowTouchMove: false,
    effect: 'fade',
    draggable: false,
    speed: 400,
    observer: true,
    observeParents: true,
    pagination: {
      el: '.store_list_ct .swiper-pagination',
      clickable: true,
      type: 'bullets',
      renderBullet: function (index, className) {
        return `<span data-index=${index} class=${className}> ${index + 1} </span>`;
      },
    },
    navigation: {
      nextEl: '.store_list_ct .swiper-button-next',
      prevEl: '.store_list_ct .swiper-button-prev',
    },
    on: {
      slideChange: function () {
        const lastNum = document.querySelector('.swiper-pagination-bullets span:nth-last-child(1)').dataset.index;
        const activePage = document.querySelector('.swiper-pagination-bullet-active');
        const activeIndex = activePage.dataset.index;
        if (activeIndex % paging === 0) {
          for (let i = 0; i < activeIndex; i++) {
            document.querySelector(`.swiper-pagination-bullet[data-index="${i}"]`).style.display = 'none';
          }
          for (let o = 0; o < paging; o++) {
            if (parseInt(activeIndex) + o > lastNum) {
              break;
            }
            document.querySelector(`.swiper-pagination-bullet[data-index="${parseInt(activeIndex) + o}"]`).style.display = 'inline-block';
          }
        } else if (Number(activePage.innerText) % paging === 0) {
          for (let i = activePage.innerText - paging; i < activePage.innerText; i++) {
            document.querySelector(`.swiper-pagination-bullet[data-index="${i}"]`).style.display = 'inline-block';
          }
          for (let i = parseInt(activePage.innerText); i < parseInt(activePage.innerText) + paging; i++) {
            if (i > lastNum) {
              break;
            }
            document.querySelector(`.swiper-pagination-bullet[data-index="${i}"]`).style.display = 'none';
          }
        }
      },
    },
  });
};
/**
 * @description 코드 복사 알림 요소를 반환하는 함수
 * @returns {HTMLElement} 코드 복사 알림 요소
 */
const getCodeCopyAlert = () => {
  return document.getElementById('copy_alert');
};

/**
 * @returns {HTMLElement} 서치리스트 컨테이너 요소를 가져옴
 **/
const getSearchListCtElm = () => {
  return document.getElementById('searchListCt');
};

const getPickupStoreElm = () => {
  return document.getElementById('pickupStore');
};

const onCopyAddr = (address) => {
  window.parent.postMessage({ addrCopy: true, address: address }, '*');
};

const copyAddrHandler = () => {
  const addrCopyBtns = document.querySelectorAll('.copy_addr');

  addrCopyBtns.forEach((addrCopyBtn) => {
    addrCopyBtn.addEventListener('click', () => {
      onCopyAddr(addrCopyBtn.previousElementSibling.innerText); // 주소 복사 기능을 수행하는 함수
    });
  });
};

/**
 * @description 매장 리스트를 업데이트하고 페이징을 생성하며, 복사 버튼과 픽업 버튼을 클릭 시의 기능을 수행하는 함수
 * @returns {void}
 */
const storeListUp = () => {
  paintStoreList(); // 매장 리스트를 표시하는 함수
  createPagination(); // 페이징을 생성하는 함수
};

// 현재 검색 타입을 가져오는 함수
const getSearchType = () => {
  return document.querySelector('.search_type.on').dataset.type;
};

const typeCall = (store_callback, dong_callback) => {
  const type = getSearchType();
  switch (type) {
    case 'store':
      return store_callback();
    case 'dong':
      return dong_callback();
  }
};

/**
 * @description 입력된 주소와 일치하는 매장을 검색하여 반환하는 함수
 * @param {addr:String}
 * @returns {Boolean}
 */

const findStoreBySearched = () => {
  const storeId = document.querySelector('#searchListCt > .store')
    ? document.querySelector('#searchListCt > .store').dataset.storeId
    : getAddrElm().dataset.storeId;

  if (storeId) {
    for (let key in L_STORE_LIST) {
      if (L_STORE_LIST[key]._id === storeId) {
        return L_STORE_LIST[key];
      }
    }
  }

  return false; // 일치하는 매장이 없으면 false 반환
};

const createNaverMarker = (naver_coord, marker_img_url) => {
  const imageSrc = marker_img_url, // 마커이미지의 주소입니다
    imageSize = new naver.maps.Size(26, 28); // 마커이미지의 크기입니다

  const marker = new naver.maps.Marker({
    map: L_MAP,
    position: naver_coord,
    icon: {
      url: imageSrc,
      size: imageSize,
      origin: new naver.maps.Point(0, 0),
      anchor: new naver.maps.Point(25, 26),
    },
  });

  return marker;
};

const createStoreMarker = (store) => {
  const quantity = store.inventory[this.productId];

  let markerImgURI;
  if (quantity > 0) {
    // 바로픽업 가능한 상품
    markerImgURI = L_NOW_MARKER_IMG;
  } else {
    // 바로픽업이 불가능한 상품
    markerImgURI = L_NORMAL_MARKER_IMG;
  }
  const naverCoord = createNaverCoord(store.latitude, store.longitude);
  const marker = createNaverMarker(naverCoord, markerImgURI);

  // 마커가 지도 위에 표시되도록 설정합니다
  marker.setMap(L_MAP);

  store.marker = marker;
  return marker;
};

const createUserMarker = (naverCoord) => {
  userMarkers.forEach((userMarker) => {
    userMarker.setMap(null);
  });
  const markerImgURI = 'https://rlagudtjq2016.cafe24.com/assets/icon/current_location.gif';
  const userMarker = createNaverMarker(naverCoord, markerImgURI);

  // 마커가 지도 위에 표시되도록 설정합니다
  userMarker.setMap(L_MAP);
  L_MAP.setZoom(13);
  L_MAP.setCenter(userMarker.getPosition());
  userMarkers.push(userMarker);
};

// 입력된 주소로 좌표를 검색하고, 해당 좌표를 지도에 표시하는 함수
const searchAddrToCoord = (store) => {
  if (L_GEOLOCATION_WIDGET) {
    setDistance(L_USER_NAVER_COORD || store.naverCoord); // 지정 거리값 기준으로 근처 매장들의 거리를 스토어 리스트에 거리를 생성 후 거리순 정렬
    paintStoreList();
    L_MAP.setCenter(store.naverCoord);
  }

  onInfoWindow(store);
};

// 검색 결과를 숨기는 함수
const HideQuickSearchElm = () => {
  const searchListCt = getSearchListCtElm(); // 서치리스트 컨테이너 요소를 가져옴
  searchListCt.style.display = 'none'; // 서치리스트를 숨김
  searchListCt.innerHTML = ''; // 서치리스트 내용을 비움
  searchListCt.style.height = '0px'; // 서치리스트 높이를 0으로 설정
};
// 서치리스트에 검색 결과를 하나만 표시하는 함수
const showQuickSearchJustOne = () => {
  const searchListCt = getSearchListCtElm(); // 서치리스트 컨테이너 요소를 가져옴
  searchListCt.style.display = 'initial'; // 서치리스트를 보이게 함
  searchListCt.innerHTML = ''; // 서치리스트 내용을 비움
  searchListCt.style.height = L_HEIGHT + 10 + 'px'; // 서치리스트 높이를 설정
};

// 검색 결과를 표시하는 함수
const paintQuickSearch = (store) => {
  const searchListCt = getSearchListCtElm(); // 서치리스트 컨테이너 요소를 가져옴
  const storeElm = document.createElement('div'); // 검색 결과를 담을 div 요소를 생성
  storeElm.classList.add('store'); // div 요소에 store 클래스를 추가
  storeElm.dataset.storeId = store._id;
  storeElm.innerHTML =
    `<div class="store_name"><h1>${store.name}</h1></div>` + // 매장 이름을 표시하는 div 요소를 생성
    `<div class="store_addr">` +
    `<span class="distance">${distanceUnitConversion(store.distance)}  </span>` +
    `<span class='addr'>${store.address}</span>` +
    `</div>`; // 매장 주소를 표시하는 div 요소를 생성
  searchListCt.appendChild(storeElm); // 서치리스트 컨테이너에 검색 결과 div 요소를 추가
  return storeElm; // 검색 결과 div 요소를 반환
};

const removeAllSpaces = (text) => {
  return text.replaceAll(' ', '');
};

const initQuickSearchListCt = () => {
  getSearchListCtElm().innerHTML = '';
};

/**
 * @description 검색어에 따라 검색결과를 생성하고 클릭 이벤트를 등록하며, 검색결과에 따라 서치리스트의 높이를 조정합니다.
 * @description 검색결과 클릭 시 검색어에 해당하는 위치로 지도를 이동시키고 검색창에 검색어를 입력합니다.
 *
 * @param {HTMLInputElement} addr - 검색어가 입력된 input 엘리먼트
 */
const quickSearch = () => {
  const QUICK_SEARCH_LIMIT = 7;
  let searchedValue = getSearchedAddr();
  const searchListCt = getSearchListCtElm();
  const storesLen = searchListCt.querySelectorAll('.store').length;

  initQuickSearchListCt(); // 서치리스트 초기화

  if (storesLen === 0) {
    HideQuickSearchElm();
  }
  if (!searchedValue) {
    HideQuickSearchElm();
    return;
  }

  let quickSearchArray = [];

  for (let store of L_STORE_LIST) {
    const getStoreName = () => {
      return store.name;
    };

    const getStoreAddress = () => {
      return store.address;
    };

    const searchTarget = typeCall(getStoreName, getStoreAddress);

    if (removeAllSpaces(searchTarget).includes(removeAllSpaces(searchedValue))) {
      if (quickSearchArray.length === QUICK_SEARCH_LIMIT) break;
      searchListCt.style.display = 'block';
      quickSearchArray.push(store);
    }
  }

  for (let store of quickSearchArray) {
    const quickSearchStoreElm = paintQuickSearch(store);
    quickSearchHandler(quickSearchStoreElm, store);
  }

  searchListCt.style.height = quickSearchArray.length * L_HEIGHT + 10 + 'px';
};

const storeSearchingHandler = () => {
  const addrElm = getAddrElm();
  addrElm.addEventListener('input', () => {
    // 검색어가 없을경우 주소 입력창의 storeId 데이터 삭제
    if (getSearchedAddr() === '') {
      addrElm.dataset.storeId = '';
    }

    quickSearch();
  });
};

// ----------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------
const closeOpenedInfoWindow = () => {
  if (L_SHOWING_INFOWINDOW) {
    L_SHOWING_INFOWINDOW.close();
    L_SHOWING_INFOWINDOW = '';
  }
};

const createInfoWindow = (store) => {
  const content = [
    '<div class="iw_inner">',
    '  <div class="content">',
    `		<h3 style="font-size:1rem; margin:0;">${store.name}</h3>`,
    `      	 <p style="margin-top:5px; margin-bottom:0; font-size:0.875rem;">${store.address}</p>`,
    '  </div>',
    '   <div class="btn-box">',
    `   	<div class="close-btn" onclick=>닫기</div>`,
    `   	<div class="pickup-btn" >여기서픽업</div>`,
    '   </div>',
    '</div>',
  ].join('');

  const overlay = new naver.maps.InfoWindow({
    content: content,
    maxWidth: 200,
    minWidth: 170,
    borderRadius: 10,
    borderWidth: 0,
    anchorSize: new naver.maps.Size(0, 0),
    anchorSkew: true,
    anchorColor: '#fff',
    pixelOffset: new naver.maps.Point(0, -20),
  });

  const closeBtnElm = overlay.contentElement.querySelector('.close-btn');
  const pickupBtnElm = overlay.contentElement.querySelector('.pickup-btn');

  closeBtnElm.addEventListener('click', closeOpenedInfoWindow);
  pickupBtnElm.addEventListener('click', () => {
    pickup(store);
  });

  return overlay;
};

// 주변 매장 찾기
const sortCondition = (a, b) => {
  if (a.distance > b.distance) {
    return 1;
  }
  if (a.distance < b.distance) {
    return -1;
  }
};

const createNaverCoord = (latitude, longitude) => {
  return new naver.maps.LatLng(latitude, longitude);
};

const fromTM128ToLatLng = (mapx, mapy) => {
  const point = new naver.maps.Point(mapx, mapy);
  console.log(point);
  const latLng = naver.maps.TransCoord.fromTM128ToLatLng(point);
  return latLng;
};

/**
 * @description UI 가 distance 일때 사용되는 함수 기준이되는 거리를 받아서 스토어 리스트에 거리를 생성 후 거리순으로 정렬
 * @param {naverCoord} targetNaverCoord
 */
const setDistance = (targetNaverCoord) => {
  const storeInfoCtElm = document.querySelector('.store-info-container');
  storeInfoCtElm.innerHTML = '';
  var proj = L_MAP.getProjection();
  for (let i = 0; i < L_STORE_LIST.length; i++) {
    const naverCoord = createNaverCoord(L_STORE_LIST[i].latitude, L_STORE_LIST[i].longitude);
    const distance = proj.getDistance(targetNaverCoord, naverCoord);
    L_STORE_LIST[i].distance = distance / 1000;
  }

  L_STORE_LIST.sort(sortCondition);
};

// ----------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------
const geoLocationPickupInit = () => {
  firstOpenMap();
  createUserMarker(L_USER_NAVER_COORD);
  setDistance(L_USER_NAVER_COORD);
  storeListUp();
};

const pickupInit = () => {
  firstOpenMap();
  storeListUp();
};

/**
 * @description
 * @return {void}
 */
const onPickupStoreBtn = async () => {
  const pickUpStore = document.getElementById('pickupStore');
  pickUpStore.classList.add('on');
  getPickupStoreBtnElm().remove();
  renewBtnHandler();

  if (L_GEOLOCATION_WIDGET) {
    geoLocationPickupInit();
  } else {
    pickupInit();
  }
};
const pickupStoreBtnHandler = (storeMapAPI) => {
  const pickupStoreBtn = getPickupStoreBtnElm();

  if (L_GEOLOCATION_WIDGET) {
    const pickupStoreBtnMutionObv = new MutationObserver((mutations) => {
      if (!pickupStoreBtn.classList.contains('loading')) {
        pickupStoreBtn.addEventListener(
          'click',
          async () => {
            await storeMapAPI.getStoreList();
            onPickupStoreBtn();
          },
          {
            once: true,
          }
        );
      }
      pickupStoreBtnMutionObv.disconnect();
    });

    pickupStoreBtnMutionObv.observe(pickupStoreBtn, {
      subtree: true,
      attributes: true,
    });
  } else {
    pickupStoreBtn.classList.remove('loading');
    pickupStoreBtn.innerHTML = '';
    pickupStoreBtn.addEventListener(
      'click',
      async () => {
        await storeMapAPI.getStoreList();
        onPickupStoreBtn();
      },
      {
        once: true,
      }
    );
  }
};

const storePickupInit = async () => {
  searchTypeHandler(); // 검색타입 변경 시 작동하는 함수
  storeSearchingHandler();
};

const sotreMapInit = async () => {
  const storeMapAPI = new StoreMapAPI();
  pickupStoreBtnHandler(storeMapAPI);
};

window.addEventListener('DOMContentLoaded', () => {
  sotreMapInit();
});
