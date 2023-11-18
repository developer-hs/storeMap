document.addEventListener('DOMContentLoaded', async () => {
  const utils = await import('../utils/utils.js');

  let theFirstUIType;

  let widgetStatus = {};

  const handler = {
    set(target, property, value) {
      target[property] = value;

      // 이전값과 다르다면 변경 Alert 창 띄어줌
      if (target['prev'] !== target['cur']) {
        showSaveAlert();
      } else {
        let clear = true;
        for (const key in widgetStatus) {
          // 모든값이 이전값과 같다면 Alert 창 제거
          if (widgetStatus[key].prev !== widgetStatus[key].cur) {
            clear = false;
            break;
          }
        }

        if (clear) hideSaveAlert();
      }

      return true;
    },
  };

  const deepProxy = (obj, handler) => {
    for (let prop in obj) {
      if (typeof obj[prop] === 'object' && obj[prop] !== null) {
        obj[prop] = deepProxy(obj[prop], handler);
      }
    }
    return new Proxy(obj, handler);
  };

  const getMainColor = () => {
    return document.getElementById('mainColorPickrCt').dataset.color;
  };
  const getTextColor = () => {
    return document.getElementById('uiTextColorCt').dataset.color;
  };
  const getActiveTextColor = () => {
    return document.getElementById('uiActiveTextColorCt').dataset.color;
  };
  const getTitleTextColor = () => {
    return document.getElementById('uiTitleTextColorCt').dataset.color;
  };
  const getAddressTextColor = () => {
    return document.getElementById('uiAddressTextColorCt').dataset.color;
  };
  const getDistanceTextColor = () => {
    return document.getElementById('uiDistanceTextColorCt').dataset.color;
  };
  const getMapTitleTextColor = () => {
    return document.getElementById('uiMapTitleTextColorCt').dataset.color;
  };
  const getMapAddressTextColor = () => {
    return document.getElementById('uiMapAddressTextColorCt').dataset.color;
  };
  const getQuickSearchTitleTextColor = () => {
    return document.getElementById('uiQuickSearchTitleTextColorCt').dataset.color;
  };
  const getQuickSearchDistanceTextColor = () => {
    return document.getElementById('uiQuickSearchDistanceTextColorCt').dataset.color;
  };
  const getQuickSearchAddressTextColor = () => {
    return document.getElementById('uiQuickSearchAddressTextColorCt').dataset.color;
  };
  const getQuickSearchTitleTextHoverColor = () => {
    return document.getElementById('uiQuickSearchTitleTextHoverColorCt').dataset.color;
  };
  const getQuickSearchDistanceTextHoverColor = () => {
    return document.getElementById('uiQuickSearchDistanceTextHoverColorCt').dataset.color;
  };
  const getQuickSearchAddressTextHoverColor = () => {
    return document.getElementById('uiQuickSearchAddressTextHoverColorCt').dataset.color;
  };
  const getOverlayTitleTextColor = () => {
    return document.getElementById('uiOverlayTitleTextColorCt').dataset.color;
  };
  const getOverlayAddressTextColor = () => {
    return document.getElementById('uiOverlayAddressTextColorCt').dataset.color;
  };
  const getOverlayCloseBtnTextColor = () => {
    return document.getElementById('uiOverlayCloseBtnTextColorCt').dataset.color;
  };
  const getOverlayPickupBtnTextColor = () => {
    return document.getElementById('uiOverlayPickupBtnTextColorCt').dataset.color;
  };
  const getDistanceTextElm = () => {
    return document.getElementById('uiDistanceTextColorCt');
  };
  const getSubmitBtn = () => {
    return document.getElementById('submitBtn');
  };
  const getTypeSearchStoreElm = () => {
    return document.getElementById('typeSearchStore');
  };
  const getTypeSearchDong = () => {
    return document.getElementById('typeSearchDong');
  };
  const getTitleElms = () => {
    return document.querySelectorAll('.store_name');
  };
  const getAddressTextElms = () => {
    return document.querySelectorAll('.address');
  };
  const getDistanceTextElms = () => {
    return document.querySelectorAll('.distance');
  };
  const getMapTitleElm = () => {
    return document.getElementById('mapTitle');
  };
  const getUIInputElms = () => {
    return document.querySelectorAll('.ui_ct input[name="uiType"]');
  };
  const getStorePickBtnElms = () => {
    return document.querySelectorAll('.store_pick_btn');
  };
  const getActivePageElm = () => {
    return document.querySelector('.page.active');
  };
  const getSelectedStoreNameElm = () => {
    return document.querySelector('#mapTitle .selected_store_name');
  };
  const getMapAddressElm = () => {
    return document.getElementById('storeAddress');
  };
  const getSubmitBtnElm = () => {
    return document.getElementById('submit');
  };
  const getQuickSearchTitleElm = () => {
    return document.querySelector('#searchListCt .store_name h1');
  };
  const getQuickSearchDistanceElm = () => {
    return document.querySelector('#searchListCt .store_addr .distance');
  };
  const getQuickSearchAddrElm = () => {
    return document.querySelector('#searchListCt .store_addr .addr');
  };
  const getQuickSearchStoreElm = () => {
    return document.querySelector('#searchListCt .store');
  };
  const getSectionCtElms = () => {
    return document.querySelectorAll('.section_ct');
  };
  const getStoreListSection = () => {
    return document.getElementById('storeListSection');
  };
  const getRenewBtnElm = () => {
    return document.getElementById('renewBtn');
  };
  const getSaveAlert = () => {
    return document.getElementById('saveAlert');
  };
  const getOverlayElm = () => {
    return document.querySelector('#map .iw_inner');
  };
  const getOverlayCloseBtnElm = () => {
    return document.querySelector('#map .close-btn');
  };
  const getOverlayPickupBtnElm = () => {
    return document.querySelector('#map .pickup-btn');
  };
  const getOverlayTitleElm = () => {
    return document.getElementById('overlayTitle');
  };
  const getOverlayAddressElm = () => {
    return document.getElementById('overlayAddress');
  };
  const getNormalMkUploadInputElm = () => {
    return document.getElementById('markerUpload');
  };
  const getNowMkUploadInputElm = () => {
    return document.getElementById('nowMarkerUpload');
  };
  const getUploadSubmitBtnElm = () => {
    return document.getElementById('markerSubmit');
  };
  const getMarkerUploadInputElms = () => {
    return [getNormalMkUploadInputElm(), getNowMkUploadInputElm()];
  };
  const getMarkerInitBtnElm = () => {
    return document.getElementById('markerInitBtn');
  };
  const getNormalMarkerImgElm = () => {
    return document.querySelector("label[for='markerUpload'] img");
  };
  const getNowMarkerImgElm = () => {
    return document.querySelector("label[for='nowMarkerUpload'] img");
  };

  const getUIType = () => {
    const uiElms = getUIInputElms();
    for (let i = 0; i < uiElms.length; i++) {
      if (uiElms[i].checked) {
        return uiElms[i].value;
      }
    }
  };

  const initGlobalVariableColor = () => {
    const uiPrev = document.querySelector('#uiCt input:checked').value;

    widgetStatus = {
      ui: { prev: uiPrev, cur: uiPrev },
      uiColor: { prev: getMainColor(), cur: getMainColor() },
      activeTextColor: { prev: getActiveTextColor(), cur: getActiveTextColor() },
      textColor: { prev: getTextColor(), cur: getTextColor() },
      titleTextColor: { prev: getTitleTextColor(), cur: getTitleTextColor() },
      addressTextColor: { prev: getAddressTextColor(), cur: getAddressTextColor() },
      distanceTextColor: { prev: getDistanceTextColor(), cur: getDistanceTextColor() },
      mapTitleTextColor: { prev: getMapTitleTextColor(), cur: getMapTitleTextColor() },
      mapAddressTextColor: { prev: getMapAddressTextColor(), cur: getMapAddressTextColor() },
      quickSearchTitleTextColor: { prev: getQuickSearchTitleTextColor(), cur: getQuickSearchTitleTextColor() },
      quickSearchDistanceTextColor: { prev: getQuickSearchDistanceTextColor(), cur: getQuickSearchDistanceTextColor() },
      quickSearchAddressTextColor: { prev: getQuickSearchAddressTextColor(), cur: getQuickSearchAddressTextColor() },
      quickSearchTitleTextHoverColor: { prev: getQuickSearchTitleTextHoverColor(), cur: getQuickSearchTitleTextHoverColor() },
      quickSearchDistanceTextHoverColor: { prev: getQuickSearchDistanceTextHoverColor(), cur: getQuickSearchDistanceTextHoverColor() },
      quickSearchAddressTextHoverColor: { prev: getQuickSearchAddressTextHoverColor(), cur: getQuickSearchAddressTextHoverColor() },
      overlayTitleTextColor: { prev: getOverlayTitleTextColor(), cur: getOverlayTitleTextColor() },
      overlayAddressTextColor: { prev: getOverlayAddressTextColor(), cur: getOverlayAddressTextColor() },
      overlayCloseBtnTextColor: { prev: getOverlayCloseBtnTextColor(), cur: getOverlayCloseBtnTextColor() },
      overlayPickupBtnTextColor: { prev: getOverlayPickupBtnTextColor(), cur: getOverlayPickupBtnTextColor() },
      normalMarker: { prev: getNormalMarkerImgElm().src, cur: getNormalMarkerImgElm().src },
      nowMarker: { prev: getNowMarkerImgElm().src, cur: getNowMarkerImgElm().src },
    };

    // proxy 설정
    deepProxy(widgetStatus, handler);

    getQuickSearchStoreElm().addEventListener('mouseover', () => {
      getQuickSearchTitleElm().style.color = widgetStatus.quickSearchTitleTextHoverColor.cur;
      getQuickSearchDistanceElm().style.color = widgetStatus.quickSearchDistanceTextHoverColor.cur;
      getQuickSearchAddrElm().style.color = widgetStatus.quickSearchAddressTextHoverColor.cur;
    });
    getQuickSearchStoreElm().addEventListener('mouseout', () => {
      getQuickSearchTitleElm().style.color = widgetStatus.quickSearchTitleTextColor.cur;
      getQuickSearchDistanceElm().style.color = widgetStatus.quickSearchDistanceTextColor.cur;
      getQuickSearchAddrElm().style.color = widgetStatus.quickSearchAddressTextColor.cur;
    });
  };

  const showSaveAlert = () => {
    getSaveAlert().classList.add('on');
  };

  const hideSaveAlert = () => {
    getSaveAlert().classList.remove('on');
  };

  const pickrSave = (callback) => {
    callback();
  };

  const createPickr = async () => {
    const pickrComponents = {
      // Main components
      preview: true,
      opacity: true,
      hue: true,

      // Input / output Options
      interaction: {
        hex: true,
        rgba: false,
        hsla: false,
        hsva: false,
        cmyk: false,
        input: true,
        clear: false,
        save: true,
      },
    };

    swatches = [
      'rgba(244, 67, 54, 1)',
      'rgba(233, 30, 99, 0.95)',
      'rgba(156, 39, 176, 0.9)',
      'rgba(103, 58, 183, 0.85)',
      'rgba(63, 81, 181, 0.8)',
      'rgba(33, 150, 243, 0.75)',
      'rgba(3, 169, 244, 0.7)',
      'rgba(0, 188, 212, 0.7)',
      'rgba(0, 150, 136, 0.75)',
      'rgba(76, 175, 80, 0.8)',
      'rgba(139, 195, 74, 0.85)',
      'rgba(205, 220, 57, 0.9)',
      'rgba(255, 235, 59, 0.95)',
      'rgba(255, 193, 7, 1)',
    ];

    const createPickrConfig = (el, defaultColor) => {
      return {
        el: el,
        theme: 'classic', //'classic' or 'monolith', or 'nano'
        default: defaultColor,
        swatches: swatches,
        components: pickrComponents,
      };
    };

    // Simple example, see optional options for more configuration.
    const mainUIColorPickr = Pickr.create(createPickrConfig('#uiMainColor', getMainColor()));
    const ActiveTextColorPickr = Pickr.create(createPickrConfig('#uiActiveTextColor', getActiveTextColor()));
    const TextColorPickr = Pickr.create(createPickrConfig('#uiTextColor', getTextColor()));
    const TitleTextColorPickr = Pickr.create(createPickrConfig('#uiTitleTextColor', getTitleTextColor()));
    const addressTextColorPickr = Pickr.create(createPickrConfig('#uiAddressTextColor', getAddressTextColor()));
    const distanceTextColorPickr = Pickr.create(createPickrConfig('#uiDistanceTextColor', getDistanceTextColor()));
    const mapTitleTextColorPickr = Pickr.create(createPickrConfig('#uiMapTitleTextColor', getMapTitleTextColor()));
    const mapAddressTextColorPickr = Pickr.create(createPickrConfig('#uiMapAddressTextColor', getMapAddressTextColor()));
    const mapQuickSearchTitleTextColorPickr = Pickr.create(
      createPickrConfig('#uiQuickSearchTitleTextColor', getQuickSearchTitleTextColor())
    );
    const quickSearchDistanceTextColorPickr = Pickr.create(
      createPickrConfig('#uiQuickSearchDistanceTextColor', getQuickSearchDistanceTextColor())
    );
    const quickSearchAddressTextColorPickr = Pickr.create(
      createPickrConfig('#uiQuickSearchAddressTextColor', getQuickSearchAddressTextColor())
    );
    const quickSearchTitleTextHoverColorPickr = Pickr.create(
      createPickrConfig('#uiQuickSearchTitleTextHoverColor', getQuickSearchTitleTextHoverColor())
    );
    const quickSearchDistanceTextHoverColorPickr = Pickr.create(
      createPickrConfig('#uiQuickSearchDistanceTextHoverColor', getQuickSearchDistanceTextHoverColor())
    );
    const quickSearchAddressTextHoverColorPickr = Pickr.create(
      createPickrConfig('#uiQuickSearchAddressTextHoverColor', getQuickSearchAddressTextHoverColor())
    );
    const overlayTitleTextColorPickr = Pickr.create(createPickrConfig('#uiOverlayTitleTextColor', getOverlayTitleTextColor()));
    const overlayAddressTextColorPickr = Pickr.create(createPickrConfig('#uiOverlayAddressTextColor', getOverlayAddressTextColor()));
    const overlayCloseBtnTextColorPickr = Pickr.create(createPickrConfig('#uiOverlayCloseBtnTextColor', getOverlayCloseBtnTextColor()));
    const overlayPickupBtnTextColorPickr = Pickr.create(createPickrConfig('#uiOverlayPickupBtnTextColor', getOverlayPickupBtnTextColor()));

    mainUIColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.uiColor.cur = selectedColor;
        getTypeSearchStoreElm().style.backgroundColor = selectedColor;
        getMapTitleElm().style.backgroundColor = selectedColor;
        getSubmitBtnElm().style.color = selectedColor;
        getOverlayElm().style.cssText = `border-color : ${selectedColor}`;
        getOverlayCloseBtnElm().style.cssText = `border-top: 1px solid ${selectedColor}`;
        getOverlayPickupBtnElm().style.cssText = `background-color: ${selectedColor}; border-color: ${selectedColor}`;
        getActivePageElm().style.backgroundColor = selectedColor;
        getStorePickBtnElms().forEach((getStorePickBtnElm) => {
          getStorePickBtnElm.style.fill = selectedColor;
        });
      });
    });

    ActiveTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.activeTextColor.cur = selectedColor;
        getTypeSearchStoreElm().style.color = selectedColor;
      });
    });

    TextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.textColor.cur = selectedColor;
        getTypeSearchDong().style.color = selectedColor;
      });
    });

    TitleTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.titleTextColor.cur = selectedColor;
        getTitleElms().forEach((getTitleElm) => {
          getTitleElm.style.color = selectedColor;
        });
      });
    });

    distanceTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.distanceTextColor.cur = selectedColor;
        getDistanceTextElms().forEach((distanceElm) => {
          distanceElm.style.color = selectedColor;
        });
      });
    });

    addressTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.addressTextColor.cur = selectedColor;
        getAddressTextElms().forEach((getAddressTextElm) => {
          getAddressTextElm.style.color = selectedColor;
        });
      });
    });

    mapTitleTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.mapTitleTextColor.cur = selectedColor;
        getSelectedStoreNameElm().style.color = selectedColor;
      });
    });

    mapAddressTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.mapAddressTextColor.cur = selectedColor;
        getMapAddressElm().style.color = selectedColor;
      });
    });

    mapQuickSearchTitleTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.quickSearchTitleTextColor.cur = selectedColor;
        getQuickSearchTitleElm().style.color = selectedColor;
      });
    });

    quickSearchDistanceTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.quickSearchDistanceTextColor.cur = selectedColor;
        getQuickSearchDistanceElm().style.color = selectedColor;
      });
    });

    quickSearchAddressTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.quickSearchAddressTextColor.cur = selectedColor;
        getQuickSearchAddrElm().style.color = selectedColor;
      });
    });

    quickSearchTitleTextHoverColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.quickSearchTitleTextHoverColor.cur = selectedColor;
      });
    });

    quickSearchDistanceTextHoverColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.quickSearchDistanceTextHoverColor.cur = selectedColor;
      });
    });

    quickSearchAddressTextHoverColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.quickSearchAddressTextHoverColor.cur = selectedColor;
      });
    });
    overlayTitleTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.overlayTitleTextColor.cur = selectedColor;
        getOverlayTitleElm().style.color = selectedColor;
      });
    });
    overlayAddressTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.overlayAddressTextColor.cur = selectedColor;
        getOverlayAddressElm().style.color = selectedColor;
      });
    });
    overlayCloseBtnTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.overlayCloseBtnTextColor.cur = selectedColor;
        getOverlayCloseBtnElm().style.color = selectedColor;
      });
    });
    overlayPickupBtnTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        widgetStatus.overlayPickupBtnTextColor.cur = selectedColor;
        getOverlayPickupBtnElm().style.color = selectedColor;
      });
    });

    getRenewBtnElm().addEventListener('click', () => {
      document.getElementById('defaultUI').click();
      mainUIColorPickr.setColor('#000000');
      ActiveTextColorPickr.setColor('#ffffff');
      TextColorPickr.setColor('#000000');
      TitleTextColorPickr.setColor('#000000');
      addressTextColorPickr.setColor('#000000');
      distanceTextColorPickr.setColor('#979797');
      mapTitleTextColorPickr.setColor('#ffffff');
      mapAddressTextColorPickr.setColor('#e1e1e1');
      mapQuickSearchTitleTextColorPickr.setColor('#666666');
      quickSearchTitleTextHoverColorPickr.setColor('#000000');
      quickSearchDistanceTextColorPickr.setColor('#979797');
      quickSearchAddressTextColorPickr.setColor('#979797');
      quickSearchDistanceTextHoverColorPickr.setColor('#9987cd');
      quickSearchAddressTextHoverColorPickr.setColor('#9987cd');
      overlayTitleTextColorPickr.setColor('#000000');
      overlayAddressTextColorPickr.setColor('#000000');
      overlayCloseBtnTextColorPickr.setColor('#000000');
      overlayPickupBtnTextColorPickr.setColor('#ffffff');
    });
  };

  const colorToString = (color) => {
    return color.toHEXA().toString();
  };

  const onUI = () => {
    const UIType = getUIType();
    const distanceElms = document.querySelectorAll('#pickupStore .distance');

    if (UIType === 'default') {
      distanceElms.forEach((distanceElm) => {
        distanceElm.classList.add('displaynone');
      });
      getDistanceTextElm().parentNode.classList.add('displaynone');
    } else {
      distanceElms.forEach((distanceElm) => {
        distanceElm.classList.remove('displaynone');
      });
      getDistanceTextElm().parentNode.classList.remove('displaynone');
    }

    // UI Type 에 따라 거리 옵션이 사라지기 때문에 해당 옵션 박스 크기가 안맞아서 OFF 시킴
    if (getStoreListSection().parentNode.classList.contains('tab_on')) {
      getStoreListSection().click();
    }

    widgetStatus.ui.cur = UIType;
  };

  const UITypeHandler = () => {
    const UITInputElms = getUIInputElms();
    UITInputElms.forEach((UITInputElm) => {
      UITInputElm.addEventListener('click', onUI);
    });
  };

  const onSubmit = async () => {
    const form = {
      ui: getUIType(),
      uiColor: widgetStatus.uiColor.cur,
      activeTextColor: widgetStatus.activeTextColor.cur,
      textColor: widgetStatus.textColor.cur,
      titleTextColor: widgetStatus.titleTextColor.cur,
      addressTextColor: widgetStatus.addressTextColor.cur,
      distanceTextColor: widgetStatus.distanceTextColor.cur,
      mapTitleTextColor: widgetStatus.mapTitleTextColor.cur,
      mapAddressTextColor: widgetStatus.mapAddressTextColor.cur,
      quickSearchTitleTextColor: widgetStatus.quickSearchTitleTextColor.cur,
      quickSearchDistanceTextColor: widgetStatus.quickSearchDistanceTextColor.cur,
      quickSearchAddressTextColor: widgetStatus.quickSearchAddressTextColor.cur,
      quickSearchTitleTextHoverColor: widgetStatus.quickSearchTitleTextHoverColor.cur,
      quickSearchDistanceTextHoverColor: widgetStatus.quickSearchDistanceTextHoverColor.cur,
      quickSearchAddressTextHoverColor: widgetStatus.quickSearchAddressTextHoverColor.cur,
      overlayTitleTextColor: widgetStatus.overlayTitleTextColor.cur,
      overlayAddressTextColor: widgetStatus.overlayAddressTextColor.cur,
      overlayCloseBtnTextColor: widgetStatus.overlayCloseBtnTextColor.cur,
      overlayPickupBtnTextColor: widgetStatus.overlayPickupBtnTextColor.cur,
    };

    try {
      const res = await axios.put('/api/widgets/styles', form);
      if (res.status === 200) {
        utils.onAlertModal('성공적으로 저장 되었습니다.');
        widgetStatus.ui.prev = widgetStatus.ui.cur;
        widgetStatus.uiColor.prev = widgetStatus.uiColor.cur;
        widgetStatus.activeTextColor.prev = widgetStatus.activeTextColor.cur;
        widgetStatus.textColor.prev = widgetStatus.textColor.cur;
        widgetStatus.titleTextColor.prev = widgetStatus.titleTextColor.cur;
        widgetStatus.addressTextColor.prev = widgetStatus.addressTextColor.cur;
        widgetStatus.distanceTextColor.prev = widgetStatus.distanceTextColor.cur;
        widgetStatus.mapTitleTextColor.prev = widgetStatus.mapTitleTextColor.cur;
        widgetStatus.mapAddressTextColor.prev = widgetStatus.mapAddressTextColor.cur;
        widgetStatus.quickSearchTitleTextColor.prev = widgetStatus.quickSearchTitleTextColor.cur;
        widgetStatus.quickSearchDistanceTextColor.prev = widgetStatus.quickSearchDistanceTextColor.cur;
        widgetStatus.quickSearchAddressTextColor.prev = widgetStatus.quickSearchAddressTextColor.cur;
        widgetStatus.quickSearchTitleTextHoverColor.prev = widgetStatus.quickSearchTitleTextHoverColor.cur;
        widgetStatus.quickSearchDistanceTextHoverColor.prev = widgetStatus.quickSearchDistanceTextHoverColor.cur;
        widgetStatus.quickSearchAddressTextHoverColor.prev = widgetStatus.quickSearchAddressTextHoverColor.cur;
        widgetStatus.overlayTitleTextColor.prev = widgetStatus.overlayTitleTextColor.cur;
        widgetStatus.overlayAddressTextColor.prev = widgetStatus.overlayAddressTextColor.cur;
        widgetStatus.overlayCloseBtnTextColor.prev = widgetStatus.overlayCloseBtnTextColor.cur;
        widgetStatus.overlayPickupBtnTextColor.prev = widgetStatus.overlayPickupBtnTextColor.cur;
      }
    } catch (error) {
      console.error(error);
      utils.onAlertModal('저장에 실패하였습니다.');
    }
  };

  const styleSectionToggleInit = () => {
    const sectionCtElms = getSectionCtElms();
    sectionCtElms.forEach((sectionCtElm) => {
      const sectionTitle = sectionCtElm.querySelector('.section_title');
      const sectionStyle = getComputedStyle(sectionCtElm.querySelector('.section'));
      const sectionContent = sectionCtElm.querySelector('.section_content');
      const sectionMargin = parseInt(sectionStyle.margin.split(' ')[0].replace('px', ''));
      const sectionHeight = parseInt(sectionStyle.height.replace('px', ''));
      sectionTitle.addEventListener('click', () => {
        if (sectionCtElm.classList.contains('tab_on')) {
          sectionCtElm.classList.remove('tab_on');
          utils.slideUp(sectionContent, 300);
        } else {
          const sectionContentHeight =
            (sectionMargin + sectionHeight) * sectionContent.querySelectorAll('.section:not(.displaynone)').length + sectionMargin;

          sectionCtElm.classList.add('tab_on');
          utils.slideDown(sectionContent, sectionContentHeight, 300);
        }
      });
    });
  };

  const submitBtnHandler = () => {
    getSubmitBtn().addEventListener('click', onSubmit);
  };

  const upload = async () => {
    const normalMarkerFileInput = getNormalMkUploadInputElm();
    const nowMarkerFileInput = getNowMkUploadInputElm();
    const normalMarkerFile = normalMarkerFileInput.files[0];
    const nowMarkerFile = nowMarkerFileInput.files[0];
    const markerFiles = [normalMarkerFile, nowMarkerFile].filter((file) => (file ? true : false));

    if (!normalMarkerFile && !nowMarkerFile) {
      return utils.onAlertModal('파일이 등록되지 않앗습니다.');
    }

    const formData = new FormData();

    const getImageType = (file) => {
      return file.type.split('/')[1];
    };

    markerFiles.forEach((markerFile) => {
      if (!markerFile) return;
      let markerType = '';
      if (markerFile === normalMarkerFile) {
        markerType = 'normal';
      } else if (markerFile === nowMarkerFile) {
        markerType = 'now';
      }

      formData.append('image', markerFile, `${btoa(markerType)}_${utils.encodeUnicode(markerFile.name) + '.' + getImageType(markerFile)}`);
    });

    try {
      const res = await axios.post('/api/v1/widgets/marker/upload', formData);

      if (res.status === 201) {
        utils.onAlertModal('성공적으로 마커가 등록 되었습니다.');
        if (normalMarkerFile) {
          widgetStatus.normalMarker.prev = widgetStatus.normalMarker.cur;
          normalMarkerFileInput.value = '';
        }
        if (nowMarkerFile) {
          widgetStatus.nowMarker.prev = widgetStatus.nowMarker.cur;
          nowMarkerFileInput.value = '';
        }
      }
    } catch (err) {
      console.log(err);
      if (err.response.status === 500) {
        return utils.onAlertModal('알수없는 오류로 업로드에 실패하였습니다.');
      }
      return utils.onAlertModal(
        '파일형식 : PNG , JPG\n파일 사이즈 : 156*150 으로 1MB 이하의\n이미지 파일을 등록 해주세요.',
        'max-content',
        80,
        2500
      );
    }
  };

  const markerUploadValidHandler = () => {
    getMarkerUploadInputElms().forEach((markerUploadInputElm) => {
      // 마커파일의 변경이 있을 경우
      markerUploadInputElm.addEventListener('change', () => {
        const file = markerUploadInputElm.files[0];

        // 변화가 있는 인풋태그에 해당하는 프리뷰 이미지 Element를 받아옴
        const previewElm = markerUploadInputElm.nextElementSibling.querySelector('img');
        // widgetSatus key 값과 동일한 값을 dataset 으로 지정 (normalMarker , nowMarker)
        const markerType = markerUploadInputElm.dataset.markerType;

        const img = new Image();
        const reader = new FileReader();

        // 이미지가 할당 되었을 때 제한사항을 통과 한다면 reader 를 통해 파일을 읽음
        img.onload = function () {
          if (this.width > 156 || this.height > 150) {
            utils.onAlertModal(
              '파일형식 : PNG , JPG\n파일 사이즈 : 156*150 으로 1MB 이하의\n이미지 파일을 등록 해주세요.',
              'max-content',
              80,
              2500
            );

            markerUploadInputElm.value = '';
            return;
          }

          reader.readAsDataURL(file);
          showSaveAlert();
        };

        // 제한사항이 모두 통과되고 파일이 성공적으로 읽혔다면 프리뷰 이미지 Element에 이미지를 넣어줌
        reader.onload = function (e) {
          previewElm.src = e.target.result;
          widgetStatus[markerType].cur = e.target.result;
        };

        img.src = URL.createObjectURL(file);
      });
    });
  };

  const uploadBtnHandler = () => {
    getUploadSubmitBtnElm().addEventListener('click', (e) => {
      e.preventDefault();
      upload();
    });
  };

  const onMarkerInit = async () => {
    if (confirm('마커를 초기화 하시겠습니까?')) {
      try {
        const res = await axios.delete('/api/v1/widgets/marker/init');
        if (res.status === 200) {
          const initNormalMarkerURI = 'https://rlagudtjq2016.cafe24.com/assets/icon/store_marker.svg';
          const initNowMarkerURI = 'https://rlagudtjq2016.cafe24.com/assets/icon/now_store_pick.svg';
          getNormalMarkerImgElm().src = initNormalMarkerURI;
          getNowMarkerImgElm().src = initNowMarkerURI;
          getNormalMkUploadInputElm().value = '';
          getNowMkUploadInputElm().value = '';

          widgetStatus.normalMarker.cur = initNormalMarkerURI;
          widgetStatus.nowMarker.cur = initNowMarkerURI;
          widgetStatus.normalMarker.prev = initNormalMarkerURI;
          widgetStatus.nowMarker.prev = initNowMarkerURI;
          utils.onAlertModal('마커가 초기화 되었습니다.');
        }
      } catch (err) {
        console.error(err);
      }
    } else {
    }
  };

  const markerInitBtnHandler = () => {
    getMarkerInitBtnElm().addEventListener('click', onMarkerInit);
  };

  const widgetStyleInit = () => {
    initGlobalVariableColor();
    createPickr();
    submitBtnHandler();

    // marker upload
    markerUploadValidHandler();
    uploadBtnHandler();

    // marker initial
    markerInitBtnHandler();
  };

  const reactiveStyles = () => {
    UITypeHandler();
    styleSectionToggleInit();
  };
  const init = () => {
    theFirstUIType = getUIType();
    widgetStyleInit();
    reactiveStyles();
  };

  init();
});
