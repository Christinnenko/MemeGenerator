let originalImage = null;
let originalImageState = null;

function listenerSendImageButton() {
  const sendingImageButton = document.getElementById("sending");
  const image = document.getElementById("image");

  sendingImageButton.addEventListener("change", (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const imageUrl = URL.createObjectURL(selectedFile);

      originalImage = new Image();
      originalImage.crossOrigin = "anonymous";
      originalImage.src = imageUrl;

      originalImageState = image.style.backgroundImage;

      image.style.backgroundImage = `url(${imageUrl})`;
      image.style.backgroundSize = "cover";
      image.style.backgroundRepeat = "no-repeat";
      image.style.maxWidth = "100%";
      image.style.opacity = "1";
    }
  });
}

listenerSendImageButton();

function addTextToImage() {
  const topText = document.getElementById("text-top").value;
  const bottomText = document.getElementById("text-bottom").value;
  const textColor = document.getElementById("color-text").value;
  const fontSize = document.getElementById("font-size").value;

  const imageContainer = document.getElementById("image");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const backgroundCanvas = document.createElement("canvas");
  const backgroundContext = backgroundCanvas.getContext("2d");

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = originalImage.src;

  img.onload = function () {
    const aspectRatio = img.width / img.height;

    backgroundCanvas.width = imageContainer.clientWidth;
    backgroundCanvas.height = backgroundCanvas.width / aspectRatio;

    backgroundContext.drawImage(
      img,
      0,
      0,
      backgroundCanvas.width,
      backgroundCanvas.height
    );

    canvas.width = backgroundCanvas.width;
    canvas.height = backgroundCanvas.height;

    context.drawImage(backgroundCanvas, 0, 0);

    context.fillStyle = "white";

    // Размер шрифта для верхнего текста
    let topFontSize = parseInt(fontSize, 10) || 60;

    while (context.measureText(topText).width + 20 > canvas.width) {
      topFontSize--;
      context.font = `bold ${topFontSize}px sans-serif`;
    }

    context.fillStyle = textColor;

    // Рисуем верхний текст
    context.font = `bold ${topFontSize}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "top";
    context.shadowColor = "black";
    context.shadowBlur = 2;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.fillText(topText, canvas.width / 2, 200);

    // Размер шрифта для нижнего текста
    let bottomFontSize = parseInt(fontSize, 10) || 60;

    // Рисуем нижний текст
    context.font = `bold ${bottomFontSize}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "bottom";
    context.shadowColor = "black";
    context.shadowBlur = 2;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.fillText(bottomText, canvas.width / 2, canvas.height - 200);

    // Добавляем текст поверх фонового изображения
    imageContainer.style.backgroundImage = `url(${canvas.toDataURL(
      "image/png"
    )})`;
    imageContainer.style.backgroundSize = "cover";
  };
}

function removeTextFromImage() {
  const imageContainer = document.getElementById("image");

  // Восстанавливаем оригинальное изображение
  imageContainer.style.backgroundImage = originalImageState;
}

document.getElementById("generation").addEventListener("click", function () {
  // При повторном нажатии на "Сгенерировать" убираем текст и генерируем новый
  removeTextFromImage();
  addTextToImage();
});

function downloadImage() {
  const image = document.getElementById("image");

  if (image.style.display !== "none") {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = image.clientWidth;
    canvas.height = image.clientHeight;

    const img = new Image();
    img.onload = function () {
      context.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL("image/jpg");

      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      downloadLink.download = "meme.jpg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = image.style.backgroundImage.replace(
      /url\(['"]?(.*?)['"]?\)/i,
      "$1"
    );
  }
}

const downloadButton = document.getElementById("downloading");
downloadButton.addEventListener("click", downloadImage);

let isDragging = false;
let offsetX, offsetY;

// Элемент верхнего текста
const textTop = document.querySelector(".meme__text-top");

textTop.addEventListener("mousedown", (event) => {
  isDragging = true;
  offsetX = event.clientX - textTop.getBoundingClientRect().left;
  offsetY = event.clientY - textTop.getBoundingClientRect().top;
});

document.addEventListener("mousemove", (event) => {
  if (isDragging) {
    const x = event.clientX - offsetX;
    const y = event.clientY - offsetY;

    textTop.style.left = `${x}px`;
    textTop.style.top = `${y}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// //+++++ //изменить функцию загрузки изображения
//++++ //при повторном изменении текста стирать тот и добавлять новый
// // ++++++++//добавить текст
// ++++// //менять размер шрифта и цвет текста
// // //менять положение текста
// //+++ //сохранять изображение на локальном компе
