window.addEventListener('DOMContentLoaded', () => {
  const getOrderBtnElms = () => {
    return document.querySelectorAll('.order_btn');
  };

  const getOrderData = (elm) => {
    const id = elm.dataset.productId;
    const sellPrice = elm.dataset.productPrice;
    const name = elm.dataset.productName;

    const result = { id, sellPrice, name, return_url: '/order/payment/success', automaticPayment: 'F' };
    return result;
  };
  const onOrderBtn = async (elm) => {
    const form = getOrderData(elm);

    try {
      const res = await axios.post('/order/payment', form);
      if (res.status === 201) {
        window.location.href = res.data.order.confirmation_url;
      }
    } catch (err) {
      console.error(err);
    }
  };
  const orderBtnHandler = () => {
    const orderBtnElms = getOrderBtnElms();

    orderBtnElms.forEach((orderBtnElm) => {
      orderBtnElm.addEventListener('click', () => {
        onOrderBtn(orderBtnElm);
      });
    });
  };

  orderBtnHandler();
});
