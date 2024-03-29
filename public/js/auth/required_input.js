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
        if (getRequiredEmail().length > 0 && key === 'email' && !utils.emailIsValid(form.email)) {
          // 값에 빈값은 없지만 그 값이 유효한지 검사
          errors['email'].ok = false;
          errors['email'].message = '이메일 형식이 잘못 되었습니다.';
        }
        if (getRequiredPW().length > 0 && key === 'password' && !utils.passwordIsValid(form.password)) {
          // 값에 빈값은 없지만 그 값이 유효한지 검사
          errors['password'].ok = false;
          errors['password'].message = '비밀번호 형식이 잘못 되었습니다.';
        }
        if (getRequiredDomain().length > 0 && key === 'origin' && !utils.originIsValid(form.origin)) {
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
    const errInputElm = elm.querySelector('input');
    errInputElm.classList.remove('clear');
    errInputElm.classList.add('err');

    const errDivElm = document.createElement('div');
    errDivElm.innerText = message;
    errDivElm.classList.add('err_message');

    elm.appendChild(errDivElm);

    return errDivElm;
  };

  const createImpErrMessage = (elm, message) => {
    const errInputElm = elm.querySelector('input');
    errInputElm.classList.remove('clear');
    errInputElm.classList.add('err');

    const errDivElm = document.createElement('div');
    errDivElm.innerText = message;
    errDivElm.classList.add('imp_err_message');

    elm.appendChild(errDivElm);

    return errDivElm;
  };

  const removeErrMessage = (elm, imp = false) => {
    const errMessageElm = elm.querySelector('.err_message');
    if (!imp && errMessageElm.classList.contains('imp')) {
      return;
    }
    if (errMessageElm) {
      elm.removeChild(errMessageElm);
    }
  };

  const removeAllImpMessage = () => {
    const impMessageElms = document.querySelectorAll('.imp_err_message');
    impMessageElms.forEach((impMessageElm) => {
      impMessageElm.remove();
    });
  };

  const errMessageChk = (elm) => {
    if (elm.querySelector('.err_message')) return true;

    return false;
  };

  const impErrMessageChk = (elm) => {
    if (elm.querySelector('.imp_err_message')) return true;

    return false;
  };

  const onSubmit = async () => {
    const validData = formIsValid();
    if (!validData.ok) {
      for (let key in validData) {
        const textFieldElm = validData[key].element.parentNode;
        if (!validData[key].ok) {
          if (!errMessageChk(textFieldElm)) {
            createErrMessage(textFieldElm, validData[key].message);
          }
        } else {
          if (errMessageChk(textFieldElm)) {
            removeErrMessage(textFieldElm, false);
          }
          validData[key].element.classList.add('clear');
          validData[key].element.classList.remove('err');
        }
      }
      return;
    }

    const form = getForm();

    try {
      const res = await axios.put('/api/v1/users/user/required', form);
      if (res.status === 200) {
        alert('성공적으로 등록 되었습니다.');
        utils.reload();
      }
    } catch (error) {
      if (error.response.status === 500) {
        removeAllImpMessage();
        const { errDatas } = error.response.data;
        errDatas.forEach((errData) => {
          const type = errData.type;

          let id;
          if (type === 'E') {
            id = 'emailTextFeild';
          }
          if (type === 'P') {
            id = 'pwTextFeild';
          }
          if (type === 'O') {
            id = 'domainTextFeild';
          }

          const errElm = document.getElementById(id);
          if (!impErrMessageChk(errElm)) {
            createImpErrMessage(errElm, errData.message);
          } else {
            const errMessage = errElm.querySelector('.err_message');
            errMessage.innerText = errData.message;
          }
        });
      } else {
        alert('알수없는 오류가 발생 하였습니다.');
      }
    }
  };
  const submitHandler = () => {
    submitBtnElm().addEventListener('click', onSubmit);
    const requiredInputElms = document.querySelectorAll('.required_ct input');
    requiredInputElms.forEach((requiredInputElm) => {
      requiredInputElm.addEventListener('keydown', (e) => {
        const keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
          onSubmit();
        }
      });
    });
  };

  (function init() {
    if (getRequiredSetModalCt()) {
      submitHandler();
      reactPWValidHandler();
    }
  })();
});

const sideNavCtElm = document.getElementById('sideNavCt');
const headerElm = document.getElementById('header');
const contentElm = document.getElementById('content');

sideNavCtElm.remove();
headerElm.remove();
contentElm.remove();
