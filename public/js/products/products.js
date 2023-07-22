window.addEventListener('DOMContentLoaded', async () => {
  const utils = await import('../utils/utils.js');
  let L_PRODUCTS_LIST = [];
  let mallId = sessionStorage.getItem('mall_id');

  const getPrdCntElm = () => {
    return document.getElementById('prdCnt');
  };

  const getUseStatusBatchPrcsBtn = () => {
    return document.getElementById('useStatusBatchPrcsUBtn');
  };
  const getSearchPrdNumBtn = () => {
    return document.getElementById('searchPrdNumBtn');
  };

  const getSearchPrdNumElm = () => {
    return document.getElementById('searchPrdNum');
  };

  const getActivationLimitElm = () => {
    return document.getElementById('activationLimit');
  };
  const getDeactivationLimitElm = () => {
    return document.getElementById('deactivationLimit');
  };

  const getProducts = async () => {
    const param = new URLSearchParams(window.location.search);
    const sinceProductNo = param.get('since_product_no') || 0;
    try {
      const res = await axios.get(`/api/products/${mallId}?since_product_no=${sinceProductNo}`);
      if (res.status === 200) {
        L_PRODUCTS_LIST = res.data.reverse();
        getPrdCntElm().innerText = L_PRODUCTS_LIST.length;
      }
    } catch (error) {
      console.error(error);
      alert('세션이 만료되었습니다 다시 접속해 주세요.');
      window.location.href = `https://${mallId}.cafe24.com/disp/admin/shop1/myapps/list`;
    }
  };

  const paintProducts = () => {
    let index = 1;
    const productsElm = document.getElementById('products');

    if (L_PRODUCTS_LIST.length > 0) {
      for (let key in L_PRODUCTS_LIST) {
        const productHTML =
          `<div class="product">` +
          `  <i class="xi-spinner-2 xi-spin"></i>` +
          `  <div class="prd_no">${L_PRODUCTS_LIST[key].product_no}</div>` +
          `  <div class="prd_img">` +
          `    <img` +
          `      src="${L_PRODUCTS_LIST[key].detail_image}"` +
          `      alt=""` +
          `    />` +
          `  </div>` +
          `  <div class="name">${L_PRODUCTS_LIST[key].product_name}</div>` +
          `  <div class="prd_price">₩${parseInt(L_PRODUCTS_LIST[key].price).toLocaleString(navigator.language)}</div>` +
          `  <div class="use_status switch_ct">` +
          `        <input class="switch_input" id="useStatus_${L_PRODUCTS_LIST[key].product_no}" data-product-id=${L_PRODUCTS_LIST[key].product_no} type="checkbox" />` +
          `        <label class="switch_label" for="useStatus_${L_PRODUCTS_LIST[key].product_no}"></label>` +
          `  </div>` +
          `</div>`;
        productsElm.innerHTML += productHTML;
        index++;
      }
    } else {
      const emptyStoreElm =
        `<div class="emtpy_product_ct">` +
        ` <div class="emtpy_product">` +
        `   <img src="/icons/empty_box.svg" alt="빈상자 아이콘">` +
        `   <span>등록된 상품이 존재하지 않습니다.</span>` +
        ` </div>` +
        `</div>`;

      productsElm.innerHTML += emptyStoreElm;
    }
  };

  /**
   * @description 스토어맵이 노출중인 상품의 스위치를 세팅해줌
   * @param {Object[]} products
   */
  const setUsingPrd = (products) => {
    products.forEach(async (product) => {
      const getSwitchElm = document.querySelector(`.use_status input[id=useStatus_${product.productId}]`);
      if (getSwitchElm) {
        getSwitchElm.parentNode.parentNode.classList.add('use');
        getSwitchElm.checked = true;
      } else {
        try {
          const res = await axios.delete(`/products/product/${product.productId}`);
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  /**
   *
   * @returns {Object[]}
   */
  const getUsingProducts = async () => {
    try {
      const res = await axios.get('/api/products/use_status');
      if (res.status === 200) {
        return res.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const usingProductInit = async () => {
    const products = await getUsingProducts();
    if (products.length > 0) {
      setUsingPrd(products);
    }
  };

  const setActivationLimit = (limit) => {
    getActivationLimitElm().innerText = limit;
  };

  const setDeactivationLimit = (limit) => {
    getDeactivationLimitElm().innerText = limit;
  };

  const onUseStatus = async (useStatusElm) => {
    try {
      // const loadingGuard = utils.createLoadingGaurd();
      // utils.paintLoadingGuard(loadingGuard);
      const productId = useStatusElm.dataset.productId;
      const useStatus = useStatusElm.checked;

      const form = [
        {
          productId: productId,
          useStatus: useStatus,
        },
      ];

      const res = await axios.post(`/api/products/product/${mallId}/option`, form);

      useStatusElm.parentNode.parentNode.classList.add('loading');
      setTimeout(() => {
        useStatusElm.parentNode.parentNode.classList.remove('loading');
      }, 2000);
      if (res.status === 201 || res.status === 200) {
        const apiCallLimit = res.data.xApiCallLimit;
        if (res.data.type === 'create') {
          setActivationLimit(apiCallLimit);
        } else if (res.data.type === 'update') {
          setDeactivationLimit(apiCallLimit);
        } else if (res.data.type === 'pass') {
        }

        if (useStatus) {
          useStatusElm.parentNode.parentNode.classList.add('use');
        } else {
          useStatusElm.parentNode.parentNode.classList.remove('use');
        }
        useStatusElm.checked = useStatus;
        // utils.removeLoadingGuard(loadingGuard);
        utils.onAlertModal('설정이 완료되었습니다.');
      }
    } catch (error) {
      console.error(error);
      utils.onAlertModal(error.message);
      // utils.removeLoadingGuard(loadingGuard);
    }
  };

  const onUseStatusBatchPrcsBtn = () => {
    try {
      const useStatusElms = document.querySelectorAll("input[id*='useStatus']");
    } catch (error) {
      console.error(error);
    }
  };

  const onSearchPrdNumBtn = () => {
    const searchPrdNum = document.getElementById('searchPrdNum').value;
    if (searchPrdNum) {
      const currentUrl = new URL(window.location.href);
      const currentUrlParams = currentUrl.searchParams;
      currentUrlParams.set('since_product_no', searchPrdNum);
      window.location.href = currentUrl;
    }
  };

  const useStatusHandler = () => {
    const useStatusElms = document.querySelectorAll('.use_status .switch_input');

    useStatusElms.forEach((useStatusElm) => {
      useStatusElm.addEventListener('click', (e) => {
        e.preventDefault();
        onUseStatus(useStatusElm);
      });
    });
  };

  const useStatusBatchPrcsBtnHandler = () => {
    getUseStatusBatchPrcsBtn().addEventListener('click', onUseStatusBatchPrcsBtn);
  };

  const searchPrdNumBtnHandler = () => {
    getSearchPrdNumBtn().addEventListener('click', onSearchPrdNumBtn);
  };

  const searchPrdNumInit = () => {
    const param = new URLSearchParams(window.location.search);
    const sincePrdNo = param.get('since_product_no');

    if (sincePrdNo) {
      getSearchPrdNumElm().value = sincePrdNo;
    }
  };

  const handlers = () => {
    useStatusBatchPrcsBtnHandler();
    useStatusHandler();
    searchPrdNumBtnHandler();
  };

  const processInit = async () => {
    await getProducts();
    paintProducts();
    usingProductInit();
    searchPrdNumInit();
  };

  const init = async () => {
    if (!mallId) {
      mallId = 'rlagudtjq2016';
    }

    await processInit();
    handlers();
  };

  init();
});
