document.addEventListener('DOMContentLoaded', async () => {
  const utils = await import('../utils/utils.js');
  let MAIN_COLOR,
    ACTIVE_TEXT_COLOR,
    TEXT_COLOR,
    TITLE_TEXT_COLOR,
    ADDRESS_TEXT_COLOR,
    DISTANCE_TEXT_COLOR,
    MAP_TITLE_TEXT_COLOR,
    MAP_ADDRESS_TEXT_COLOR,
    QUICKSEARCH_TITLE_TEXT_COLOR,
    QUICKSEARCH_ADDR_TEXT_COLOR,
    QUICKSEARCH_TITLE_TEXT_HOVER_COLOR,
    QUICKSEARCH_ADDRESS_TEXT_HOVER_COLOR;

  let theFirstUIType,
    pickrModifiedChk = false;

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
  const getQuickSearchAddressTextColor = () => {
    return document.getElementById('uiQuickSearchAddressTextColorCt').dataset.color;
  };
  const getQuickSearchTitleTextHoverColor = () => {
    return document.getElementById('uiQuickSearchTitleTextHoverColorCt').dataset.color;
  };
  const getQuickSearchAddressTextHoverColor = () => {
    return document.getElementById('uiQuickSearchAddressTextHoverColorCt').dataset.color;
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
  const getQuickSearchAddrElm = () => {
    return document.querySelector('#searchListCt .store_addr span');
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

  const getUIType = () => {
    const uiElms = getUIInputElms();
    for (let i = 0; i < uiElms.length; i++) {
      if (uiElms[i].checked) {
        return uiElms[i].value;
      }
    }
  };

  const initGlobalVariableColor = () => {
    MAIN_COLOR = getMainColor();
    ACTIVE_TEXT_COLOR = getActiveTextColor();
    TEXT_COLOR = getTextColor();
    ADDRESS_TEXT_COLOR = getAddressTextColor();
    DISTANCE_TEXT_COLOR = getDistanceTextColor();
    TITLE_TEXT_COLOR = getTitleTextColor();
    MAP_TITLE_TEXT_COLOR = getMapTitleTextColor();
    MAP_ADDRESS_TEXT_COLOR = getMapAddressTextColor();
    QUICKSEARCH_TITLE_TEXT_COLOR = getQuickSearchTitleTextColor();
    QUICKSEARCH_ADDR_TEXT_COLOR = getQuickSearchAddressTextColor();
    QUICKSEARCH_TITLE_TEXT_HOVER_COLOR = getQuickSearchTitleTextHoverColor();
    QUICKSEARCH_ADDRESS_TEXT_HOVER_COLOR = getQuickSearchAddressTextHoverColor();

    getQuickSearchStoreElm().addEventListener('mouseover', () => {
      getQuickSearchTitleElm().style.color = QUICKSEARCH_TITLE_TEXT_HOVER_COLOR;
      getQuickSearchAddrElm().style.color = QUICKSEARCH_ADDRESS_TEXT_HOVER_COLOR;
    });
    getQuickSearchStoreElm().addEventListener('mouseout', () => {
      getQuickSearchTitleElm().style.color = QUICKSEARCH_TITLE_TEXT_COLOR;
      getQuickSearchAddrElm().style.color = QUICKSEARCH_ADDR_TEXT_COLOR;
    });
  };

  const showSaveAlert = () => {
    getSaveAlert().classList.add('on');
  };

  const hideSaveAlert = () => {
    getSaveAlert().classList.remove('on');
  };

  const pickrSave = (callback) => {
    pickrModifiedChk = true;
    showSaveAlert();
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

    const quickSearchAddressTextColorPickr = Pickr.create(
      createPickrConfig('#uiQuickSearchAddressTextColor', getQuickSearchAddressTextColor())
    );
    const quickSearchTitleTextHoverColorPickr = Pickr.create(
      createPickrConfig('#uiQuickSearchTitleTextHoverColor', getQuickSearchTitleTextHoverColor())
    );
    const quickSearchAddressTextHoverColorPickr = Pickr.create(
      createPickrConfig('#uiQuickSearchTitleAddressTextHoverColor', getQuickSearchAddressTextHoverColor())
    );

    mainUIColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        MAIN_COLOR = selectedColor;
        getTypeSearchStoreElm().style.backgroundColor = selectedColor;
        getMapTitleElm().style.backgroundColor = selectedColor;
        getSubmitBtnElm().style.color = selectedColor;
        getStorePickBtnElms().forEach((getStorePickBtnElm) => {
          getStorePickBtnElm.style.fill = selectedColor;
        });
        getActivePageElm().style.backgroundColor = selectedColor;
      });
    });

    ActiveTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        ACTIVE_TEXT_COLOR = selectedColor;
        getTypeSearchStoreElm().style.color = selectedColor;
      });
    });

    TextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        TEXT_COLOR = selectedColor;
        getTypeSearchDong().style.color = selectedColor;
      });
    });

    TitleTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        TITLE_TEXT_COLOR = selectedColor;
        getTitleElms().forEach((getTitleElm) => {
          getTitleElm.style.color = selectedColor;
        });
      });
    });

    distanceTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        DISTANCE_TEXT_COLOR = selectedColor;
        getDistanceTextElms().forEach((distanceElm) => {
          distanceElm.style.color = selectedColor;
        });
      });
    });

    addressTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        ADDRESS_TEXT_COLOR = selectedColor;
        getAddressTextElms().forEach((getAddressTextElm) => {
          getAddressTextElm.style.color = selectedColor;
        });
      });
    });

    mapTitleTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        MAP_TITLE_TEXT_COLOR = selectedColor;
        getSelectedStoreNameElm().style.color = selectedColor;
      });
    });

    mapAddressTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        MAP_ADDRESS_TEXT_COLOR = selectedColor;
        getMapAddressElm().style.color = selectedColor;
      });
    });

    mapQuickSearchTitleTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        QUICKSEARCH_TITLE_TEXT_COLOR = selectedColor;
        getQuickSearchTitleElm().style.color = selectedColor;
      });
    });

    quickSearchAddressTextColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        QUICKSEARCH_ADDR_TEXT_COLOR = selectedColor;
        getQuickSearchAddrElm().style.color = selectedColor;
      });
    });

    quickSearchTitleTextHoverColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        QUICKSEARCH_TITLE_TEXT_HOVER_COLOR = selectedColor;
        getQuickSearchStoreElm().addEventListener('mouseover', () => {
          getQuickSearchTitleElm().style.color = selectedColor;
          getQuickSearchAddrElm().style.color = QUICKSEARCH_ADDRESS_TEXT_HOVER_COLOR;
        });
      });
    });

    quickSearchAddressTextHoverColorPickr.on('save', (color, instance) => {
      pickrSave(() => {
        const selectedColor = colorToString(color);
        QUICKSEARCH_ADDRESS_TEXT_HOVER_COLOR = selectedColor;
        getQuickSearchStoreElm().addEventListener('mouseover', () => {
          getQuickSearchTitleElm().style.color = QUICKSEARCH_TITLE_TEXT_HOVER_COLOR;
          getQuickSearchAddrElm().style.color = selectedColor;
        });
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
      quickSearchAddressTextColorPickr.setColor('#979797');
      quickSearchTitleTextHoverColorPickr.setColor('#000000');
      quickSearchAddressTextHoverColorPickr.setColor('#9987cd');
    });
  };
  const colorToString = (color) => {
    return color.toHEXA().toString();
  };

  const onUIInput = () => {
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

    if (UIType === theFirstUIType && !pickrModifiedChk) {
      hideSaveAlert();
    } else {
      showSaveAlert();
    }
  };

  const UITypeHandler = () => {
    const UITInputElms = getUIInputElms();
    UITInputElms.forEach((UITInputElm) => {
      UITInputElm.addEventListener('click', onUIInput);
    });
  };

  const onSubmit = async () => {
    const form = {
      ui: getUIType(),
      uiColor: MAIN_COLOR,
      activeTextColor: ACTIVE_TEXT_COLOR,
      textColor: TEXT_COLOR,
      titleTextColor: TITLE_TEXT_COLOR,
      addressTextColor: ADDRESS_TEXT_COLOR,
      distanceTextColor: DISTANCE_TEXT_COLOR,
      mapTitleTextColor: MAP_TITLE_TEXT_COLOR,
      mapAddressTextColor: MAP_ADDRESS_TEXT_COLOR,
      quickSearchTitleTextColor: QUICKSEARCH_TITLE_TEXT_COLOR,
      quickSearchAddressTextColor: QUICKSEARCH_ADDR_TEXT_COLOR,
      quickSearchTitleTextHoverColor: QUICKSEARCH_TITLE_TEXT_HOVER_COLOR,
      quickSearchAddressTextHoverColor: QUICKSEARCH_ADDRESS_TEXT_HOVER_COLOR,
    };

    try {
      const res = await axios.put('/api/widgets/styles', form);
      if (res.status === 200) {
        getSaveAlert().classList.remove('on');
        utils.onAlertModal('성공적으로 저장 되었습니다.');
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

  const widgetStyleInit = () => {
    initGlobalVariableColor();
    createPickr();
    submitBtnHandler();
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
