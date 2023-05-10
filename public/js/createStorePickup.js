window.addEventListener("DOMContentLoaded", () => {
  let sortedStoreList = {
    1: {
      sc_name: "대학로점",
      receive_addr:
        "서울특별시 종로구 창경궁로 240-7 (명륜4가) 1층 오늘,와인한잔 대학로점",
    },
    2: {
      sc_name: "예술의전당점",
      receive_addr:
        "서울특별시 서초구 반포대로 38 (서초동) 1층 오늘,와인한잔 예술의전당점",
    },
    3: {
      sc_name: "교대점",
      receive_addr:
        "서울특별시 서초구 반포대로26길 75 (서초동) 오늘,와인한잔 교대점",
    },
    4: {
      sc_name: "방배점",
      receive_addr:
        "서울특별시 서초구 효령로31길 23 (방배동) 오늘,와인한잔 방배점",
    },
    5: {
      sc_name: "당산역점",
      receive_addr:
        "서울특별시 영등포구 당산로 205 (당산동5가) 당산역해링턴타워 1층 오늘,와인한잔 당산역점",
    },
    6: {
      sc_name: "사당점",
      receive_addr:
        "서울특별시 서초구 방배천로4길 15 (방배동) 오늘,와인한잔 사당점",
    },
    7: {
      sc_name: "대학로점",
      receive_addr:
        "서울특별시 종로구 창경궁로 240-7 (명륜4가) 1층 오늘,와인한잔 대학로점",
    },
    8: {
      sc_name: "예술의전당점",
      receive_addr:
        "서울특별시 서초구 반포대로 38 (서초동) 1층 오늘,와인한잔 예술의전당점",
    },
    9: {
      sc_name: "교대점",
      receive_addr:
        "서울특별시 서초구 반포대로26길 75 (서초동) 오늘,와인한잔 교대점",
    },
    10: {
      sc_name: "방배점",
      receive_addr:
        "서울특별시 서초구 효령로31길 23 (방배동) 오늘,와인한잔 방배점",
    },
  };
  let PREV_MARKER;
  let map;

  const height = 80;

  // 네이버 지도를 생성하는 함수
  const createNaverMap = (quick_search) => {
    // 지도를 생성하고 기본적인 설정을 한다
    map = new naver.maps.Map("map", {
      center: new naver.maps.LatLng(37.3595316, 127.1052133),
      zoom: 5,
      mapTypeControl: true,
    });

    // 커서를 포인터로 변경한다
    map.setCursor("pointer");

    // 검색어를 받아 좌표를 검색하는 함수를 실행한다
    initGeocoder(quick_search);
  };

  // 인포윈도우를 생성하는 함수
  const createInfoWindow = () => {
    infoWindow = new naver.maps.InfoWindow({
      anchorSkew: true,
    });
  };

  // 검색어를 받아 좌표를 검색하는 함수
  function initGeocoder(quick_search) {
    // 검색어 입력창에서 Enter 키를 눌렀을 때 좌표 검색 함수를 실행한다
    document
      .getElementById("address")
      .addEventListener("keydown", function (e) {
        const keyCode = e.which;

        if (keyCode === 13) {
          searchAddressToCoordinate(document.getElementById("address").value);
        }
      });

    // 검색 버튼을 클릭했을 때 좌표 검색 함수를 실행한다
    document.getElementById("submit").addEventListener("click", function (e) {
      e.preventDefault();
      searchAddressToCoordinate(document.getElementById("address").value);
    });

    // 페이지 로딩 시 검색어가 있으면 좌표 검색 함수를 실행하고, 없으면 검색어 입력창에 포커스를 준다
    if (quick_search) {
      searchAddressToCoordinate(quick_search);
    } else {
      document.getElementById("address").focus();
    }
  }

  /**
   * @description 입력받은 item으로부터 주소 문자열을 생성하는 함수
   * @param {object} item - 주소 정보가 담긴 객체
   * @returns {string} - 생성된 주소 문자열
   */
  function makeAddress(item) {
    // item이 falsy한 값일 경우 함수 종료
    if (!item) {
      return;
    }

    // 변수 초기화
    let sido = "",
      sigugun = "",
      dongmyun = "",
      ri = "",
      rest = "";
    // 지번 주소 여부를 판단하기 위한 변수
    const isRoadAddress = item.name === "roadaddr";

    // 각 지역 정보가 존재하면 해당 변수에 값을 할당
    if (hasArea(item.region.area1)) {
      sido = item.region.area1.name;
    }

    if (hasArea(item.region.area2)) {
      sigugun = item.region.area2.name;
    }

    if (hasArea(item.region.area3)) {
      dongmyun = item.region.area3.name;
    }

    if (hasArea(item.region.area4)) {
      ri = item.region.area4.name;
    }

    // 건물/지번 정보가 존재하면 해당 변수에 값을 할당
    const land = item.land;
    if (land) {
      // 지번 정보가 존재하는 경우
      if (hasData(land.number1)) {
        // 지번 유형이 '산'일 경우 rest 변수에 '산' 추가
        if (hasData(land.type) && land.type === "2") {
          rest += "산";
        }

        // 지번 번호 추가
        rest += land.number1;

        // 지번 부가 번호가 존재하는 경우 '-'를 이용하여 추가
        if (hasData(land.number2)) {
          rest += "-" + land.number2;
        }
      }

      // 도로명 주소인 경우
      if (isRoadAddress === true) {
        // 동/면/읍에 해당하는 변수의 값을 조정
        if (checkLastString(dongmyun, "면")) {
          ri = land.name;
        } else {
          dongmyun = land.name;
          ri = "";
        }

        // 건물명이 존재하는 경우 rest 변수에 추가
        if (hasAddition(land.addition0)) {
          rest += " " + land.addition0.value;
        }
      }
    }

    // 생성된 주소 문자열 반환
    return [sido, sigugun, dongmyun, ri, rest].join(" ");
  }

  /**
   * @description 입력받은 지역 정보가 유효한 값인지 판단하는 함수
   * @param {object} area - 지역 정보 객체
   * @returns {boolean} - 유효한 값인 경우 true, 그렇지 않은 경우 false 반환
   */
  function hasArea(area) {
    return !!(area && area.name && area.name !== "");
  }

  /**
   * @description 입력받은 데이터가 유효한 값인지 판단하는 함수
   * @param {any} data - 판단할 데이터
   * @returns {boolean} - 유효한 값인 경우 true, 그렇지 않은 경우 false 반환
   */
  function hasData(data) {
    return !!(data && data !== "");
  }

  /**
   * @description 입력받은 문자열이 특정 문자열로 끝나는지 판단하는 함수
   * @param {string} word - 판단할 문자열
   * @param {string} lastString - 끝나는 문자열
   * @returns {boolean} - 입력받은 문자열이 특정 문자열로 끝나는 경우 true, 그렇지 않은 경우 false 반환
   */
  function checkLastString(word, lastString) {
    return new RegExp(lastString + "$").test(word);
  }

  /**
   * @description 입력받은 객체의 value 프로퍼티가 유효한 값인지 판단하는 함수
   * @param {object} addition - 판단할 객체
   * @returns {boolean} - 유효한 값인 경우 true, 그렇지 않은 경우 false 반환
   */
  function hasAddition(addition) {
    return !!(addition && addition.value);
  }

  // --------------------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------------------

  /**
   * @description 지도 보기 버튼 클릭 시 지도를 보여주는 함수
   * @returns {void}
   */
  const showMap = () => {
    const map = document.getElementById("map");
    const mapTitle = document.getElementById("map_title");
    mapTitle.style.display = "block";
    map.style.display = "initial";
    map.style.display = "block";
    map.style.visibility = "visible";
    map.style.opacity = 1;
  };

  /**
   * @description 매장 선택 select 요소에 가드 옵션을 추가하는 함수
   * @returns {void}
   */
  const createStoreGuardOpt = () => {
    const storeSelectElm = document.getElementById("delivstore");
    const guard = document.createElement("option");
    guard.value = "-1";
    guard.innerText = "매장을 선택해 주세요";
    storeSelectElm.prepend(guard);

    storeSelectElm[0].selected = true;
    guard.disabled = true;
  };

  /**
   * @description 지도가 열려 있는지 여부를 확인하는 함수
   * @returns {boolean} - 지도가 열려 있는 경우 true, 그렇지 않은 경우 false 반환
   */
  const mapOpenChk = () => {
    const pendingMap = document.getElementById("map");
    // pendingMap 요소에 'off' 클래스가 포함되어 있지 않은 경우 false 반환
    if (!pendingMap.classList.contains("off")) return false;

    return true;
  };

  /**
   * @description 페이지가 처음 로딩될 때 매장 검색을 수행하는 함수
   * @param {string} quick_search - 빠른 검색 기능을 이용하여 검색한 주소
   * @returns {void}
   */
  const firstOpenMap = (quick_search) => {
    let addr;
    // quick_search 값이 존재하는 경우 quick_search를 인자로 전달하여 검색 수행
    if (quick_search) {
      addr = storeSearch(quick_search);
    } else {
      // quick_search 값이 존재하지 않는 경우 address input 요소의 값을 이용하여 검색 수행
      addr = storeSearch(document.getElementById("address").value);
    }

    // 검색 결과가 존재하는 경우 지도, 정보창 생성 함수 호출
    if (addr) {
      showMap();
      createNaverMap(quick_search);
      createInfoWindow();
    } else {
      // 검색 결과가 존재하지 않는 경우 알림창 출력
      alert("해당하는 매장이 존재하지 않습니다.");
    }
  };

  /**
   * @description 매장 검색, 동 검색 선택 버튼 클릭 시 동작하는 함수
   * @returns {void}
   */
  const onSearchType = () => {
    // 검색 타입 변경 버튼 이벤트 추가
    const searchTypes = document.querySelectorAll(".search_type");
    searchTypes.forEach((searchType) => {
      searchType.addEventListener("click", () => {
        if (searchType.classList.contains("on")) {
          return;
        }

        const dongList = document.querySelector(".store_list_ct");

        // 현재 선택된 검색 타입 버튼의 on 클래스 제거, 클릭한 검색 타입 버튼에 on 클래스 추가
        document.querySelector(".search_type.on").classList.remove("on");
        searchType.classList.add("on");

        // 검색 타입에 따라 동 리스트 영역의 on 클래스 추가/제거
        // if (getSearchType() === "store") {
        //   dongList.classList.remove("on");
        // } else if (getSearchType() === "dong") {
        //   dongList.classList.add("on");
        // }
        HideQuickSearch();

        // 검색어 input 요소 초기화
        document.getElementById("address").value = "";
      });
    });
  };
  /**
   * @description 매장 리스트 요소를 감싸는 div 요소 반환하는 함수
   * @returns {HTMLElement} - 매장 리스트 요소를 감싸는 div 요소 반환
   */
  const getStoreListWrapper = () => {
    return document.querySelector(".store-info-container");
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
    let swiperSlide = document.createElement("div");
    swiperSlide.classList.add("swiper-slide");

    return swiperSlide;
  };

  /**
   * @description 매장 리스트를 화면에 출력하는 함수
   * @param {Object} storeList - 매장 리스트 객체
   * @returns {void}
   */
  const paintStoreList = (storeList) => {
    let cnt = 0;
    const storeLen = Object.keys(storeList).length; // 매장 갯수
    let swiperSlide = createNewSlide(); // 슬라이더 생성

    for (let key in storeList) {
      if (cnt && cnt % 5 === 0) {
        addSlide(swiperSlide); // 5개 = 1페이지가 넘어갔을 때 슬라이드 삽입
        swiperSlide = createNewSlide();
      }

      const store =
        `<div class="store">` +
        `<h1 class="store_name" style="font-size: 16px; padding-bottom: 6px;">${storeList[key].sc_name}</h1>` +
        `<div class="middle_box" style="position: relative; max-width: 90%; display:flex; align-items:center;">` +
        `<span style="color: rgb(151, 151, 151);">${storeList[key].receive_addr}</span><img class="copy_addr" src="https://oneulwineshop.cafe24.com/web/icons/copy.svg" style="width : 15px; height:15px; margin-left: 5px; cursor:pointer;"></img>` +
        `<img class="store_pick_btn" src="https://oneulwineshop.cafe24.com/web/icons/store_select.svg" style="position: absolute; width: 30px; height: 30px; right: -28px; top: -8px; cursor: pointer;">` +
        `</div>` +
        `</div>`;

      swiperSlide.innerHTML += store;

      console.log(cnt, storeLen - 1);
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
    new Swiper(".store_list_ct .swiper-container", {
      slidesPerView: 1,
      allowTouchMove: false,
      effect: "fade",
      draggable: false,
      speed: 400,
      pagination: {
        el: ".store_list_ct .swiper-pagination",
        clickable: true,
        type: "bullets",
        renderBullet: function (index, className) {
          return `<span data-index=${index} class=${className}> ${
            index + 1
          } </span>`;
        },
      },
      navigation: {
        nextEl: ".store_list_ct .swiper-button-next",
        prevEl: ".store_list_ct .swiper-button-prev",
      },
      on: {
        slideChange: function () {
          const lastNum = document.querySelector(
            ".swiper-pagination-bullets span:nth-last-child(1)"
          ).dataset.index;
          const activePage = document.querySelector(
            ".swiper-pagination-bullet-active"
          );
          const activeIndex = activePage.dataset.index;
          if (activeIndex % paging === 0) {
            for (let i = 0; i < activeIndex; i++) {
              document.querySelector(
                `.swiper-pagination-bullet[data-index="${i}"]`
              ).style.display = "none";
            }
            for (let o = 0; o < paging; o++) {
              if (parseInt(activeIndex) + o > lastNum) {
                break;
              }
              document.querySelector(
                `.swiper-pagination-bullet[data-index="${
                  parseInt(activeIndex) + o
                }"]`
              ).style.display = "inline-block";
            }
          } else if (Number(activePage.innerText) % paging === 0) {
            for (
              let i = activePage.innerText - paging;
              i < activePage.innerText;
              i++
            ) {
              document.querySelector(
                `.swiper-pagination-bullet[data-index="${i}"]`
              ).style.display = "inline-block";
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
              ).style.display = "none";
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
    return document.getElementById("copy_alert");
  };

  /**
   * @description 매장 픽업 완료 알림 요소를 반환하는 함수
   * @returns {HTMLElement} 매장 픽업 완료 알림 요소
   */
  const getPickupAlert = () => {
    return document.getElementById("pickup_alert");
  };

  /**
   * @description 인자로 받은 `addr` 값을 클립보드에 복사하고, `copyAlert` 함수를 호출하여 복사 완료 알림을 띄우는 함수
   * @param {string} addr 복사할 주소
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
    getCodeCopyAlert().classList.add("on");
    setTimeout(() => {
      getCodeCopyAlert().classList.remove("on");
    }, 1500);
  };

  /**
   * @description 매장 픽업 완료 알림 요소를 화면에 띄우고, 1.5초 후에 숨기는 함수
   * @returns {void}
   */
  const StorePickupAlert = () => {
    getPickupAlert().classList.add("on");
    setTimeout(() => {
      getPickupAlert().classList.remove("on");
    }, 1500);
  };

  // 매장 리스트를 업데이트하고 페이징을 생성하며, 복사 버튼과 픽업 버튼을 클릭 시의 기능을 수행하는 함수
  const storeListUp = () => {
    paintStoreList(sortedStoreList); // 매장 리스트를 표시하는 함수
    createPagination(); // 페이징을 생성하는 함수

    // 복사 버튼과 픽업 버튼에 이벤트 리스너 등록
    const addrCopyBtns = document.querySelectorAll(".copy_addr");
    const storePickUpBtns = document.querySelectorAll(".store_pick_btn");

    addrCopyBtns.forEach((addrCopyBtn) => {
      addrCopyBtn.addEventListener("click", () => {
        copyAddr(addrCopyBtn.previousElementSibling.innerText); // 주소 복사 기능을 수행하는 함수
      });
    });

    storePickUpBtns.forEach((storePickUpBtn) => {
      storePickUpBtn.addEventListener("click", () => {
        const addr = storePickUpBtn.parentNode.querySelector("span").innerText; // 매장 주소를 가져옴
        const storeName =
          storePickUpBtn.parentNode.parentNode.querySelector("h1").innerText; // 매장 이름을 가져옴

        showQuickSearchJustOne(); // 서치리스트 한개만큼에 스타일 지정하는 함수
        paintSearchStore(storeName, addr); // 서치리스트에 매장 정보를 표시하는 함수

        const searchType = getSearchType(); // 검색 타입을 가져오는 함수

        switch (searchType) {
          case "store":
            document.getElementById("address").value = storeName; // 검색 타입이 '매장 이름'일 경우 검색 창에 매장 이름을 설정
            break;
          case "dong":
            document.getElementById("address").value = addr; // 검색 타입이 '동 이름'일 경우 검색 창에 매장 주소를 설정
            break;
        }

        document.getElementById("submit").click(); // 검색 버튼 클릭
      });
    });
  };

  // 현재 검색 타입을 가져오는 함수
  const getSearchType = () => {
    return document.querySelector(".search_type.on").dataset.type;
  };

  // 입력된 주소와 일치하는 매장을 검색하여 반환하는 함수
  const storeSearch = (address) => {
    if (!address) return false;

    let storeOrAddr;
    const searchType = getSearchType(); // 현재 검색 타입을 가져옴

    for (let key in sortedStoreList) {
      switch (searchType) {
        case "store":
          storeOrAddr = sortedStoreList[key].sc_name; // 매장 이름을 가져옴
          if (
            storeOrAddr.replaceAll(" ", "").replaceAll("&amp;", "&") ===
              address.replaceAll(" ", "") ||
            storeOrAddr.replaceAll(" ", "").replaceAll("&amp;", "&") ===
              address.replaceAll(" ", "") + "점"
          ) {
            // 매장 이름이 검색어와 일치하면 해당 매장 정보 반환
            return sortedStoreList[key];
          }
          break;
        case "dong":
          storeOrAddr = sortedStoreList[key].receive_addr; // 매장 주소를 가져옴
          if (
            storeOrAddr.replaceAll(" ", "").replaceAll("&amp;", "&") ===
            address.replaceAll(" ", "")
          ) {
            // 매장 주소가 검색어와 일치하면 해당 매장 정보 반환
            return sortedStoreList[key];
          }
          break;
      }
    }

    return false; // 일치하는 매장이 없으면 false 반환
  };

  // 입력된 주소에 해당하는 매장 정보를 반환하는 함수
  const getStoreAddr = (address) => {
    return storeSearch(address); // storeSearch 함수 호출하여 매장 정보 반환
  };

  // 입력된 주소로 좌표를 검색하고, 해당 좌표를 지도에 표시하는 함수
  function searchAddressToCoordinate(address) {
    const storeInfo = getStoreAddr(address); // 입력된 주소에 해당하는 매장 상세 정보를 받아옴

    if (!storeInfo) {
      // 입력된 주소에 해당하는 매장이 없으면 알림창을 띄우고 리턴
      alert("입력하신 매장명이 존재하지 않습니다.");
      return;
    }

    naver.maps.Service.geocode(
      {
        query: storeInfo.receive_addr, // 매장 주소로 좌표를 검색
      },
      function (status, response) {
        if (status === naver.maps.Service.Status.ERROR) {
          return;
        }

        if (response.v2.meta.totalCount === 0) {
          return alert("검색결과가 존재하지 않습니다.");
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

  /**
   * @returns {Element} - 생성된 주소 문자열
   **/
  const getSearchListCtElm = () => {
    return document.getElementById("search_list_ct"); // 서치리스트 컨테이너 요소를 가져옴
  };

  // 검색 결과를 숨기는 함수
  const HideQuickSearch = () => {
    const searchListCt = getSearchListCtElm(); // 서치리스트 컨테이너 요소를 가져옴
    searchListCt.style.display = "none"; // 서치리스트를 숨김
    searchListCt.innerHTML = ""; // 서치리스트 내용을 비움
    searchListCt.style.height = "0px"; // 서치리스트 높이를 0으로 설정
  };
  // 서치리스트에 검색 결과를 하나만 표시하는 함수
  const showQuickSearchJustOne = () => {
    const searchListCt = getSearchListCtElm(); // 서치리스트 컨테이너 요소를 가져옴
    searchListCt.style.display = "initial"; // 서치리스트를 보이게 함
    searchListCt.innerHTML = ""; // 서치리스트 내용을 비움
    searchListCt.style.height = height + 10 + "px"; // 서치리스트 높이를 설정
  };

  // 검색 결과를 표시하는 함수
  const paintSearchStore = (name, addr) => {
    const searchListCt = getSearchListCtElm(); // 서치리스트 컨테이너 요소를 가져옴
    const store = document.createElement("div"); // 검색 결과를 담을 div 요소를 생성
    store.classList.add("store"); // div 요소에 store 클래스를 추가
    store.innerHTML =
      `<div class="store_name"><h1>${name}</h1></div>` + // 매장 이름을 표시하는 div 요소를 생성
      `<div class="store_addr"><span>${addr}</span></div>`; // 매장 주소를 표시하는 div 요소를 생성
    searchListCt.appendChild(store); // 서치리스트 컨테이너에 검색 결과 div 요소를 추가
    return store; // 검색 결과 div 요소를 반환
  };

  /**
   * 검색어에 따라 검색결과를 생성하고 클릭 이벤트를 등록하며, 검색결과에 따라 서치리스트의 높이를 조정합니다.
   * 검색결과 클릭 시 검색어에 해당하는 위치로 지도를 이동시키고 검색창에 검색어를 입력합니다.
   *
   * @param {HTMLInputElement} addr - 검색어가 입력된 input 엘리먼트
   */

  const quickSearch = (searchStore) => {
    const searchListCt = document.getElementById("search_list_ct");
    const storesLen = searchListCt.querySelectorAll(".store").length;

    searchListCt.innerHTML = "";
    if (storesLen === 0) {
      HideQuickSearch();
    }
    if (!searchStore.value) {
      HideQuickSearch();
      return;
    }

    let searchStoreArray = [];
    const value = searchStore.value;

    for (let key in sortedStoreList) {
      let condition;

      if (getSearchType() === "store") {
        condition = sortedStoreList[key].sc_name
          .replaceAll(" ", "")
          .includes(value.replaceAll(" ", ""));
      } else {
        condition = sortedStoreList[key].receive_addr
          .replaceAll(" ", "")
          .includes(value.replaceAll(" ", ""));
      }

      if (condition) {
        searchListCt.style.display = "block";
        if (searchStoreArray.length < 7) {
          searchStoreArray.push(sortedStoreList[key]);
        } else {
          break;
        }
      }
    }

    if (getSearchType() === "store") {
      searchStoreArray = Object.values(searchStoreArray).sort((a, b) => {
        if (value === a.sc_name[0]) {
          return -1;
        }
        if (value === b.sc_name[0]) {
          return -1;
        }

        if (a.sc_name[0] < b.sc_name[0]) {
          return -1;
        }
        if (a.sc_name[0] > b.sc_name[0]) {
          return 1;
        }
      });
    }

    for (let key in searchStoreArray) {
      let quickValue;
      const storeName = searchStoreArray[key].sc_name;
      const storeAddr = searchStoreArray[key].receive_addr;

      if (getSearchType() === "store") {
        quickValue = storeName;
      } else if (getSearchType() === "dong") {
        quickValue = storeAddr;
      }

      const store = paintSearchStore(storeName, storeAddr);

      store.addEventListener("click", () => {
        if (mapOpenChk()) {
          firstOpenMap(quickValue);
        } else {
          searchAddressToCoordinate(quickValue);
        }

        searchStore.value = quickValue;
        if (getSearchType() === "store") {
          HideQuickSearch();
        } else if (getSearchType() === "dong") {
          showQuickSearchJustOne(); // 서치리스트 한개만큼에 스타일 지정
          paintSearchStore(storeName, storeAddr); // 서치리스트를 그려줌
        }
      });
    }

    searchListCt.style.height = searchStoreArray.length * height + 10 + "px";
  };

  const searching = () => {
    const addr = document.getElementById("address");
    addr.addEventListener("input", () => {
      quickSearch(addr);
    });
  };

  const init = () => {
    document.getElementById("search_store").style.display = "block";
    onSearchType(); // 검색타입 변경 시 작동하는 함수
    storeListUp();
    searching();

    document
      .getElementById("address")
      .addEventListener("keydown", function (e) {
        const keyCode = e.which;
        if (keyCode === 13) {
          // Enter Key
          if (mapOpenChk()) {
            firstOpenMap();
          }
        }
      });

    document.getElementById("submit").addEventListener("click", function (e) {
      e.preventDefault();
      if (mapOpenChk()) {
        firstOpenMap();
      }
    });
  };

  init();
});
