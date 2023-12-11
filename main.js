// Объявление переменных для хранения изображения и его стиля
let originalImage = null;
let originalImageState = null;

// Получение элементов кнопки отправки изображения и контейнера изображения
const sendingImageButton = document.getElementById("sending");
const image = document.getElementById("image");

// Функция для обработки события изменения файла при загрузке
function sendImageButton(event) {
  // Получение выбранного файла из события
  const selectedFile = event.target.files[0];

  // Проверка, что файл был выбран
  if (selectedFile) {
    // Создание URL для предварительного просмотра изображения
    const imageUrl = URL.createObjectURL(selectedFile);

    // Создание нового объекта изображения
    originalImage = new Image();
    originalImage.crossOrigin = "anonymous";
    originalImage.src = imageUrl;

    // Сохранение текущего стиля фона изображения
    originalImageState = image.style.backgroundImage;

    // Установка стиля фона для предварительного просмотра
    image.style.backgroundImage = `url(${imageUrl})`;
    image.style.backgroundRepeat = "no-repeat";
    image.style.maxWidth = "100%";
    image.style.opacity = "1";
  }
}

sendingImageButton.addEventListener("change", sendImageButton);

// Функция для добавления текста к изображению
function addTextToImage() {
  // Возвращаем Promise для асинхронной обработки
  return new Promise((resolve) => {
    // Получаем значения текста, цвета и размера из элементов формы
    const topText = document.getElementById("text-top").value;
    const bottomText = document.getElementById("text-bottom").value;
    const textColor = document.getElementById("color-text").value;
    const fontSize = document.getElementById("font-size").value;

    // Проверяем, есть ли текст для добавления
    if (!topText && !bottomText) {
      // Ничего не делаем, если нет текста
      resolve();
      return;
    }

    // Получаем элемент контейнера изображения
    const imageContainer = document.getElementById("image");

    // Создаем холст и его контекст для рисования
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Создаем дополнительный холст и его контекст для рисования фона
    const backgroundCanvas = document.createElement("canvas");
    const backgroundContext = backgroundCanvas.getContext("2d");

    // Создаем изображение и устанавливаем источник из оригинального изображения
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = originalImage.src;

    // Функция, выполняющаяся после загрузки изображения
    img.onload = function () {
      // Рассчитываем соотношение сторон изображения
      const aspectRatio = img.width / img.height;

      // Устанавливаем размеры дополнительного холста на основе контейнера
      backgroundCanvas.width = imageContainer.clientWidth;
      backgroundCanvas.height = backgroundCanvas.width / aspectRatio;

      // Рисуем оригинальное изображение на дополнительный холст
      backgroundContext.drawImage(
        img,
        0,
        0,
        backgroundCanvas.width,
        backgroundCanvas.height
      );

      // Устанавливаем размеры основного холста
      canvas.width = backgroundCanvas.width;
      canvas.height = backgroundCanvas.height;

      // Рисуем фон из дополнительного холста на основной
      context.drawImage(backgroundCanvas, 0, 0);

      // Устанавливаем цвет фона для текста
      context.fillStyle = "white";

      // Размер шрифта для верхнего текста
      let topFontSize = parseInt(fontSize, 10);

      // Уменьшаем размер шрифта, пока текст не поместится на холст
      while (context.measureText(topText).width + 20 > canvas.width) {
        topFontSize--;
        context.font = `bold ${topFontSize}px sans-serif`;
      }

      // Устанавливаем цвет текста
      context.fillStyle = textColor;

      // Создаем div для верхнего текста
      const topTextDiv = document.createElement("div");
      topTextDiv.classList.add("top__text");

      // Применяем стили к div с верхним текстом
      applyTextStyle(topTextDiv, topText, topFontSize, textColor);

      // Добавляем div с верхним текстом в контейнер изображения
      imageContainer.appendChild(topTextDiv);

      // Размер шрифта для нижнего текста в десятичной системе
      let bottomFontSize = parseInt(fontSize, 10);

      // Создаем div для нижнего текста
      const bottomTextDiv = document.createElement("div");
      bottomTextDiv.classList.add("bottom__text");

      // Применяем стили к div с нижним текстом
      applyTextStyle(bottomTextDiv, bottomText, bottomFontSize, textColor);

      // Добавляем div с нижним текстом в контейнер изображения
      imageContainer.appendChild(bottomTextDiv);

      // Устанавливаем фон контейнера изображения с текстом
      imageContainer.style.backgroundImage = `url(${canvas.toDataURL(
        "image/png"
      )})`;

      // Присваиваем классы для перетаскивания
      topTextDiv.classList.add("draggable");
      bottomTextDiv.classList.add("draggable");

      // Вызываем функцию для настройки перетаскивания текста
      setupTextDrag();

      // Резолвим промис после завершения операций
      resolve();
    };
  });
}

// Функция для применения стилей к тексту
function applyTextStyle(element, text, fontSize, color) {
  element.style.color = color;
  element.style.font = `bold ${fontSize}px sans-serif`;
  element.style.textAlign = "center";
  element.style.position = "absolute";
  element.style.left = "50%";
  element.style.transform = "translateX(-50%)";
  element.style.textShadow = "2px 2px 2px black";
  element.style.cursor = "grab";
  element.style.zIndex = "1";
  element.style.pointerEvents = "auto";
  element.innerText = text;
}

