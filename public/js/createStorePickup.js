window.addEventListener("DOMContentLoaded", () => {
  let PREV_MARKER;
  let map;
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
  const height = 80;

  const createNaverMap = (quick_search) => {
    map = new naver.maps.Map("map", {
      center: new naver.maps.LatLng(37.3595316, 127.1052133),
      zoom: 5,
      mapTypeControl: true,
    });

    map.setCursor("pointer");

    initGeocoder(quick_search);
  };

  const createInfoWindow = () => {
    infoWindow = new naver.maps.InfoWindow({
      anchorSkew: true,
    });
  };

  function initGeocoder(quick_search) {
    document
      .getElementById("address")
      .addEventListener("keydown", function (e) {
        const keyCode = e.which;

        if (keyCode === 13) {
          // Enter Key
          searchAddressToCoordinate(document.getElementById("address").value);
        }
      });

    document.getElementById("submit").addEventListener("click", function (e) {
      e.preventDefault();
      searchAddressToCoordinate(document.getElementById("address").value);
    });

    if (quick_search) {
      searchAddressToCoordinate(quick_search);
    } else {
      searchAddressToCoordinate(document.getElementById("address").value);
    }
  }

  function makeAddress(item) {
    if (!item) {
      return;
    }

    const name = item.name,
      region = item.region,
      land = item.land,
      isRoadAddress = name === "roadaddr";

    const sido = "",
      sigugun = "",
      dongmyun = "",
      ri = "",
      rest = "";

    if (hasArea(region.area1)) {
      sido = region.area1.name;
    }

    if (hasArea(region.area2)) {
      sigugun = region.area2.name;
    }

    if (hasArea(region.area3)) {
      dongmyun = region.area3.name;
    }

    if (hasArea(region.area4)) {
      ri = region.area4.name;
    }

    if (land) {
      if (hasData(land.number1)) {
        if (hasData(land.type) && land.type === "2") {
          rest += "산";
        }

        rest += land.number1;

        if (hasData(land.number2)) {
          rest += "-" + land.number2;
        }
      }

      if (isRoadAddress === true) {
        if (checkLastString(dongmyun, "면")) {
          ri = land.name;
        } else {
          dongmyun = land.name;
          ri = "";
        }

        if (hasAddition(land.addition0)) {
          rest += " " + land.addition0.value;
        }
      }
    }

    return [sido, sigugun, dongmyun, ri, rest].join(" ");
  }

  function hasArea(area) {
    return !!(area && area.name && area.name !== "");
  }

  function hasData(data) {
    return !!(data && data !== "");
  }

  function checkLastString(word, lastString) {
    return new RegExp(lastString + "$").test(word);
  }

  function hasAddition(addition) {
    return !!(addition && addition.value);
  }

  // --------------------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------------------

  const showMap = () => {
    const map = document.getElementById("map");
    const mapTitle = document.getElementById("map_title");
    mapTitle.style.display = "initial";
    map.style.display = "initial";
    map.style.display = "block";
    map.style.visibility = "visible";
    map.style.opacity = 1;
  };

  const createStoreGuardOpt = () => {
    const storeSelectElm = document.getElementById("delivstore");
    const guard = document.createElement("option");
    guard.value = "-1";
    guard.innerText = "매장을 선택해 주세요";
    storeSelectElm.prepend(guard);

    storeSelectElm[0].selected = true;
    guard.disabled = true;
  };

  const mapOpenChk = () => {
    const pendingMap = document.getElementById("map");
    if (!pendingMap.classList.contains("off")) return false;

    return true;
  };

  const firstOpenMap = (quick_search) => {
    let addr;
    if (quick_search) {
      addr = storeSearch(quick_search);
    } else {
      addr = storeSearch(document.getElementById("address").value);
    }

    if (addr) {
      showMap();
      createNaverMap(quick_search);
      createInfoWindow();
    } else {
      alert("해당하는 매장이 존재하지 않습니다.");
    }
  };

  const onSearchType = () => {
    // 검색 타입 변경
    const searchTypes = document.querySelectorAll(".search_type");
    searchTypes.forEach((searchType) => {
      searchType.addEventListener("click", () => {
        if (searchType.classList.contains("on")) {
          return;
        }

        const dongList = document.querySelector(".store_list_ct");

        document.querySelector(".search_type.on").classList.remove("on");
        searchType.classList.add("on");

        // if (getSearchType() === "store") {
        //   dongList.classList.remove("on");
        // } else if (getSearchType() === "dong") {
        //   dongList.classList.add("on");
        // }
        HideQuickSearch();

        document.getElementById("address").value = "";
      });
    });
  };

  const getStoreListWrapper = () => {
    return document.querySelector(".store-info-container");
  };

  const addSlide = (swiperSlide) => {
    getStoreListWrapper().appendChild(swiperSlide); // 5개 = 1페이지가 넘어갔을 때 슬라이드 삽입
  };

  const createNewSlide = () => {
    let swiperSlide = document.createElement("div");
    swiperSlide.classList.add("swiper-slide");

    return swiperSlide;
  };

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

  const createPagination = () => {
    const paging = 10;
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

  const getCodeCopyAlert = () => {
    return document.getElementById("copy_alert");
  };

  const getPickupAlert = () => {
    return document.getElementById("pickup_alert");
  };

  const copyAddr = (addr) => {
    window.navigator.clipboard.writeText(addr).then(() => {
      copyAlert();
    });
  };

  const copyAlert = () => {
    getCodeCopyAlert().classList.add("on");
    setTimeout(() => {
      getCodeCopyAlert().classList.remove("on");
    }, 1500);
  };

  const StorePickupAlert = () => {
    console.log("AWD");
    getPickupAlert().classList.add("on");
    setTimeout(() => {
      getPickupAlert().classList.remove("on");
    }, 1500);
  };

  const storeListUp = () => {
    paintStoreList(sortedStoreList);
    createPagination();

    const addrCopyBtns = document.querySelectorAll(".copy_addr");
    const storePickUpBtns = document.querySelectorAll(".store_pick_btn");

    addrCopyBtns.forEach((addrCopyBtn) => {
      addrCopyBtn.addEventListener("click", () => {
        copyAddr(addrCopyBtn.previousElementSibling.innerText);
      });
    });

    storePickUpBtns.forEach((storePickUpBtn) => {
      storePickUpBtn.addEventListener("click", () => {
        const addr = storePickUpBtn.parentNode.querySelector("span").innerText;
        const storeName =
          storePickUpBtn.parentNode.parentNode.querySelector("h1").innerText;

        showQuickSearchJustOne(); // 서치리스트 한개만큼에 스타일 지정
        paintSearchStore(storeName, addr); // 서치리스트를 그려줌

        const searchType = getSearchType();

        switch (searchType) {
          case "store":
            document.getElementById("address").value = storeName;
            break;
          case "dong":
            document.getElementById("address").value = addr;
            break;
        }

        document.getElementById("submit").click();
      });
    });
  };

  const getSearchType = () => {
    return document.querySelector(".search_type.on").dataset.type;
  };

  const storeSearch = (address) => {
    if (!address) return false;

    let storeOrAddr;
    const searchType = getSearchType();

    for (let key in sortedStoreList) {
      switch (searchType) {
        case "store":
          storeOrAddr = sortedStoreList[key].sc_name;
          if (
            storeOrAddr.replaceAll(" ", "").replaceAll("&amp;", "&") ===
              address.replaceAll(" ", "") ||
            storeOrAddr.replaceAll(" ", "").replaceAll("&amp;", "&") ===
              address.replaceAll(" ", "") + "점"
          ) {
            // store 은 매장이름 으로 값을 받아옴
            return sortedStoreList[key];
          }
          break;
        case "dong":
          storeOrAddr = sortedStoreList[key].receive_addr;
          if (
            storeOrAddr.replaceAll(" ", "").replaceAll("&amp;", "&") ===
            address.replaceAll(" ", "")
          ) {
            // dong 은 주소로 값을 받아옴
            return sortedStoreList[key];
          }
          break;
      }
    }

    return false;
  };

  const getStoreAddr = (address) => {
    return storeSearch(address);
  };

  const acceptPayment = () => {
    document.getElementById("orderFixItem").classList.add("accept");
  };

  function searchAddressToCoordinate(address) {
    const storeInfo = getStoreAddr(address); // 매장 상세 정보를 받아옴

    if (!storeInfo) {
      // 스토어픽에 등록 되어있는 매장명이 없다면 리턴
      alert("입력하신 매장명이 존재하지 않습니다.");
      return;
    }

    naver.maps.Service.geocode(
      {
        query: storeInfo.receive_addr,
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
          map: map,
          position: point,
          //icon: {
          //  url: "//ecimg.cafe24img.com/pg241b58340239066/inthework/web/images/map/star2.svg",
          // size: new naver.maps.Size(50, 52),
          // origin: new naver.maps.Point(0, 0),
          // anchor: new naver.maps.Point(25, 26),
          // },
        });

        if (PREV_MARKER) {
          PREV_MARKER.setMap(null);
        }
        PREV_MARKER = marker;

        StorePickupAlert(); // 픽업 알림창 띄워줌
        map.setZoom(16);
        map.setCenter(point);
      }
    );
  }

  const HideQuickSearch = () => {
    const searchListCt = document.getElementById("search_list_ct");
    searchListCt.style.display = "none";
    searchListCt.innerHTML = "";
    searchListCt.style.height = "0px";
  };

  const showQuickSearchJustOne = () => {
    const searchListCt = document.getElementById("search_list_ct");
    searchListCt.style.display = "initial";
    searchListCt.innerHTML = "";
    searchListCt.style.height = height + 10 + "px";
  };

  const paintSearchStore = (name, addr) => {
    const searchListCt = document.getElementById("search_list_ct");
    const store = document.createElement("div");
    store.classList.add("store");
    store.innerHTML =
      `<div class="store_name"><h1>${name}</h1></div>` +
      `<div class="store_addr"><span>${addr}</span></div>`;
    searchListCt.appendChild(store);
    return store;
  };

  const quickSearch = (addr) => {
    const searchListCt = document.getElementById("search_list_ct");
    const storesLen = searchListCt.querySelectorAll(".store").length;

    searchListCt.innerHTML = "";

    if (storesLen === 0) {
      HideQuickSearch();
    }
    if (!addr.value) {
      HideQuickSearch();
      return;
    }

    let searchStoreArray = [];
    const value = addr.value;

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
        searchListCt.style.display = "initial";
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

        addr.value = quickValue;
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
