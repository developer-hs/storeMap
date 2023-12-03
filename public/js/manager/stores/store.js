window.addEventListener('DOMContentLoaded', async () => {
  const productAreaElmArr = Array.from(document.querySelectorAll('.product_area'));
  const utils = await import('../../utils/utils.js');

  const getStoreId = () => {
    return document.getElementById('storeId').dataset.storeId;
  };

  const getQunatitySubmitBtnElms = () => {
    return document.querySelectorAll('[id*="quantitySubmitBtn"]');
  };

  const setQuantity = async (elm) => {
    const quantityForm = { inventory: {} };
    const elmId = elm.dataset.id;
    const productId = elm.dataset.productId;
    const quantity = document.getElementById(`quantity_${elmId}`).value;
    quantityForm.inventory[productId] = quantity;

    try {
      const res = await axios.put(`/stores/store/${getStoreId()}`, quantityForm);
      if (res.status === 201) {
        utils.onAlertModal(res.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const quantityBtnHandler = () => {
    const qunatitySubmitBtnElms = getQunatitySubmitBtnElms();
    if (qunatitySubmitBtnElms.length < 1) return;

    qunatitySubmitBtnElms.forEach((qunatitySubmitBtnElm) => {
      qunatitySubmitBtnElm.addEventListener('click', () => {
        setQuantity(qunatitySubmitBtnElm);
      });
    });
  };

  const onSearch = (keyword) => {
    productAreaElmArr.forEach((element) => {
      const productName = element.dataset.productName;
      if (!productName.includes(keyword)) {
        element.classList.add('displaynone');
      } else {
        element.classList.remove('displaynone');
      }
    });
  };
  const searchHandler = () => {
    const searchElm = document.getElementById('search');
    searchElm.addEventListener('input', () => {
      onSearch(searchElm.value);
    });
  };

  searchHandler();
  quantityBtnHandler();
  utils.logoutHandler();
});
