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

  const showOrderDetailModal = () => {
    document.querySelector('.order_detail_modal_area').classList.remove('displaynone');
  };
  const hideOrderDetailModal = () => {
    document.querySelector('.order_detail_modal_area').classList.add('displaynone');

    document.getElementById('errMsg').innerText = '';
    document.getElementById('errorCard').classList.add('displaynone');
    document.querySelector('.order_detail_haed').style.paddingBottom = '0px';

    const tableContentElms = document.querySelectorAll('.order_detail_modal_area .table_content');
    tableContentElms.forEach((tableContentElm) => {
      tableContentElm.remove();
    });
  };
  const getOrderItems = async () => {
    const orderId = document.getElementById('orderId').value;

    if (!orderId) return;
    try {
      const orderDetailRes = await axios.get(`/api/v1/cafe24/order/detail?order_id=${orderId}`);
      if (orderDetailRes.status === 200) {
        showOrderDetailModal();
        const { orderItems, retrieveAnOrder } = orderDetailRes.data;
        const storeId = getStoreId();
        const findStoreIdFromOptRegex = /스토어픽업=.*\|\|\s([^;]*)/;

        if (!orderItems.length) return utils.onAlertModal('구매한 상품이 조회되지 않습니다.');

        const statusCode = {
          N1: '정상',
          N2: '교환상품',
          C1: '입금전취소',
          C2: '배송전취소',
          C3: '반품',
          E1: '교환',
        };

        const billingName = retrieveAnOrder.billing_name;
        const paymentMethods = retrieveAnOrder.payment_method_name; // Array
        const orderDate = retrieveAnOrder.order_date;

        document.getElementById('buyer').innerText = billingName;
        document.getElementById('paymentMethod').innerText = paymentMethods[0];
        document.getElementById('orderDate').innerText = orderDate;

        orderItems.forEach((orderItem) => {
          const depositStatus = orderItem.status_text;
          const orderStatusCode = orderItem.status_code;
          const productNo = orderItem.product_no;
          const orderQuantity = orderItem.quantity;
          const productName = orderItem.product_name;
          let productOptions = orderItem.option_value;
          let productAddOptions = orderItem.additional_option_value;
          let storeIdMatchCnt = 0;

          if (productOptions.match(findStoreIdFromOptRegex)) {
            if (productOptions.match(findStoreIdFromOptRegex)[1] === storeId) {
              storeIdMatchCnt += 1;
            }
          }
          if (productAddOptions.match(findStoreIdFromOptRegex)) {
            if (productAddOptions.match(findStoreIdFromOptRegex)[1] === storeId) {
              storeIdMatchCnt += 1;
            }
          }

          if (productOptions.includes(';')) {
            productOptions = productOptions.split(';').join('</p><p>');
            productOptions.replaceAll(storeId, `<span class="c-success">${storeId}</span>`);
          }
          if (productAddOptions.includes(';')) {
            productAddOptions = productAddOptions.split(';').join('</p><p>');
            productAddOptions.replaceAll(storeId, `<span class="c-success">${storeId}</span>`);
          }

          document.getElementById('depositStatus').innerText = depositStatus;
          document.getElementById('orderStatus').innerText = statusCode[orderStatusCode];

          const productImgURI = document.querySelector(`img[data-product-no='${productNo}']`).src;
          const tableContentTag = document.createElement('div');
          tableContentTag.classList.add('table_content');
          const content =
            `  <div class="product_id">${productNo}</div>` +
            `  <div class="product_image">` +
            `    <img src="${productImgURI}" />` +
            `  </div>` +
            `  <div class="product_name">${productName}</div>` +
            `  <div class="product_options">` +
            `    <p>${productOptions}</p>` +
            `    <p>${productAddOptions}</p>` +
            `  </div>` +
            `  <div class="product_order_quantity">${orderQuantity}</div>`;

          tableContentTag.innerHTML += content;

          if (storeIdMatchCnt <= 0) {
            tableContentTag.classList.add('section_notice_parent');
            const errorIcon =
              `<div class="error_icon">` +
              ` <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">` +
              `   <g clip-path="url(#clip0_252_8)">` +
              `     <path` +
              `       d="M25.2802 27.08H2.73021C1.40021 27.08 0.540213 25.64 1.13021 24.41L12.4102 5.94001C13.0702 4.58001 14.9502 4.58001 15.6002 5.94001L26.8802 24.4C27.4702 25.63 26.6102 27.07 25.2802 27.07V27.08Z"` +
              `       fill="#EFED76"` +
              `     />` +
              `     <path` +
              `       d="M25.2801 28H2.73013C1.81013 28 0.960127 27.53 0.450127 26.75C-0.079873 25.92 -0.149873 24.9 0.280127 24.01L11.6401 5.41C12.0201 4.59 12.9601 4 14.0001 4C15.0501 4 15.9901 4.59 16.4501 5.55L27.6501 23.88C28.1601 24.9 28.1001 25.93 27.5601 26.76C27.0601 27.54 26.2001 28.01 25.2801 28.01V28ZM14.0101 5.85C13.8601 5.85 13.4801 5.9 13.2601 6.34L1.90013 24.94C1.83013 25.12 1.85013 25.48 2.04013 25.77C2.12013 25.89 2.34013 26.16 2.73013 26.16H25.2801C25.6701 26.16 25.8901 25.89 25.9701 25.77C26.1601 25.48 26.1801 25.12 26.0301 24.81L14.8301 6.48C14.5301 5.9 14.1601 5.85 14.0001 5.85H14.0101Z"` +
              `       fill="#231815"` +
              `     />` +
              `     <path d="M14.8001 22H13.4701L12.1401 12H16.1401L14.8001 22Z" fill="#231815" />` +
              `     <path d="M15.1401 23.26H13.1401V25.37H15.1401V23.26Z" fill="#231815" />` +
              `   </g>` +
              `   <defs>` +
              `     <clipPath id="clip0_252_8">` +
              `       <rect width="28" height="28" fill="white" />` +
              `     </clipPath>` +
              `   </defs>` +
              ` </svg>` +
              `</div>`;
            tableContentTag.innerHTML += errorIcon;

            document.getElementById('errorCard').classList.remove('displaynone');
            document.querySelector('.order_detail_haed').style.paddingBottom = '80px';

            tableContentTag.addEventListener('mouseover', () => {
              const errMessageElm = document.getElementById('errMsg');
              errMessageElm.innerText = '옵션에 해당 매장코드가 존재하지 않습니다.';
            });

            tableContentTag.addEventListener('mouseleave', () => {
              const errMessageElm = document.getElementById('errMsg');
              errMessageElm.innerText = '';
            });
          }

          const orderDetailContentElm = document.querySelector('.order_detail_content');
          orderDetailContentElm.appendChild(tableContentTag);
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

  const detailModalMarginHandler = () => {
    const orderDetailModalAreaElm = document.getElementById('orderDetailModalArea');
    orderDetailModalAreaElm.addEventListener('click', (e) => {
      if (e.target !== orderDetailModalAreaElm) return;
      hideOrderDetailModal();
    });
  };

  const init = () => {
    searchHandler();
    orderSearchBtnHandler();
    quantityBtnHandler();
    detailModalMarginHandler();

    utils.logoutHandler();
  };

  init();
});
