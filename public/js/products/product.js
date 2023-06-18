window.addEventListener('DOMContentLoaded', () => {
  let L_PRODUCTS_LIST;

  const token = 'Bearer PqwAD943NtoiDM0jfuhF3E';
  const mallId = 'rlagudtjq2016';
  const getProducts = async () => {
    try {
      const res = await axios.get(`https://${mallId}/api/v2/admin/products`, {
        Authorization: token,
        'Content-Type': 'application/json',
      });

      if (res.status === 200) {
        L_PRODUCTS_LIST = res.data.products;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const paintProducts = () => {
    let index = 1;
    const productsElm = document.getElementById('products');
    for (let key in L_PRODUCTS_LIST) {
      const productHTML =
        `<div class="product">` +
        `  <div class="prd_no">${L_PRODUCTS_LIST[key].product_no}</div>` +
        `  <div class="prd_img">` +
        `    <img` +
        `      src="${L_PRODUCTS_LIST[key].detail_image}"` +
        `      alt=""` +
        `    />` +
        `  </div>` +
        `  <div class="name">${L_PRODUCTS_LIST[key].product_name}</div>` +
        `  <div class="prd_price">${L_PRODUCTS_LIST[key].price}</div>` +
        `  <div class="use_status switch_ct">` +
        `    <div>` +
        `      <div>` +
        `        <input class="switch_input" id="useStatus_${L_PRODUCTS_LIST[key].product_no}" data-product-id=${L_PRODUCTS_LIST[key].product_no} type="checkbox" />` +
        `        <label class="switch_label" for="useStatus_${L_PRODUCTS_LIST[key].product_no}"></label>` +
        `      </div>` +
        `    </div>` +
        `  </div>` +
        `</div>`;
      productsElm.innerHTML += productHTML;

      index++;
    }
  };

  const setUsingPrd = (products) => {
    products.forEach(async (product) => {
      const getSwitchElm = document.querySelector(
        `.use_status input[id=useStatus_${product.productId}]`
      );
      if (getSwitchElm) {
        getSwitchElm.checked = true;
      } else {
        try {
          const res = await axios.delete(
            `/products/product/${product.productId}`
          );
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  const getUsingProducts = async () => {
    try {
      const res = await axios.get('/api/product/use_status');
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

  const onUseStatus = async (useStatusElm) => {
    try {
      const productId = useStatusElm.dataset.productId;
      const useStatus = useStatusElm.checked;
      const form = {
        productId: productId,
        useStatus: useStatus,
      };

      const res = await axios.post('/api/products/product', form);

      if (res.status === 201) {
        console.log(res);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const useStatusHandler = () => {
    const useStatusElms = document.querySelectorAll(
      '.use_status .switch_input'
    );

    useStatusElms.forEach((useStatusElm) => {
      useStatusElm.addEventListener('input', () => {
        onUseStatus(useStatusElm);
      });
    });
  };

  const init = () => {
    getProducts();
    paintProducts();
    usingProductInit();
    useStatusHandler();
  };

  init();
});
