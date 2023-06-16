const L_HEIGHT = 80;
const API_BASE_URL = 'http://localhost:8080';
let L_GEOLOCATION_WIDGET = true,
  L_STORE_LIST,
  L_SHOWING_INFO_WIN,
  L_USER_NAVER_COORD,
  L_MARKERS = [],
  L_INFO_WINDOWS = [];

let PREV_MARKER, L_MAP;

let userMarkers = [];
class StoreMapAPI {
  constructor() {}

  async UISetting() {
    const pickUpStore = document.getElementById('pickupStore');
    pickUpStore.classList.add('on');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/ui`);
      if (res.status === 200) {
        const ui = res.data;
        document.documentElement.style.setProperty('--ui-color', ui.uiColor);
        document.documentElement.style.setProperty(
          '--ui-distance-color',
          ui.distanceColor
        );
        document.documentElement.style.setProperty(
          '--ui-active-text-color',
          ui.activeTextColor
        );
        document.documentElement.style.setProperty(
          '--ui-text-color',
          ui.textColor
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getStoreList() {
    const res = await axios
      .get(`${API_BASE_URL}/api/stores`)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.error(err);
      });

    return res;
  }
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

const setSearchedAddr = (store) => {
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

const onSubmit = () => {
  getSubmitElm().click();
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
  const mapOptions = {
    center: createNaverCoord(37.3595316, 127.1052133),
    zoom: 5,
    mapTypeControl: true,
  };

  // 지도를 생성하고 기본적인 설정을 한다
  L_MAP = new naver.maps.Map('map', mapOptions);

  // 커서를 포인터로 변경한다
  L_MAP.setCursor('pointer');
};

// 검색어를 받아 좌표를 검색하는 함수
const initGeocoder = () => {
  quickSearch();
  // 검색어 입력창에서 Enter 키를 눌렀을 때 좌표 검색 함수를 실행한다
  getAddrElm().addEventListener('keydown', (e) => {
    const keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
      searchAddrToCoord();
    }
  });
  // 검색 버튼을 클릭했을 때 좌표 검색 함수를 실행한다
  getSubmitElm().addEventListener('click', (e) => {
    e.preventDefault();
    searchAddrToCoord();
  });

  if (!getSearchedAddr()) {
    getAddrElm().focus();
    return;
  }
  // 페이지 로딩 시 검색어가 있으면 좌표 검색 함수를 실행하고, 없으면 검색어 입력창에 포커스를 준다
  if (getSearchedAddr() && !mapOpenChk()) {
    searchAddrToCoord();
  } else {
    getMapElm().classList.remove('off');
    searchAddrToCoord();
  }
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
  initGeocoder(); // 검색어를 받아 좌표를 검색하는 함수를 실행한다

  // const addr = getSearchedAddr();

  // 검색 결과가 존재하는 경우 지도, 정보창 생성 함수 호출
  // if (addr || L_GEOLOCATION_WIDGET) {
  // showMap();
  // createNaverMap();
  // initGeocoder(); // 검색어를 받아 좌표를 검색하는 함수를 실행한다
  // createInfoWindow();
  // } else {
  //   // 검색 결과가 존재하지 않는 경우 알림창 출력
  //   const type = getSearchType();
  //   switch (type) {
  //     case 'store':
  //       alert('상점명을 입력해 주세요');
  //       break;
  //     case 'dong':
  //       alert('상점주소를 입력해 주세요');
  //       break;
  //   }
  // }
};

/**
 * @description 매장 검색, 동 검색 선택 버튼 클릭 시 동작하는 함수
 * @returns {void}
 */
const onSearchType = () => {
  // 검색 타입 변경 버튼 이벤트 추가
  const searchTypes = document.querySelectorAll('.search_type');
  searchTypes.forEach((searchType) => {
    searchType.addEventListener('click', () => {
      if (searchType.classList.contains('on')) {
        return;
      }

      // 현재 선택된 검색 타입 버튼의 on 클래스 제거, 클릭한 검색 타입 버튼에 on 클래스 추가
      document.querySelector('.search_type.on').classList.remove('on');
      searchType.classList.add('on');

      // 검색 타입에 따라 동 리스트 영역의 on 클래스 추가/제거
      // if (getSearchType() === "store") {
      //   dongList.classList.remove("on");
      // } else if (getSearchType() === "dong") {
      //   dongList.classList.add("on");
      // }
      HideQuickSearchElm();
      // 검색어 input 요소 초기화
      initSearchedAddr();
    });
  });
};

/**
 * @param {storePickupBtnElm:HTMLElement, store:Object} 매장 정보를 받아옴
 */
const PickupBtnHandler = (storePickupBtnElm, store) => {
  storePickupBtnElm.addEventListener('click', () => {
    onPickup(store);
  });
};

const onPickup = (store) => {
  HideQuickSearchElm(); // 서치리스트 숨김
  setSearchedAddr(store);
  paintSearchStore(store); // 서치리스트에 매장 정보를 표시하는 함수
  searchAddrToCoord();
};

const showInfoWindow = (store) => {
  setSearchedAddr(store); // 서치 인풋에 타입별 값을 채워넣음

  const infoWindow = createPickupInfoWindow(store);

  if (infoWindow.getMap()) {
    infoWindow.close();
  } else {
    L_SHOWING_INFO_WIN = infoWindow; // 닫기버튼 클릭시 없애기 위함
    L_MAP.setZoom(15);

    L_MAP.setCenter(store.marker.position);
    infoWindow.open(L_MAP, store.marker);
  }
};

const markerHandler = (store) => {
  naver.maps.Event.addListener(store.marker, 'click', (e) => {
    showInfoWindow(store);
  });
};

const createStoreChildElmAsString = (store) => {
  const result =
    `<div class="left">` +
    `<h1 class="store_name" style="font-size: 16px; padding-bottom: 6px;">${store.name}</h1>` +
    `<div class="addr_ct">` +
    `<span style="color: rgb(151, 151, 151);">${store.address}</span><img class="copy_addr" src="https://oneulwineshop.cafe24.com/web/icons/copy.svg" style="width : 15px; height:15px; margin-left: 5px; cursor:pointer;"></img>` +
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
      } else if (distance >= 1) {
        distance = Math.floor(distance);
      } else {
        distance = distance.toFixed(2);
      }

      const distanceElm = document.createElement('span');
      distanceElm.classList.add('distance');
      distanceElm.innerText = `${distance}Km  `;
      storeElm.querySelector('.addr_ct').prepend(distanceElm);
    }

    const storePickBtn = storeElm.querySelector('.store_pick_btn');
    PickupBtnHandler(storePickBtn, store);

    swiperSlide.appendChild(storeElm);

    if (cnt - storeLen - 1 < 5 && cnt === storeLen - 1) {
      // 5개가 안찼고 마지막일 경우
      addSlide(swiperSlide);
    }

    document
      .querySelector('#pickupStore .store_list_ct .cont')
      .classList.add('on');
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
        return `<span data-index=${index} class=${className}> ${
          index + 1
        } </span>`;
      },
    },
    navigation: {
      nextEl: '.store_list_ct .swiper-button-next',
      prevEl: '.store_list_ct .swiper-button-prev',
    },
    on: {
      slideChange: function () {
        const lastNum = document.querySelector(
          '.swiper-pagination-bullets span:nth-last-child(1)'
        ).dataset.index;
        const activePage = document.querySelector(
          '.swiper-pagination-bullet-active'
        );
        const activeIndex = activePage.dataset.index;
        if (activeIndex % paging === 0) {
          for (let i = 0; i < activeIndex; i++) {
            document.querySelector(
              `.swiper-pagination-bullet[data-index="${i}"]`
            ).style.display = 'none';
          }
          for (let o = 0; o < paging; o++) {
            if (parseInt(activeIndex) + o > lastNum) {
              break;
            }
            document.querySelector(
              `.swiper-pagination-bullet[data-index="${
                parseInt(activeIndex) + o
              }"]`
            ).style.display = 'inline-block';
          }
        } else if (Number(activePage.innerText) % paging === 0) {
          for (
            let i = activePage.innerText - paging;
            i < activePage.innerText;
            i++
          ) {
            document.querySelector(
              `.swiper-pagination-bullet[data-index="${i}"]`
            ).style.display = 'inline-block';
          }
          for (
            let i = parseInt(activePage.innerText);
            i < parseInt(activePage.innerText) + paging;
            i++
          ) {
            if (i > lastNum) {
              break;
            }
            document.querySelector(
              `.swiper-pagination-bullet[data-index="${i}"]`
            ).style.display = 'none';
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
 * @description 매장 픽업 완료 알림 요소를 반환하는 함수
 * @returns {HTMLElement} 매장 픽업 완료 알림 요소
 */
const getPickupAlert = () => {
  return document.getElementById('pickup_alert');
};

/**
 * @returns {Element} - 생성된 주소 문자열
 **/
const getSearchListCtElm = () => {
  return document.getElementById('search_list_ct'); // 서치리스트 컨테이너 요소를 가져옴
};

/**
 * @description 인자로 받은 `addr` 값을 클립보드에 복사하고, `copyAlert` 함수를 호출하여 복사 완료 알림을 띄우는 함수
 * @param {addr:string}  복사할 주소
 * @returns {void}
 */
const onCopyAddr = (addr) => {
  window.navigator.clipboard.writeText(addr).then(() => {
    copyAlert();
  });
};

/**
 * @description 코드 복사 알림 요소를 화면에 띄우고, 1.5초 후에 숨기는 함수
 * @returns {void}
 */
const copyAlert = () => {
  getCodeCopyAlert().classList.add('on');
  setTimeout(() => {
    getCodeCopyAlert().classList.remove('on');
  }, 1500);
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
 * @description 매장 픽업 완료 알림 요소를 화면에 띄우고, 1.5초 후에 숨기는 함수
 * @returns {void}
 */
const StorePickupAlert = () => {
  getPickupAlert().classList.add('on');
  setTimeout(() => {
    getPickupAlert().classList.remove('on');
  }, 1500);
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
  const storeId = document.querySelector('#search_list_ct > .store')
    ? document.querySelector('#search_list_ct > .store').dataset.storeId
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

const createStoreMarker = (store) => {
  const content = [
    '<div>',
    `       <img src="../icons/store.svg" width="35" height="35" alt="현재 위치"/>`,
    '</div>',
  ].join('');

  const marker = new naver.maps.Marker({
    map: L_MAP, // 검색된 좌표를 지도에 표시
    position: store.naverCoord,
    icon: {
      content,
      size: new naver.maps.Size(35, 35),
      anchor: new naver.maps.Point(11, 35),
    },
  });

  store.marker = marker;
  return marker;
};

const createUserMarker = (naverCoord) => {
  userMarkers.forEach((userMarker) => {
    userMarker.setMap(null);
  });

  const userMarker = new naver.maps.Marker({
    position: naverCoord,
    map: L_MAP,
    icon: {
      content:
        '<img src="//ecimg.cafe24img.com/pg241b58340239066/inthework/web/images/map/current_location.gif" alt="" ' +
        'style="margin: 0px; padding: 0px; border: 0px solid transparent; display: block; max-width: none; max-height: none; ' +
        '-webkit-user-select: none; position: absolute; width: 30px; height: 30px; left: 0px; top: 0px;">',
      size: new naver.maps.Size(22, 35),
      anchor: new naver.maps.Point(11, 35),
    },
  });

  L_MAP.setCenter(naverCoord);
  L_MAP.setZoom(15);
  userMarkers.push(userMarker);
};

const storePuckup = () => {
  const store = findStoreBySearched(); // 입력된 주소에 해당하는 매장 상세 정보를 받아옴
  StorePickupAlert(); // 픽업 알림창 띄워줌
  getStoreName().innerText = store.name;
  getStoreAddress().innerText = store.address;
  HideQuickSearchElm();
};

// 입력된 주소로 좌표를 검색하고, 해당 좌표를 지도에 표시하는 함수
const searchAddrToCoord = () => {
  const store = findStoreBySearched(); // 입력된 주소에 해당하는 매장 상세 정보를 받아옴
  if (!store) {
    // 입력된 주소에 해당하는 매장이 없으면 알림창을 띄우고 리턴
    alert('입력하신 매장명이 존재하지 않습니다.');
    return;
  }

  if (L_GEOLOCATION_WIDGET) {
    setDistance(store.naverCoord);
    storeListUp();
    L_MAP.setCenter(store.naverCoord);
  } else {
    const marker = createStoreMarker(store);

    if (PREV_MARKER) {
      PREV_MARKER.setMap(null);
    }
    PREV_MARKER = marker;
    naver.maps.Event.addListener(store.marker, 'click', (e) => {
      showInfoWindow(store);
    });
  }

  showInfoWindow(store);
  storePuckup();
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
const paintSearchStore = (store) => {
  const searchListCt = getSearchListCtElm(); // 서치리스트 컨테이너 요소를 가져옴
  const storeElm = document.createElement('div'); // 검색 결과를 담을 div 요소를 생성
  storeElm.classList.add('store'); // div 요소에 store 클래스를 추가
  storeElm.dataset.storeId = store._id;
  storeElm.innerHTML =
    `<div class="store_name"><h1>${store.name}</h1></div>` + // 매장 이름을 표시하는 div 요소를 생성
    `<div class="store_addr"><span>${store.address}</span></div>`; // 매장 주소를 표시하는 div 요소를 생성
  searchListCt.appendChild(storeElm); // 서치리스트 컨테이너에 검색 결과 div 요소를 추가
  return storeElm; // 검색 결과 div 요소를 반환
};

const removeAllSpaces = (text) => {
  return text.replaceAll(' ', '');
};

const initQuickSearchListCt = () => {
  getSearchListCtElm().innerHTML = '';
};

const onQuickSearch = (store) => {
  setSearchedAddr(store);

  if (mapOpenChk()) {
    firstOpenMap();
  } else {
    searchAddrToCoord();
  }

  HideQuickSearchElm(); // 서치리스트 한개만큼에 스타일 지정
};
const quickSearchHandler = (store) => {
  const storeElm = paintSearchStore(store);
  storeElm.addEventListener('click', () => {
    onQuickSearch(store);
  });
};

/**
 * 검색어에 따라 검색결과를 생성하고 클릭 이벤트를 등록하며, 검색결과에 따라 서치리스트의 높이를 조정합니다.
 * 검색결과 클릭 시 검색어에 해당하는 위치로 지도를 이동시키고 검색창에 검색어를 입력합니다.
 *
 * @param {HTMLInputElement} addr - 검색어가 입력된 input 엘리먼트
 */
const quickSearch = () => {
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
  const QUICK_SEARCH_LIMIT = 7;

  for (let key in L_STORE_LIST) {
    const store = L_STORE_LIST[key];
    const getStoreName = () => {
      return store.name;
    };

    const getStoreAddress = () => {
      return store.address;
    };

    const searchTarget = typeCall(getStoreName, getStoreAddress);

    if (
      removeAllSpaces(searchTarget).includes(removeAllSpaces(searchedValue))
    ) {
      if (quickSearchArray.length === QUICK_SEARCH_LIMIT) break;
      searchListCt.style.display = 'block';
      quickSearchArray.push(store);
    }
  }

  const sortQuickSearch = () => {
    const result = Object.values(quickSearchArray).sort((a, b) => {
      if (searchedValue === a.name[0]) {
        return -1;
      }
      if (searchedValue === b.name[0]) {
        return -1;
      }

      if (a.name[0] < b.name[0]) {
        return -1;
      }
      if (a.name[0] > b.name[0]) {
        return 1;
      }
    });

    return result;
  };

  quickSearchArray = typeCall(sortQuickSearch, () => {
    return quickSearchArray;
  });

  for (let key in quickSearchArray) {
    const store = quickSearchArray[key];
    quickSearchHandler(store);
  }

  searchListCt.style.height = quickSearchArray.length * L_HEIGHT + 10 + 'px';
};

const storeSearchingHandler = () => {
  getAddrElm().addEventListener('input', () => {
    quickSearch();
  });
};

const onFirstSearch = () => {
  if (mapOpenChk()) {
    firstOpenMap();
  }
};

const firstSearchHandler = () => {
  getAddrElm().addEventListener('keydown', (e) => {
    const keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
      // Enter Key
      onFirstSearch();
    }
  });

  getSubmitElm().addEventListener('click', (e) => {
    onFirstSearch();
  });
};

// ----------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------
const closeInfoWindow = () => {
  if (L_SHOWING_INFO_WIN) {
    L_SHOWING_INFO_WIN.close();
    L_SHOWING_INFO_WIN = ''; // 닫기버튼 클릭시 없애기 위함
  }
};

const createPickupInfoWindow = (store) => {
  const contentString = [
    '<div class="iw_inner">',
    '  <div class="content">',
    `		<h3>${store.name}</h3>`,
    `      	 <p style="margin-top:5px;">${store.address}</p>`,
    '  </div>',
    '   <div class="btn-box">',
    `   	<div class="close-btn" onclick=\"closeInfoWindow()\">닫기</div>`,
    `   	<div class="pickup-btn" onclick=\"storePuckup()\">여기서픽업</div>`,
    '   </div>',
    '</div>',
  ].join('');

  const infowindow = new naver.maps.InfoWindow({
    content: contentString,
    maxWidth: 200,
    backgroundColor: '#fff',
    borderColor: getRootPropertyValue('--ui-color'),
    borderWidth: 1,
    anchorSize: new naver.maps.Size(0, 0),
    anchorSkew: true,
    anchorColor: '#fff',
    pixelOffset: new naver.maps.Point(5, -20),
  });

  L_SHOWING_INFO_WIN = infowindow; // 닫기버튼 클릭시 없애기 위함
  return infowindow;
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

const setDistance = (targetNaverCoord) => {
  const _storeInfoContainer = document.querySelector('.store-info-container');
  _storeInfoContainer.innerHTML = '';
  var proj = L_MAP.getProjection();

  for (let key in L_STORE_LIST) {
    const store = L_STORE_LIST[key];
    const storeNaverCoord = createNaverCoord(store.latitude, store.longitude);
    const distance = proj.getDistance(targetNaverCoord, storeNaverCoord);
    store.distance = distance / 1000;
  }

  L_STORE_LIST.sort(sortCondition);
};

const geoLocationSuccess = async ({ coords, timestamp }) => {
  latitude = coords.latitude; // 위도
  longitude = coords.longitude; // 경도

  L_USER_NAVER_COORD = new naver.maps.LatLng(latitude, longitude);
  getPickupStoreBtnElm().classList.remove('loading');
  getPickupStoreBtnElm().innerHTML = '';
};

const geoLocationErrCallback = (error) => {
  getPickupStoreBtnElm().classList.remove('loading');
  getPickupStoreBtnElm().innerHTML = '';
  L_GEOLOCATION_WIDGET = false;
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
  firstSearchHandler();
};

const onPickupStoreBtn = async (storeMapAPI) => {
  await storeMapAPI.UISetting();
  getPickupStoreBtnElm().remove();
  if (L_GEOLOCATION_WIDGET) {
    geoLocationPickupInit();
  } else {
    pickupInit();
  }
};
const pickupStoreBtnHandler = (storeMapAPI) => {
  if (L_GEOLOCATION_WIDGET) {
    const pickupStoreBtn = getPickupStoreBtnElm();
    const pickupStoreBtnMutionObv = new MutationObserver((mutations) => {
      if (!pickupStoreBtn.classList.contains('loading')) {
        getPickupStoreBtnElm().addEventListener(
          'click',
          () => {
            onPickupStoreBtn(storeMapAPI);
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
    getPickupStoreBtnElm().addEventListener(
      'click',
      () => {
        onPickupStoreBtn(storeMapAPI);
      },
      {
        once: true,
      }
    );
  }
};

const storePickupInit = async (storeMapAPI) => {
  onSearchType(); // 검색타입 변경 시 작동하는 함수
  storeSearchingHandler();

  if (L_GEOLOCATION_WIDGET) {
    navigator.geolocation.getCurrentPosition(
      geoLocationSuccess,
      geoLocationErrCallback
    );
  }

  pickupStoreBtnHandler(storeMapAPI);
};

const getStoreMapData = async () => {
  const storeMapAPI = new StoreMapAPI();
  L_STORE_LIST = await storeMapAPI.getStoreList();

  if (!L_STORE_LIST) {
    return;
  }

  const storeMap = document.getElementById('storeMap');
  try {
    const res = await axios.get(API_BASE_URL);
    if (res.status === 200) {
      storeMap.innerHTML = res.data;
      storePickupInit(storeMapAPI);
    }
  } catch (error) {
    console.error(error);
  }
};

getStoreMapData();
