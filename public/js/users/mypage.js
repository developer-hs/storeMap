window.addEventListener('DOMContentLoaded', async () => {
  const { getRootPropertyValue } = await import('../utils/utils.js');

  const getOriginElm = () => {
    return document.getElementById('domain');
  };

  const getOrigin = () => {
    return getOriginElm.value;
  };

  const originCheck = () => {
    const origin = getOrigin();
    if (!origin) {
      const dangerColor = getRootPropertyValue('--color-danger');
      getOriginElm().style.borderColor = dangerColor;
    }
  };

  const originHandler = () => {
    const originElm = getOriginElm();
    originElm.addEventListener('input', originCheck);
  };

  const mypageInit = () => {
    originHandler();
  };

  const init = () => {
    mypageInit();
  };

  init();
});
