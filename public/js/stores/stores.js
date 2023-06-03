window.addEventListener('DOMContentLoaded', () => {
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

  /**
   * @returns {Array<Element>} 체크된 상점 Element 들을 반환하는 함수
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

  const getCoordSetBtn = () => {
    return document.getElementById('coordSetBtn');
  };
  /**
   * @return {void} 체크된 상점들을 삭제하는 함수 1개일때, 여러개일 때 호출되는 API 가 다름
   */
  const onDelete = async () => {
    let storesId = 'storesId=';

    const checkedStores = getCheckedStoreElms();

    if (checkedStores.length === 1) {
      // 삭제할 매장이 한개일 때
      const res = await remove(`/stores/store/${checkedStores[0]}`);
      if (res.status === 200) {
        reload();
      }
    } else {
      // 삭제할 매장이 여러개 일 때
      for (let i = 0; i < checkedStores.length; i++) {
        storesId += checkedStores[i];
        if (i !== checkedStores.length - 1) {
          storesId += ',';
        }
      }
      const res = await remove(`/stores/many?${storesId}`);
      if (res.status === 200) {
        onAlertModal('매장이 삭제되었습니다.');
        reload();
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
    const geoRes = await get('/stores/geocode/many', {}, async (error) => {
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
      } else {
        console.error(error);
      }
    });

    if (!geoRes) return;
    if (geoRes.status === 200) {
      try {
        const updateRes = await put('/stores/geocode/many', geoRes.data);
        if (updateRes.status === 200) {
          reload();
        }
      } catch (error) {
        console.error(error);
      }
    }

    return;
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

  const init = () => {
    deleteBtnHandler();
    allChkBtnHandler();
    coordSetBtnHandler();
  };

  init();
});
