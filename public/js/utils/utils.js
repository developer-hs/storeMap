export const onAlertModal = (message) => {
  const alertModal = document.querySelector('.alert_modal');
  const alertContent = document.querySelector('.alert_content');
  alertContent.innerText = message;
  alertModal.classList.add('on');
  setTimeout(() => {
    alertModal.classList.remove('on');
  }, 1300);
};

export const reload = () => {
  window.location.reload();
};
