document.addEventListener('DOMContentLoaded', () => {
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

    // Simple example, see optional options for more configuration.
    const mainUIColorPickr = Pickr.create({
      el: '#uiMainColor',
      theme: 'classic', //'classic' or 'monolith', or 'nano'
      swatches: swatches,
      components: pickrComponents,
    });

    const mainTextColorPickr = Pickr.create({
      el: '#uiTextColor',
      theme: 'classic', //'classic' or 'monolith', or 'nano'
      swatches: swatches,
      components: pickrComponents,
    });

    const distanceColorPickr = Pickr.create({
      el: '#uiDistanceColor',
      theme: 'classic', //'classic' or 'monolith', or 'nano'
      swatches: swatches,
      components: pickrComponents,
    });

    mainUIColorPickr.on('save', (color, instance) => {
      console.log(color.toHEXA().toString());
    });
  };

  const widgetStyleInit = () => {
    createPickr();
  };

  widgetStyleInit();
});