document.getElementById("generation").addEventListener("click", function () {
  // Вызываем функцию для добавления текста к изображению
  addTextToImage().then(() => {
    // После успешного добавления текста вызываем функцию для настройки перетаскивания текста
    setupTextDrag();
  });
});

// Функция для удаления текста из изображения (для ситуации повторного нажатия на кнопку "Сгенерировать")
function removeTextFromImage() {
  // Получаем все элементы с классом "draggable" (текстовые блоки)
  const textDivs = document.querySelectorAll(".draggable");

  // Удаляем каждый текстовый блок
  textDivs.forEach((div) => {
    div.remove();
  });
}

document.getElementById("generation").addEventListener("click", function () {
  // При клике на кнопку "Сгенерировать" вызываем функцию для удаления текста
  removeTextFromImage();
});

// Функция для скачивания изображения с текстом
function downloadImage() {
  const imageContainer = document.getElementById("image");

  // Создаем новый холст для рендеринга изображения с текстом
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Создаем новый объект изображения
  const img = new Image();
  img.crossOrigin = "anonymous";

  // Обработчик события загрузки изображения
  img.onload = function () {
    // Устанавливаем размеры холста на основе размеров контейнера изображения
    canvas.width = imageContainer.clientWidth;
    canvas.height = imageContainer.clientHeight;

    // Рисуем изображение на холсте с учетом размеров и пропорций
    context.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Рисуем текст на холсте с учетом пропорций и смещений
    const textDivs = document.querySelectorAll(".draggable");
    textDivs.forEach((textDiv) => {
      // Получаем вычисленные стили текстового div
      const computedStyle = window.getComputedStyle(textDiv);

      // Вычисляем координаты x и y с учетом пропорций контейнера изображения
      const x =
        parseInt(computedStyle.left) *
        (canvas.width / imageContainer.clientWidth);
      const y =
        (parseInt(computedStyle.top) + parseInt(computedStyle.fontSize)) *
        (canvas.height / imageContainer.clientHeight);

      // Устанавливаем стили текста на холсте
      context.font = computedStyle.font;
      context.fillStyle = computedStyle.color;
      context.shadowColor = "black";
      context.shadowBlur = 2;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;

      // Рисуем текст на холсте
      context.fillText(textDiv.innerText, x, y);
    });

    // Преобразуем холст в data URL формата JPEG
    const dataUrl = canvas.toDataURL("image/jpeg");

    // Создаем ссылку для скачивания и вызываем событие клика для скачивания
    const downloadLink = document.createElement("a");
    downloadLink.href = dataUrl;
    downloadLink.download = "meme.jpg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Устанавливаем источник изображения для объекта img
  img.src = imageContainer.style.backgroundImage.replace(
    /url\(['"]?(.*?)['"]?\)/i,
    "$1"
  );
}

const downloadButton = document.getElementById("downloading");
downloadButton.addEventListener("click", downloadImage);

function setupTextDrag() {
  const textDivs = document.querySelectorAll(".draggable");

  // Переменные для хранения состояния перетаскивания
  let draggedElement = null;
  let isDragging = false;
  let offsetX, offsetY;

  // Добавляем обработчик события mousedown для каждого текстового элемента
  textDivs.forEach((textDiv) => {
    textDiv.addEventListener("mousedown", (event) => {
      // Начинаем процесс перетаскивания
      isDragging = true;
      //хранение ссылки на текущий перетаскиваемый элемент
      //чтобы этот элемент оставался под контролем до завершения перетаскивания
      draggedElement = textDiv;

      // Получаем начальные координаты относительно верхнего левого угла элемента
      const textRect = textDiv.getBoundingClientRect();
      offsetX = event.clientX - textRect.left;
      offsetY = event.clientY - textRect.top;

      //предотвращение выделения текста при перетаскивании
      event.preventDefault();
    });
  });

  // Добавляем обработчик события mousemove для перемещения текстового элемента
  document.addEventListener("mousemove", (event) => {
    //проверяеv, происходит ли в данный момент процесс перетаскивания и есть ли какой-то элемент, который находится в состоянии перетаскивания
    if (isDragging && draggedElement) {
      // Вычисляем новые координаты элемента при перемещении мыши
      const x = event.clientX - offsetX;
      const y = event.clientY - offsetY;

      // Учитываем размеры текста и размеры контейнера
      const containerRect =
        draggedElement.parentElement.getBoundingClientRect();
      const maxX = containerRect.width - draggedElement.clientWidth;
      const maxY = containerRect.height - draggedElement.clientHeight;

      // Ограничиваем перемещение в пределах контейнера
      const clampedX = Math.min(Math.max(0, x), maxX);
      const clampedY = Math.min(Math.max(0, y), maxY);

      // Устанавливаем новые координаты для элемента
      draggedElement.style.left = `${clampedX}px`;
      draggedElement.style.top = `${clampedY}px`;
    }
  });

  // Добавляем обработчик события mouseup для завершения перетаскивания
  document.addEventListener("mouseup", () => {
    if (isDragging && draggedElement) {
      // Завершаем процесс перетаскивания
      isDragging = false;

      // Возвращаем элемент на исходный z-index
      draggedElement.style.zIndex = "1";
      draggedElement.style.cursor = "grab";

      // Сбрасываем переменные состояния
      draggedElement = null;
    }
  });
}
