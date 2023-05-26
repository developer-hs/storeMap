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
   * @return {List<Element>} 체크버튼 Element 들을 반환하는 함수
   */
  const getChkBtnElms = () => {
    return document.querySelectorAll('input.check_btn');
  };
  /**
   * @returns {Element} sideNav 에서 storesCate Element 반환하는 함수
   */

  /**
   * @returns {[Element?]} 체크된 상점 Element 들을 반환하는 함수
   */
  const getCheckedStoreElms = () => {
    const result = Array.from(getChkBtnElms())
      .filter((chkBtn) => {
        return chkBtn.checked;
      })
      .map((data) => {
        return data.parentNode.parentNode.dataset.storeId;
      });

    return result;
  };
  /**
   * @return {void} 체크된 상점들을 삭제하는 함수 1개일때, 여러개일 때 호출되는 API 가 다름
   */

  const onDelBtn = () => {
    getDelBtnElm().addEventListener('click', async () => {
      let storesId = 'storesId=';

      const checkedStores = getCheckedStoreElms();

      if (checkedStores.length === 1) {
        try {
          const res = await remove(`/stores/store/${checkedStores[0]}`);
          if (res.status === 200) {
            reload();
          }
        } catch (err) {
          console.error(err);
          return;
        }
      } else {
        try {
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
        } catch (err) {
          console.error(err);
          return;
        }
      }
    });
  };

  const onAllChkBtn = () => {
    const allChkBtn = getAllChkBtnElm();
    const chkBtns = getChkBtnElms();
    allChkBtn.addEventListener('click', () => {
      if (allChkBtn.checked) {
        chkBtns.forEach((chkBtn) => {
          chkBtn.checked = true;
        });
      } else {
        chkBtns.forEach((chkBtn) => {
          chkBtn.checked = false;
        });
      }
    });
  };
  const init = () => {
    onDelBtn();
    onAllChkBtn();
  };

  init();
});
