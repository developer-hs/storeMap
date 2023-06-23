window.addEventListener('DOMContentLoaded', async () => {
  const { onAlertModal, reload, confirmCheck } = await import(
    '../utils/utils.js'
  );
  /**
   * @return {Element} 삭제버튼 Element 를 반환하는 함수
   */
  const getDelBtnElm = () => {
    return document.getElementById('deleteBtn');
  };

  /**
   * @return {Element} 모든 체크버튼을 담당하는 체크버튼을 반환하는 함수
   */
  const getAllChkBtnElm = () => {
    return document.getElementById('allCheckBtn');
  };
  /**
   * @return {Array<Element>} 체크버튼 Element 들을 반환하는 함수
   */
  const getChkBtnElms = () => {
    return document.querySelectorAll('input.check_btn');
  };
  const getFilterBtnElm = () => {
    return document.getElementById('filterBtn');
  };
  const getUseStatusBtnElms = () => {
    return document.querySelectorAll("input[id*='useStatus']");
  };
  /**
   * @description 체크된 상점 Element 들을 반환하는 함수
   * @returns {Array<Element>}
   */
  const getCheckedStoreElms = () => {
    const result = Array.from(getChkBtnElms())
      .filter((chkBtn) => {
        return chkBtn.checked;
      })
      .map((data) => {
        return data.parentNode.parentNode.id;
      });

    return result;
  };

  /**
   * @description 좌표설정 버튼을 가져오는 함수
   * @return {HTMLElement}
   */
  const getCoordSetBtn = () => {
    return document.getElementById('coordSetBtn');
  };

  /**
   * @description 등록된 스토어의 총 개수를 구함
   * @return {Number}
   */
  const getStoreTotalCnt = () => {
    return Number(document.getElementById('storeCount').innerText);
  };

  /**
   * @description
   * @return {HTMLElement}
   */
  const getFilterLimitElm = () => {
    return document.getElementById('storesLimit');
  };
  const getAlignFilter = () => {
    return document.getElementById('alignFilter');
  };
  /**
   * @description
   * @return {String}
   */
  const getFilterLimit = () => {
    const limitElm = getFilterLimitElm();
    return limitElm.options[limitElm.selectedIndex].value;
  };

  const getFilterAlign = () => {
    const alignElm = getAlignFilter();
    return alignElm.options[alignElm.selectedIndex].value;
  };
  const getFilterSubmitElm = () => {
    return document.getElementById('filterSubmit');
  };
  const getFilterCtElm = () => {
    return document.getElementById('filterCt');
  };
  const getFilterCloseBtnCtElm = () => {
    return document.getElementById('filterCloseBtnCt');
  };
  /**
   * @description 체크된 상점들을 삭제하는 함수 1개일때, 여러개일 때 호출되는 API 가 다름
   * @return {void}
   */

  const onDelete = async () => {
    let storesId = 'storesId=';

    const checkedStores = getCheckedStoreElms();
    if (checkedStores.length === 0) {
      onAlertModal('삭제할 매장을 선택해 주세요.');
      return;
    }

    const removeChk = confirmCheck('정말 삭제하시겠습니까?');

    if (removeChk) {
      if (checkedStores.length === 1) {
        // 삭제할 매장이 한개일 때
        try {
          const res = await axios.delete(`stores/store/${checkedStores[0]}`);
          if (res.status === 200) {
            onAlertModal('매장이 삭제되었습니다.');
            reload();
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        // 삭제할 매장이 여러개 일 때
        for (let i = 0; i < checkedStores.length; i++) {
          storesId += checkedStores[i];
          if (i !== checkedStores.length - 1) {
            storesId += ',';
          }
        }

        try {
          const res = await axios.delete(`stores/many?${storesId}`);
          if (res.status === 200) {
            onAlertModal('매장이 삭제되었습니다.');
            reload();
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const onAllChkBtn = () => {
    const allChkBtn = getAllChkBtnElm();
    const chkBtns = getChkBtnElms();

    if (allChkBtn.checked) {
      chkBtns.forEach((chkBtn) => {
        chkBtn.checked = true;
      });
    } else {
      chkBtns.forEach((chkBtn) => {
        chkBtn.checked = false;
      });
    }
  };

  const onCoordSet = async () => {
    let geoRes;
    try {
      geoRes = await axios.get('/stores/geocode/many', {});
      if (geoRes.status === 202) {
        console.warn(geoRes.data.message);
      }
    } catch (error) {
      if (error.response.status === 502) {
        const contentArea = document.getElementById('content-area');
        const errorTargetElm = document.getElementById(
          `${error.response.data.id}`
        );
        errorTargetElm.classList.add('wrong_addr');

        const rect = errorTargetElm.getBoundingClientRect();
        contentArea.scrollTo({
          top: rect.y + contentArea.scrollTop - 60,
        });
        alert(
          `상점명 : ${error.response.data.name}\n상점주소 : ${error.response.data.address}의 주소를 다시 확인해 주세요`
        );
        console.error(error);
      }
    }

    if (!geoRes) return;
    if (geoRes.status === 200) {
      try {
        const updateRes = await axios.put('/stores/geocode/many', geoRes.data);
        if (updateRes.status === 200) {
          reload();
        }
      } catch (error) {
        console.error(error);
      }
    }

    return;
  };

  const setPaginationWithLimit = () => {
    const pageElms = document.querySelectorAll('.pagination .page > a');
    const param = new URLSearchParams(window.location.search);
    const limit = param.get('limit');
    const align = param.get('align');
    if (limit) {
      pageElms.forEach((pageElm) => {
        const pageHref = new URL(pageElm.href);
        const pageHrefParams = pageHref.searchParams;
        pageHrefParams.set('limit', limit);
        pageHrefParams.set('align', align);
        pageElm.href = pageHref;
      });
    }
  };

  const onFilterSubmit = () => {
    const filterLimit = getFilterLimit();
    const filterAlign = getFilterAlign();
    const urlStr = window.location.href;
    const url = new URL(urlStr);

    const urlParams = url.searchParams;
    urlParams.set('limit', filterLimit);
    urlParams.set('align', filterAlign);

    window.location.href = url;
  };

  const showFilterCt = () => {
    const filterCtElm = getFilterCtElm();
    filterCtElm.classList.add('on');
  };

  const hideFilterCt = () => {
    const filterCtElm = getFilterCtElm();
    filterCtElm.classList.remove('on');
  };

  const onUseStatusBtn = async (useStatusElm) => {
    try {
      const storeId = useStatusElm.dataset.storeId;
      const storeAddr =
        useStatusElm.parentNode.parentNode.parentNode.parentNode.querySelector(
          '.store_addr'
        ).innerText;

      const res = await axios.put(`/stores/store/${storeId}`, {
        useStatus: useStatusElm.checked,
        address: storeAddr,
      });
      if (res.status === 200) {
        if (useStatusElm.checked) {
          onAlertModal('노출설정 되었습니다');
        } else {
          onAlertModal('노출설정이 비활성화 되었습니다');
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFilterCt = () => {
    getFilterBtnElm().addEventListener('click', onFilterBtn);
    getFilterCloseBtnCtElm().addEventListener('click', onFilterCloseBtn);
  };

  const onFilterBtn = () => {
    showFilterCt();
  };
  const onFilterCloseBtn = () => {
    hideFilterCt();
  };

  const coordSetBtnHandler = () => {
    getCoordSetBtn().addEventListener('click', onCoordSet);
  };

  const deleteBtnHandler = () => {
    getDelBtnElm().addEventListener('click', onDelete);
  };

  const allChkBtnHandler = () => {
    getAllChkBtnElm().addEventListener('click', onAllChkBtn);
  };

  const filterSubmitHandler = () => {
    getFilterSubmitElm().addEventListener('click', onFilterSubmit);
  };

  const useStatusBtnHandler = () => {
    const useStatusElms = getUseStatusBtnElms();
    useStatusElms.forEach((useStatusElm) => {
      useStatusElm.addEventListener('input', () => {
        onUseStatusBtn(useStatusElm);
      });
    });
  };

  const filterBtnHandler = () => {
    toggleFilterCt();
  };

  const init = () => {
    if (getStoreTotalCnt() > 0) {
      deleteBtnHandler();
      filterSubmitHandler();
      setPaginationWithLimit();
      filterBtnHandler();
      useStatusBtnHandler();
    }

    allChkBtnHandler();
    coordSetBtnHandler();
  };

  init();
});
