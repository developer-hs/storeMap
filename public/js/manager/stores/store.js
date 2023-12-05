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

  const getOrderItems = async () => {
    const orderId = document.getElementById('orderId').value;

    if (!orderId) return;
    try {
      const orderDetailRes = await axios.get(`/api/v1/cafe24/order/detail?order_id=${orderId}`);
      if (orderDetailRes.status === 200) {
        const { orderItems, retrieveAnOrder } = orderDetailRes.data;
        console.log(retrieveAnOrder);

        if (!orderItems.length) return utils.onAlertModal('구매한 상품이 조회되지 않습니다.');

        const billingName = orderDetailRes.billing_name;
        const paymentMethods = orderDetailRes.payment_method_name; // Array
        const orderData = orderDetailRes.order_date;
        orderItems.forEach((orderItem) => {
          const depositStatus = orderItem.status_text;
          const orderStatusCode = orderItem.status_code;
          let productOptions = orderItem.option_value;
          let productAddOptions = orderItem.additional_option_value;
          if (productOptions.includes(';')) {
            productOptions = productOptions.split(';').join(',');
          }
          if (productAddOptions.includes(';')) {
            productAddOptions = productAddOptions.split(';').join(',');
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const orderSearchBtnHandler = () => {
    const orderSearchBtnElm = document.getElementById('orderSearchBtn');
    orderSearchBtnElm.addEventListener('click', getOrderItems);
  };

  const init = () => {
    searchHandler();
    orderSearchBtnHandler();
    quantityBtnHandler();
    utils.logoutHandler();
  };

  init();
});
