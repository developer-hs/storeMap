window.addEventListener('DOMContentLoaded', async () => {
  const L_HEIGHT = 80;
  let L_STORE_LIST;
  let PREV_MARKER, map;

  class StoreMapAPI {
    constructor() {}

    async UISetting() {
      document.getElementById('search_store').style.display = 'block';
      await axios
        .get('http://localhost:8080/api/users/ui')
        .then((res) => {
          const ui = res.data;
          document.documentElement.style.setProperty(
            '--ui-color',
            ui.backgroundColor
          );
          return res.data;
        })
        .catch((err) => {
          console.error(err);
        });
    }

    async getStoreList() {
      const res = await axios
        .get('http://localhost:8080/api/stores')
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.error(err);
        });

      return res;
    }
  }

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

  const setSearchedAddr = (addr) => {
    const AddrElm = getAddrElm();
    AddrElm.value = addr;
  };
  /**
   * @returns {HTMLElement}
   */
  const getSubmitElm = () => {
    return document.getElementById('submit');
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
    // 지도를 생성하고 기본적인 설정을 한다
    map = new naver.maps.Map('map', {
      center: new naver.maps.LatLng(37.3595316, 127.1052133),
      zoom: 5,
      mapTypeControl: true,
    });

    // 커서를 포인터로 변경한다
    map.setCursor('pointer');

    // 검색어를 받아 좌표를 검색하는 함수를 실행한다
    initGeocoder();
  };

  // 인포윈도우를 생성하는 함수
  const createInfoWindow = () => {
    infoWindow = new naver.maps.InfoWindow({
      anchorSkew: true,
    });
  };

  // 검색어를 받아 좌표를 검색하는 함수
  const initGeocoder = () => {
    quickSearch();
    // 검색어 입력창에서 Enter 키를 눌렀을 때 좌표 검색 함수를 실행한다
    getAddrElm().addEventListener('keydown', function (e) {
      const keyCode = e.keyCode || e.which;
      if (keyCode === 13) {
        searchAddrToCoord();
      }
    });
    // 검색 버튼을 클릭했을 때 좌표 검색 함수를 실행한다
    getSubmitElm().addEventListener('click', function (e) {
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
    const map = document.getElementById('map');
    const mapTitle = document.getElementById('map_title');
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
    const addr = getSearchedAddr();

    // 검색 결과가 존재하는 경우 지도, 정보창 생성 함수 호출
    if (addr) {
      showMap();
      createNaverMap();
      createInfoWindow();
    } else {
      // 검색 결과가 존재하지 않는 경우 알림창 출력
      const type = getSearchType();
      switch (type) {
        case 'store':
          alert('상점명을 입력해 주세요');
          break;
        case 'dong':
          alert('상점주소를 입력해 주세요');
          break;
      }
    }
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
        HideQuickSearch();

        // 검색어 input 요소 초기화
        initSearchedAddr();
      });
    });
  };

  /**
   * @param {storePickupBtnElm:HTMLElement, store:Object} 매장 정보를 받아옴
   */
  const onPickupBtnHandler = (storePickupBtnElm, store) => {
    storePickupBtnElm.addEventListener('click', () => {
      showQuickSearchJustOne(); // 서치리스트 한개만큼에 스타일 지정하는 함수
      paintSearchStore(store); // 서치리스트에 매장 정보를 표시하는 함수

      const searchType = getSearchType(); // 검색 타입을 가져오는 함수
      switch (searchType) {
        case 'store':
          setSearchedAddr(store.name); // 검색 타입이 '매장 이름'일 경우 검색 창에 매장 이름을 설정
          break;
        case 'dong':
          setSearchedAddr(store.addr); // 검색 타입이 '동 이름'일 경우 검색 창에 매장 주소를 설정
          break;
      }

      getSubmitElm().click(); // 검색 버튼 클릭
    });
  };
  /**
   * @description 매장 리스트를 화면에 출력하는 함수
   * @returns {void}
   */

  const paintStoreList = () => {
    let cnt = 0;
    const storeLen = Object.keys(L_STORE_LIST).length; // 매장 갯수
    let swiperSlide = createNewSlide(); // 슬라이더 생성

    for (let key in L_STORE_LIST) {
      if (cnt && cnt % 5 === 0) {
        addSlide(swiperSlide); // 5개 = 1페이지가 넘어갔을 때 슬라이드 삽입
        swiperSlide = createNewSlide();
      }

      const store = document.createElement('div');
      store.classList.add('store');
      const storeChilds =
        `<div class="left">` +
        `<h1 class="store_name" style="font-size: 16px; padding-bottom: 6px;">${L_STORE_LIST[key].name}</h1>` +
        `<div class="addr_ct">` +
        `<span style="color: rgb(151, 151, 151);">${L_STORE_LIST[key].addr}</span><img class="copy_addr" src="https://oneulwineshop.cafe24.com/web/icons/copy.svg" style="width : 15px; height:15px; margin-left: 5px; cursor:pointer;"></img>` +
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

      store.innerHTML = storeChilds;
      const storePickBtn = store.querySelector('.store_pick_btn');
      onPickupBtnHandler(storePickBtn, L_STORE_LIST[key]);

      swiperSlide.appendChild(store);
      if (cnt - storeLen - 1 < 5 && cnt === storeLen - 1) {
        // 5개가 안찼고 마지막일 경우
        addSlide(swiperSlide);
      }

      cnt++;
    }
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
  const copyAddr = (addr) => {
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

    // 복사 버튼과 픽업 버튼에 이벤트 리스너 등록
    const addrCopyBtns = document.querySelectorAll('.copy_addr');

    addrCopyBtns.forEach((addrCopyBtn) => {
      addrCopyBtn.addEventListener('click', () => {
        copyAddr(addrCopyBtn.previousElementSibling.innerText); // 주소 복사 기능을 수행하는 함수
      });
    });
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
    const searchedValue = getSearchedAddr();
    if (!searchedValue) return false;

    const quickSearchStoreElm = document.querySelector(
      '#search_list_ct > .store'
    );

    if (quickSearchStoreElm) {
      for (let key in L_STORE_LIST) {
        if (L_STORE_LIST[key]._id === quickSearchStoreElm.dataset.storeId) {
          return L_STORE_LIST[key];
        }
      }
    }

    return false; // 일치하는 매장이 없으면 false 반환
  };

  // 입력된 주소로 좌표를 검색하고, 해당 좌표를 지도에 표시하는 함수
  function searchAddrToCoord() {
    const store = findStoreBySearched(); // 입력된 주소에 해당하는 매장 상세 정보를 받아옴

    if (!store) {
      // 입력된 주소에 해당하는 매장이 없으면 알림창을 띄우고 리턴
      alert('입력하신 매장명이 존재하지 않습니다.');
      return;
    }

    naver.maps.Service.geocode(
      {
        query: store.addr, // 매장 주소로 좌표를 검색
      },
      function (status, response) {
        if (status === naver.maps.Service.Status.ERROR) {
          return;
        }

        if (response.v2.meta.totalCount === 0) {
          return alert('검색결과가 존재하지 않습니다.');
        }

        const item = response.v2.addresses[0],
          point = new naver.maps.Point(item.x, item.y);

        const marker = new naver.maps.Marker({
          map: map, // 검색된 좌표를 지도에 표시
          position: point,
        });

        if (PREV_MARKER) {
          PREV_MARKER.setMap(null);
        }
        PREV_MARKER = marker;

        StorePickupAlert(); // 픽업 알림창 띄워줌
        map.setZoom(16); // 지도 줌 레벨 설정
        map.setCenter(point); // 검색된 좌표를 지도 중앙에 위치시킴
      }
    );
  }

  // 검색 결과를 숨기는 함수
  const HideQuickSearch = () => {
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
      `<div class="store_addr"><span>${store.addr}</span></div>`; // 매장 주소를 표시하는 div 요소를 생성
    searchListCt.appendChild(storeElm); // 서치리스트 컨테이너에 검색 결과 div 요소를 추가
    return storeElm; // 검색 결과 div 요소를 반환
  };

  const removeAllSpaces = (text) => {
    return text.replaceAll(' ', '');
  };

  const initSearchListCt = () => {
    getSearchListCtElm().innerHTML = '';
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

    initSearchListCt();
    if (storesLen === 0) {
      HideQuickSearch();
    }
    if (!searchedValue) {
      HideQuickSearch();
      return;
    }

    let searchStoreArray = [];
    const QUICK_SEARCH_LIMIT = 7;

    for (let key in L_STORE_LIST) {
      const store = L_STORE_LIST[key];
      const searchTarget =
        getSearchType() === 'store' ? store.name : store.addr;

      if (
        removeAllSpaces(searchTarget).includes(removeAllSpaces(searchedValue))
      ) {
        if (searchStoreArray.length === QUICK_SEARCH_LIMIT) break;
        searchListCt.style.display = 'block';
        searchStoreArray.push(store);
      }
    }

    if (getSearchType() === 'store') {
      searchStoreArray = Object.values(searchStoreArray).sort((a, b) => {
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
    }

    for (let key in searchStoreArray) {
      const setSearchTxtStoreName = () => {
        setSearchedAddr(store.name);
      };

      const setSearchTxtStoreAddr = () => {
        setSearchedAddr(store.addr);
      };

      const store = searchStoreArray[key];
      const storeElm = paintSearchStore(store);

      storeElm.addEventListener('click', () => {
        typeCall(setSearchTxtStoreName, setSearchTxtStoreAddr);

        if (mapOpenChk()) {
          firstOpenMap();
        } else {
          searchAddrToCoord();
        }

        showQuickSearchJustOne(); // 서치리스트 한개만큼에 스타일 지정
        paintSearchStore(store); // 서치리스트를 그려줌
      });
    }

    searchListCt.style.height = searchStoreArray.length * L_HEIGHT + 10 + 'px';
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
    getAddrElm().addEventListener('keydown', function (e) {
      const keyCode = e.keyCode || e.which;
      if (keyCode === 13) {
        // Enter Key
        onFirstSearch();
      }
    });

    getSubmitElm().addEventListener('click', function (e) {
      onFirstSearch();
    });
  };

  const init = async () => {
    const storeMapAPI = new StoreMapAPI();
    await storeMapAPI.UISetting();
    L_STORE_LIST = await storeMapAPI.getStoreList();

    onSearchType(); // 검색타입 변경 시 작동하는 함수
    storeListUp();
    storeSearchingHandler();

    firstSearchHandler();
  };

  init();
});
