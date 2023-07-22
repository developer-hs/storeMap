window.addEventListener('DOMContentLoaded', async () => {
  const utils = await import('../utils/utils.js');
  const getRequiredSetModalCt = () => {
    return document.querySelector('.required_setting_modal_ct');
  };

  const getRequiredEmailElm = () => {
    return getRequiredSetModalCt().querySelector('#requiredEmail');
  };
  const getRequiredPWElm = () => {
    return getRequiredSetModalCt().querySelector('#requiredPassword');
  };
  const getRequiredDomainElm = () => {
    return getRequiredSetModalCt().querySelector('#requiredDmn');
  };
  const getRequiredEmail = () => {
    return getRequiredEmailElm().value;
  };
  const getRequiredPW = () => {
    return getRequiredPWElm().value;
  };
  const getRequiredDomain = () => {
    return getRequiredDomainElm().value;
  };
  const submitBtnElm = () => {
    console.log(getRequiredSetModalCt());
    return getRequiredSetModalCt().querySelector('#requiredSettingSubmit');
  };
  const reactPWValid = () => {
    const engPattern = /[a-zA-Z]/;
    const numPattern = /\d/;
    const specialCharPattern = /[!@#$%^&*()_+{}\[\]:;<>,.?~`]/;

    const password = getRequiredPW().toString();
    if (password.length >= 8) {
      // 총 8글자 이상인지
      const target = document.querySelector('#pwPattern .total_cnt');
      target.classList.add('c-success');
    } else {
      const target = document.querySelector('#pwPattern .total_cnt');
      target.classList.remove('c-success');
    }
    if (engPattern.test(password)) {
      // 영문 들어있는지
      const target = document.querySelector('#pwPattern .eng');
      target.classList.add('c-success');
    } else {
      const target = document.querySelector('#pwPattern .eng');
      target.classList.remove('c-success');
    }
    if (numPattern.test(password)) {
      // 숫자 들어있는지
      const target = document.querySelector('#pwPattern .number');
      target.classList.add('c-success');
    } else {
      const target = document.querySelector('#pwPattern .number');
      target.classList.remove('c-success');
    }
    if (specialCharPattern.test(password)) {
      // 특수문자 들어있는지
      const target = document.querySelector('#pwPattern .special_char');
      target.classList.add('c-success');
    } else {
      const target = document.querySelector('#pwPattern .special_char');
      target.classList.remove('c-success');
    }
  };
  const reactPWValidHandler = () => {
    getRequiredPWElm().addEventListener('input', reactPWValid);
  };
  const getForm = () => {
    const form = {
      email: getRequiredEmail(),
      password: getRequiredPW(),
      origin: getRequiredDomain(),
    };

    return form;
  };

  const formIsValid = () => {
    const form = getForm();
    let errors = {
      email: { ok: true, element: getRequiredEmailElm() },
      password: { ok: true, element: getRequiredPWElm() },
      origin: { ok: true, element: getRequiredDomainElm() },
    };
    for (let key in form) {
      if (!form[key]) {
        if (key === 'email') {
          errors[key].ok = false;
          errors[key].message = '이메일을 입력해 주세요.';
        }
        if (key === 'password') {
          errors[key].ok = false;
          errors[key].message = '비밀번호를 입력해 주세요.';
        }
        if (key === 'origin') {
          errors[key].ok = false;
          errors[key].message = '도메인을 입력해 주세요.';
        }
      } else {
        if (getRequiredEmail() && key === 'email' && !utils.emailIsValid(form.email)) {
          // 값에 빈값은 없지만 그 값이 유효한지 검사
          errors['email'].ok = false;
          errors['email'].message = '이메일 형식이 잘못 되었습니다.';
        }
        if (getRequiredPW() && key === 'password' && !utils.passwordIsValid(form.password)) {
          // 값에 빈값은 없지만 그 값이 유효한지 검사
          errors['origin'].ok = false;
          errors['origin'].message = '도메인 형식이 잘못 되었습니다.';
        }
        if (getRequiredDomain() && key === 'origin' && !utils.originIsValid(form.origin)) {
          // 값에 빈값은 없지만 그 값이 유효한지 검사
          errors['origin'].ok = false;
          errors['origin'].message = '도메인 형식이 잘못 되었습니다.';
        }
      }
    }
    for (let key in errors) {
      if (!errors[key].ok) {
        return errors;
      }
    }

    return { ok: true, message: '성공적으로 등록 되었습니다.' };
  };

  /**
   *
   * @param {HTMLElement} elm
   * @param {String} message
   * @returns {Void}
   */
  const createErrMessage = (elm, message) => {
    const errDivElm = document.createElement('div');
    errDivElm.innerText = message;
    errDivElm.classList.add('err_message');

    elm.appendChild(errDivElm);
  };

  const removeErrMessage = (elm) => {
    const errMessageElm = elm.querySelector('.err_message');
    if (errMessageElm) {
      elm.removeChild(errMessageElm);
    }
  };

  const errMessageChk = (elm) => {
    if (elm.querySelector('.err_message')) {
      return true;
    }
    return false;
  };
  const onSubmit = async () => {
    const validData = formIsValid();
    if (!validData.ok) {
      for (let key in validData) {
        const textFieldElm = validData[key].element.parentNode;
        if (!validData[key].ok) {
          validData[key].element.style.borderColor = 'var(--color-danger)';
          if (!errMessageChk(textFieldElm)) {
            createErrMessage(textFieldElm, validData[key].message);
          }
        } else {
          if (errMessageChk(textFieldElm)) {
            removeErrMessage(textFieldElm);
          }
          validData[key].element.style.borderColor = 'var(--color-success)';
        }
      }
      return;
    }

    const form = getForm();
    const res = await axios.put('/api/v1/users/user/required', form);
    if (res.status === 200) {
      utils.onAlertModal('성공적으로 등록 되었습니다.');
    } else if (res.status === 500) {
      utils.onAlertModal(res.data.message);
    } else {
      alert('알수없는 오류가 발생 하였습니다.');
    }
  };
  const submitHandler = () => {
    submitBtnElm().addEventListener('click', onSubmit);
  };

  (function init() {
    submitHandler();
    reactPWValidHandler();
  })();
});
