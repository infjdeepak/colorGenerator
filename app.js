// global selections and variables
const colorsContainer = document.querySelector(".coloors-generator");
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate-btn");
const sliders = document.querySelectorAll(`input[type="range"]`);
const currentHexes = document.querySelectorAll(".color h2");
const copyPopup = document.querySelector(".copy-container");
const adjustBtns = document.querySelectorAll(".adjust-btn");
const lockBtns = document.querySelectorAll(".lock-btn");
const sliderContainers = document.querySelectorAll(".sliders");
const closeAdjustBtns = document.querySelectorAll(".close-adjustment");
let initialColors;
let savedPalettes = [];

// events handling
generateBtn.addEventListener("click", () => {
  randomColors();
});
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUi(index);
  });
});
currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});
copyPopup.addEventListener("transitionend", () => {
  const popup = copyPopup.children[0];
  copyPopup.classList.remove("active");
  popup.classList.remove("active");
});
adjustBtns.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});
closeAdjustBtns.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});
lockBtns.forEach((button) => {
  button.addEventListener("click", () => {
    const colorDiv = button.parentElement.parentElement;
    const icon = button.children[0];
    colorDiv.classList.toggle("locked");
    if (colorDiv.classList.contains("locked")) {
      icon.src = "./icons/locked.svg";
    } else {
      icon.src = "./icons/lock.svg";
    }
  });
});

// functions
function generateHex() {
  const color = chroma.random();
  return color;
}

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hextext = div.children[0];
    const randomColor = generateHex();

    if (div.classList.contains("locked")) {
      initialColors.push(hextext.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }

    div.style.background = randomColor;
    hextext.innerText = randomColor;
    checkTextContrast(randomColor, hextext);
    const color = chroma(randomColor);
    const slider = div.querySelectorAll(".sliders input");
    const hue = slider[0];
    const brightness = slider[1];
    const saturation = slider[2];
    coloringInputBg(color, hue, brightness, saturation);
  });
  resetInput();
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}
function coloringInputBg(color, hue, brightness, saturation) {
  //  for saturation
  const noSat = color.set("hsl.s", 0);
  const fullsat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullsat]);
  // for brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);
  //coloring
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)},${scaleBright(1)}`;
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )},${scaleSat(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat");
  const sliders =
    e.target.parentElement.querySelectorAll(`input[type='range']`);
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];
  const bgColor = initialColors[index];
  const color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);
  colorDivs[index].style.backgroundColor = color;
  coloringInputBg(color, hue, brightness, saturation);
}
function updateTextUi(index) {
  const activediv = colorDivs[index];
  const color = chroma(activediv.style.backgroundColor);
  const hexH2 = activediv.querySelector("h2");
  hexH2.innerText = color.hex();
  checkTextContrast(color, hexH2);
}
function resetInput() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "saturation") {
      const saturationColor = initialColors[slider.getAttribute("data-sat")];
      const saturationValue = chroma(saturationColor).hsl()[1];
      slider.value = Number(saturationValue.toString().slice(0, 4));
    }
    if (slider.name === "brightness") {
      const brightnessColor = initialColors[slider.getAttribute("data-bright")];
      const brightnessValue = chroma(brightnessColor).hsl()[2];
      slider.value = Number(brightnessValue.toString().slice(0, 4));
    }
  });
}
function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  el.remove();
  const popup = copyPopup.children[0];
  copyPopup.classList.add("active");
  popup.classList.add("active");
}
function openAdjustmentPanel(index) {
  sliderContainers.forEach((sliderContainer) => {
    sliderContainer.classList.remove("active");
  });
  sliderContainers[index].classList.add("active");
}
function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

// local storage and library stufs
const saveBtn = document.querySelector(".save-btn");
const saveContainer = document.querySelector(".save-container");
const closeSavePopupBtn = document.querySelector(".close-save-btn");
const saveNameInput = document.querySelector(".save-name-input");
const submitSaveBtn = document.querySelector(".submit-save-btn");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library-btn");
const closeLibraryBtn = document.querySelector(".close-library");
//local storage events
saveBtn.addEventListener("click", openSavePopup);
closeSavePopupBtn.addEventListener("click", closeSavePopup);
submitSaveBtn.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibraryPopup);
closeLibraryBtn.addEventListener("click", closeLibraryPopup);
// local storage functions
function openSavePopup() {
  const savePopup = saveContainer.children[0];
  saveContainer.classList.add("active");
  savePopup.classList.add("active");
}
function closeSavePopup() {
  const savePopup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  savePopup.classList.remove("active");
}
function savePalette() {
  closeSavePopup();
  const name = saveNameInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  let paletteNr;
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (paletteObjects === null) {
    paletteNr = savedPalettes.length;
  } else {
    paletteNr = paletteObjects.length;
  }
  const paletteObj = {
    name: name,
    colors: colors,
    paletteNr: paletteNr,
  };
  savedPalettes.push(paletteObj);
  // push to local Storage
  saveTolocal(paletteObj);
  saveNameInput.value = "";
  // pushing palette to library
  const palette = document.createElement("div");
  palette.classList.add("color-palette");
  const title = document.createElement("h4");
  title.classList.add("palette-title");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("preview-container");
  paletteObj.colors.forEach((color) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.background = color;
    preview.appendChild(smallDiv);
  });
  const selectBtn = document.createElement("button");
  selectBtn.classList.add("select-btn");
  selectBtn.classList.add(paletteObj.paletteNr);
  selectBtn.innerText = "select";
  //seleting from library
  selectBtn.addEventListener("click", (e) => {
    closeLibraryPopup();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.background = color;
      updateTextUi(index);
      libraryInputUpdate(color, index);
    });
    resetInput();
  });
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(selectBtn);
  libraryContainer.children[0].appendChild(palette);
}
function saveTolocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}
function openLibraryPopup() {
  const libraryPopup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  libraryPopup.classList.add("active");
}
function closeLibraryPopup() {
  const libraryPopup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  libraryPopup.classList.remove("active");
}
function libraryInputUpdate(color, index) {
  const bgColor = chroma(color);
  const slider = colorDivs[index].querySelectorAll(".sliders input");
  const hue = slider[0];
  const brightness = slider[1];
  const saturation = slider[2];
  coloringInputBg(bgColor, hue, brightness, saturation);
}
function getLocalData() {
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    paletteObjects.forEach((paletteObj) => {
      const palette = document.createElement("div");
      palette.classList.add("color-palette");
      const title = document.createElement("h4");
      title.classList.add("palette-title");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("preview-container");
      paletteObj.colors.forEach((color) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.background = color;
        preview.appendChild(smallDiv);
      });
      const selectBtn = document.createElement("button");
      selectBtn.classList.add("select-btn");
      selectBtn.classList.add(paletteObj.paletteNr);
      selectBtn.innerText = "select";
      //seleting from library
      selectBtn.addEventListener("click", (e) => {
        closeLibraryPopup();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.background = color;
          updateTextUi(index);
          libraryInputUpdate(color, index);
        });
        resetInput();
      });
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(selectBtn);
      libraryContainer.children[0].appendChild(palette);
    });
  }
}
//
getLocalData();
randomColors();
