const wrap = document.querySelector('.wrap');
const body = document.querySelector('body');
const menu = document.querySelector('.menu');
const img = document.querySelector('.current-image');
const newPic = document.querySelector('.new');
const pictureDiv = document.querySelector('.picture');

document.addEventListener('DOMContentLoaded', function () {
  initialFormComment.style.display = 'none';
  newPic.style.display = 'inline-block';
  burger.style.display = 'none';
  share.style.display = 'none';
  comments.style.display = 'none';
  draw.style.display = 'none';
  img.style.display = 'none';
  let imgID = getIdFromUrl('id');
  if (imgID) {
    window.imgID = imgID;
    wsConnect();
  };
});

function getIdFromUrl(name) {
  const imgHref = window.location.href;
  const regex = new RegExp("[?]" + name + "(=([^&#]*)|&|#|$)");
  const results = regex.exec(imgHref);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

// Расположение блока меню
menu.setAttribute('draggable', true);
menu.addEventListener('mousedown', (e) => {
  if (e.which != 1) {
    return;
  };
  const elem = e.target.closest('.drag');
  if (!elem) return;
  const coords = getCoords(menu);
  const shiftX = e.pageX - coords.left;
  const shiftY = e.pageY - coords.top;
  const limits = {
    top: wrap.offsetTop + shiftY,
    right: wrap.offsetWidth + wrap.offsetLeft - menu.offsetWidth + shiftX,
    bottom: wrap.offsetHeight + wrap.offsetTop - menu.offsetHeight + shiftY,
    left: wrap.offsetLeft + shiftX
  };

  function moveAt(e) {
    const newLocation = {
      x: limits.left,
      y: limits.top
    };
    if (e.pageX > limits.right) {
      newLocation.x = limits.right;
    } else if (e.pageX > limits.left) {
      newLocation.x = e.pageX;
    };
    if (e.pageY > limits.bottom) {
      newLocation.y = limits.bottom;
    } else if (e.pageY > limits.top) {
      newLocation.y = e.pageY;
    };
    menu.style.left = newLocation.x - shiftX + 'px';
    menu.style.top = newLocation.y - shiftY + 'px';
    menu.style.marginRight = '-1px';
  };
  document.onmousemove = function (e) {
    moveAt(e);
  };
  menu.onmouseup = function () {
    document.onmousemove = null;
    menu.onmouseup = null;
  };
  menu.ondragstart = function () {
    return false;
  };

  function getCoords(elem) {
    const box = elem.getBoundingClientRect();
    return {
      top: box.top + pageYOffset,
      left: box.left + pageXOffset
    };
  };
});

window.addEventListener("resize", windowResize, false);

function windowResize() {
    console.log('Resize event');
    resizeCanvas();
    relocationMenu();
};

function relocationMenu(position, value) {
  const limitPos = wrap.offsetLeft + wrap.offsetWidth - menu.offsetWidth - 1;
  if (parseInt(menu.style.left) < 0) {
    menu.style.left = '0px';
  } else {
      if (limitPos === parseInt(menu.style.left)) {
        menu.style.left = (parseInt(menu.style.left) - value) + 'px';
    } else if ((limitPos - value) < parseInt(menu.style.left)) {
        menu.style.left = (position - value) + 'px';
      };
    };
  };



//Загрузка и проверка изображений
const loadData = document.createElement('input');
  loadData.type = 'file';
  loadData.accept = '.jpg, .png';
const newFileBtn = document.querySelector('.new');
  newFileBtn.appendChild(loadData);
  loadData.style.position = 'absolute';
  loadData.style.left = '0';
  loadData.style.top = '0';
  loadData.style.width = '100%';
  loadData.style.height = '100%';
  loadData.style.opacity = '0';
  loadData.style.cursor = 'pointer';
  loadData.addEventListener('change', function (event) {
    const inputFilesArr = Array.from(this.files);
    const checkInput = inputFilesArr.forEach(function (elem) {
      if (elem.type == 'image/jpeg' || elem.type == 'image/png') {
        upload(inputFilesArr);
        errorMsg.style.display = 'none';
      } else {
        errorMsg.style.display = 'block';
        errorMsg.style.zIndex = 10;
      };
    });
  });


const imgLoader = document.querySelector('.image-loader');
const dropFiles = document.querySelector('body');
const errorMsg = document.querySelector('.error');
const repeatDownload = document.querySelector('#repeat-download');
dropFiles.addEventListener('drop', onFilesDrop);
dropFiles.addEventListener('dragover', event => event.preventDefault());
img.setAttribute('new', '');

function onFilesDrop(event) {
  event.preventDefault();
  const dropFilesArr = Array.from(event.dataTransfer.files);
  const checkDrop = dropFilesArr.forEach(function (elem) {
    console.log(`Загружаемый тип изображения: ${elem.type}`);
    if (elem.type == 'image/jpeg' || elem.type == 'image/png') {
      if (img.hasAttribute('new')) {
        upload(dropFilesArr);
        errorMsg.style.display = 'none';
      } else {
        repeatDownload.style.display = 'inline-block';
        repeatDownload.style.zIndex = 10;
      };
    } else {
      errorMsg.style.display = 'block';
      errorMsg.style.zIndex = 10;
    };
});
};

function resetErrorMessage() {
  errorMsg.style.display = 'none';
  repeatDownload.style.display = 'none';
};

//Первичная загрузка на сервер
const serverError = document.querySelector('#server-error');
let imgID;

function upload(file) {
  repeatDownload.style.display = 'none';
  const formData = new FormData();
  for (var i = 0, file; file = file[i]; ++i) {
    formData.append('title', file.name);
    formData.append('image', file);
  }
  imgLoader.style.display = 'block'
  serverError.style.display = 'none';

  fetch('https://neto-api.herokuapp.com/pic', {
      method: 'POST',
      body: formData
    })
    .then((response) => {
      if (200 <= response.status && response.status < 300) {
        console.log(response);
        return response;
      }
      throw new Error(response.statusText);
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      mask.src = '';
      mask.style.display = 'none';
      img.removeAttribute('new');
      serverError.style.display = 'none';
      window.imgID = data.id;
      img.style.display = 'block';
      wsConnect();
    })
    .catch((error) => {
      imgLoader.style.display = 'none';
      serverError.style.display = 'block';
    });
};

//Режим "Основное меню"
const burger = document.querySelector('.burger');
burger.addEventListener('click', burgerModeReplace);

function burgerModeReplace(event) {
  const burgerPos = wrap.offsetLeft + wrap.offsetWidth - menu.offsetWidth - 1;
  if (commentsEl.style.display === 'inline-block') {
    relocationMenu(burgerPos, 49);
  } else if (drawEl.style.display === 'inline-block') {
    relocationMenu(burgerPos, 67);
  };
  mainMenuMode();
};

function mainMenuMode() {
  newPic.style.display = 'inline-block';
  burger.style.display = 'none';
  menu.style.display = 'inline-block';
  share.style.display = 'inline-block';
  shareEl.style.display = 'none';
  comments.style.display = 'inline-block';
  commentsEl.style.display = 'none';
  draw.style.display = 'inline-block';
  drawEl.style.display = 'none';
  paintMask.style.display = 'none';
  mask.style.zindex = 1;
  createCommentClickCheck();
  resetErrorMessage();
}

// Режим "Поделится"
const imgUrl = document.querySelector('.menu__url');
const copyUrlButton = document.querySelector('.menu_copy');
copyUrlButton.addEventListener('click', function () {
  imgUrl.select();
  document.execCommand('copy');
});
const share = document.querySelector('.share');
const shareEl = document.querySelector('.share-tools');
  share.addEventListener('click', startShareMode);

function startShareMode() {
  const sharePos = wrap.offsetLeft + wrap.offsetWidth - menu.offsetWidth - 1;
  if (newPic.style.display === 'inline-block' && share.style.display === 'none') {
    relocationMenu(sharePos, 567);
  } else {
    relocationMenu(sharePos, 189);
  };
  shareMode();
};

function shareMode() {
  burger.style.display = 'inline-block';
  menu.style.display = 'inline-block';
  share.style.display = 'inline-block';
  shareEl.style.display = 'inline-block';
  comments.style.display = 'none';
  commentsEl.style.display = 'none';
  draw.style.display = 'none';
  drawEl.style.display = 'none';
  newPic.style.display = 'none';
  createCommentClickCheck();
  resetErrorMessage();
};

//Режим "Рисование"
const draw = document.querySelector('.draw');
const drawEl = document.querySelector('.draw-tools');
const eraserEl = document.querySelector('.menu__eraser');
const canvas = document.querySelector('#paintMask');
  draw.addEventListener('click', paintMode);

function paintMode() {
  burger.style.display = 'inline-block';
  menu.style.display = 'inline-block';
  share.style.display = 'none';
  shareEl.style.display = 'none';
  comments.style.display = 'none';
  commentsEl.style.display = 'none';
  draw.style.display = 'inline-block';
  drawEl.style.display = 'inline-block';
  newPic.style.display = 'none';
  paintMask.style.zIndex = 4;
  paintMask.style.display = 'block';
  createCommentClickCheck();
  resetErrorMessage();
  resizeCanvas();

  const initMouse = {
    x: 0,
    y: 0
  };
  const curMouse = {
    x: 0,
    y: 0
  };
  const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 5;
  canvas.onmousedown = function (event) {
    initMouse.x = event.offsetX;
    initMouse.y = event.offsetY;
    ctx.drawing = true;
  }
  canvas.onmousemove = function (event) {
    curMouse.x = event.offsetX;
    curMouse.y = event.offsetY;
    if (ctx.drawing) {
      ctx.beginPath();
      ctx.lineJoin = 'round';
      ctx.moveTo(initMouse.x, initMouse.y);
      ctx.lineTo(curMouse.x, curMouse.y);
      ctx.closePath();
      ctx.stroke();
    }
    initMouse.x = curMouse.x;
    initMouse.y = curMouse.y;
  }
  canvas.onmouseup = function (event) {
    ctx.drawing = false;
    sendCanvas();
  }
  const menuColor = document.getElementsByClassName('menu__color')
  for (let i = 0; i < menuColor.length; i++) {
    menuColor[i].addEventListener('click', changeColor, false);
  };

  function changeColor(event) {
    ctx.strokeStyle = event.target.getAttribute('value');
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 5;
  }
  eraserEl.addEventListener('click', eraser, false);

  function eraser() {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 10;
  };
};

function resizeCanvas() {
  canvas.width = mask.width = document.querySelector('.current-image').width;
  canvas.height = mask.height = document.querySelector('.current-image').height;
};

function sendCanvas() {
  console.log('Отправка рисунка');
  const paintMask = document.querySelector('#paintMask');
  const imageData = paintMask.toDataURL('image/png');
  const byteArray = convertToBinary(imageData);
  websocket.send(byteArray.buffer);
};

//Преобразование canvas в бинарный формат
function convertToBinary(data) {
  const marker = ';base64,';
  const markerIndex = data.indexOf(marker) + marker.length;
  const base64 = data.substring(markerIndex);
  const raw = window.atob(base64);
  const rawLength = raw.length;
  const byteArray = new Uint8Array(new ArrayBuffer(rawLength));
  for (let i = 0; i < rawLength; i++) {
    byteArray[i] = raw.charCodeAt(i);
  };
  return byteArray;
};

//Режим "Комментирования"
const comments = document.querySelector('.comments');
const commentsEl = document.querySelector('.comments-tools');
const commentsOn = document.querySelector('.menu__toggle');
const initialFormComment = document.querySelector('.new_comment');
const initialFormCommentLoader = initialFormComment.querySelector('.comment_loader');
comments.addEventListener('click', commentsMode);

function commentsMode() {
  errorMsg.style.display = 'none';
  repeatDownload.style.display = 'none'
  burger.style.display = 'inline-block';
  menu.style.display = 'inline-block';
  share.style.display = 'none';
  shareEl.style.display = 'none';
  comments.style.display = 'inline-block';
  commentsEl.style.display = 'inline-block';
  draw.style.display = 'none';
  drawEl.style.display = 'none';
  newPic.style.display = 'none';
  paintMask.style.display = 'none';
  mask.style.zIndex = 3;
  resizeCanvas();
  resetErrorMessage();
  commentsToggle();
  commentsEl.addEventListener('click', commentsToggle);
    if (mask.style.display == 'none') {
      img.addEventListener('click', commentAdd);
    } else {
      mask.addEventListener('click', commentAdd);
  };
};

function createCommentClickCheck() {
  if (mask.style.display == 'none') {
    img.addEventListener('click', commentAdd);
  } else {
    mask.addEventListener('click', commentAdd);
  };
};

function commentsToggle() {
  const commentsForm = document.querySelectorAll('[data-top]');
  for (let i = 0; i < commentsForm.length; i++) {
    if (document.querySelector('.menu__toggle').checked) {
      console.log('Комментарии показаны');
      commentsForm[i].style.display = 'inline-block';
    } else {
      console.log('Комментарии скрыты');
      commentsForm[i].style.display = 'none';
    };
  };
};

function commentAdd(event) {
  const initialFormMarker = initialFormComment.querySelector('.comments__marker-checkbox');
    initialFormMarker.checked = true;
  const initialFormMessage = initialFormComment.querySelector('.comments__input');
    initialFormMessage.focus();
  const initialFormCloseButton = initialFormComment.querySelector('.comments__close');
    initialFormCloseButton.addEventListener('click', function () {
      initialFormComment.style.display = 'none';
    });
  initialFormCommentLoader.style.display = 'none';
  initialFormComment.style.left = (event.offsetX) - 20 + 'px'
  initialFormComment.style.top = (event.offsetY) - 16 + 'px';
  initialFormComment.style.display = 'inline-block';
  initialFormComment.reset();
};

function commentsLoad(comments) {
  for (let comment in comments) {
    const loadedComment = {
      message: comments[comment].message,
      left: comments[comment].left,
      top: comments[comment].top
    };
    renderComment(loadedComment);
  };
};

function renderComment(loadedComment) {
  initialFormComment.style.display = 'none';
  const loadForm = document.querySelector(`.comments__form[data-left="${loadedComment.left}"][data-top="${loadedComment.top}"]`);
  if (loadForm) {
    const commentLoader = loadForm.querySelector('.comment_loader');
      commentLoader.style.display = 'none';
    renderCommentForm(loadForm, loadedComment);
  } else {
    createComment(loadedComment);
  };
};

function getMessageTime() {
  const date = new Date();
  const messageTime = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
  return messageTime;
};

function createComment(comment) {
  console.log('Создание комментария');
  const originCommentForm = initialFormComment;
  const commentForm = originCommentForm.cloneNode(true);
    commentForm.style.display = 'inline-block';
    commentForm.classList.remove('new_comment');
    commentForm.querySelector('.comments__submit').classList.add('on_place');
    commentForm.style.top = (comment.top) + 'px';
    commentForm.style.left = (comment.left) + 'px';
    commentForm.dataset.top = comment.top;
    commentForm.dataset.left = comment.left;
  const commentLoader = commentForm.querySelector('.comment_loader');
    commentLoader.style.display = 'none';
  const marker = commentForm.querySelector('.comments__marker-checkbox');
    marker.checked = true;
    marker.disabled = false;
    marker.addEventListener('click', event => {
      const commentsForm = document.querySelectorAll('.comments__form');
      for (let i = 0; i < commentsForm.length; i++) {
        commentsForm[i].style.zIndex = '5';
      };
      event.currentTarget.parentNode.style.zIndex = '6';
    });
  const commentDateTime = commentForm.querySelector('.comment__time');
    commentDateTime.textContent = getMessageTime();
  const commentMessage = commentForm.querySelector('.comment__message');
    commentMessage.style.whiteSpace = 'pre';
    commentMessage.textContent = comment.message;
  const closeButton = commentForm.querySelector('.comments__close');
  closeButton.addEventListener('click', function () {
    commentForm.querySelector('.comments__marker-checkbox').checked = false
  },false);
  pictureDiv.appendChild(commentForm);
  commentsToggle();
};

function renderCommentForm(loadForm, comment) {
  const loadFormCommentsBody = loadForm.querySelector('.comments__body');
  const originCommentForm = loadFormCommentsBody.querySelector('.comment');
  const commentForm = originCommentForm.cloneNode(true);
  const loadFormLoader = loadForm.querySelector('.comment_loader');
  const commentDateTime = commentForm.querySelector('.comment__time');
    commentDateTime.textContent = getMessageTime();
  const commentMessage = commentForm.querySelector('.comment__message');
    commentMessage.style.whiteSpace = 'pre';
    commentMessage.textContent = comment.message;
  loadFormCommentsBody.insertBefore(commentForm, loadFormLoader);
  loadForm.reset();
  commentsToggle();
};

function resetComment() {
  const commentsArr = document.querySelectorAll('[data-top]');
  for (let i = 0; i < commentsArr.length; i++) {
    pictureDiv.removeChild(commentsArr[i]);
  };
};

//Отправка комментария
pictureDiv.addEventListener('submit', submitComment, false);

function submitComment(event) {
  event.preventDefault();
  initialFormComment.style.display = 'inline-block';
  initialFormCommentLoader.style.display = 'inline-block';
  const messageForm = event.target.querySelector('.comments__input');
  const commentData = {
    'message': messageForm.value,
    'left': parseInt(event.target.style.left),
    'top': parseInt(event.target.style.top)
  };
  const marker = event.target.querySelector('.comments__marker-checkbox');
    marker.checked = true;
    marker.disabled = false;
  sendComment(commentData);
  const commentLoader = event.target.querySelector('.comment_loader');
    commentLoader.style.display = 'inline-block';
};

function sendComment(data) {
  console.log('Отправка комментария');
  initialFormComment.reset();
  const commentBody = `message=${encodeURIComponent(data.message)}&left=${encodeURIComponent(data.left)}&top=${encodeURIComponent(data.top)}`;
  fetch('https://neto-api.herokuapp.com/pic/' + window.imgID + '/comments', {
      method: 'POST',
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: commentBody
    })
    .then((response) => {
      if (200 <= response.status && response.status < 300) {
        console.log(response);
        return response;
      };
      throw new Error(response.statusText);
    })
    .then((response) => response.json())
    .catch((error) => {
      console.log(error);
      alert('Ошибка при отправке комментария');
    });
};

//Инициализация вебсокет-соединения
let websocket;

function wsConnect() {
  websocket = new WebSocket('wss://neto-api.herokuapp.com/pic/' + window.imgID);
  websocket.addEventListener('open', () => {
    document.querySelector('.menu__url').value = window.location.protocol + '//' + window.location.host + window.location.pathname + '?id=' + window.imgID;
    img.style.display = 'block';
    startShareMode();
    console.log('Вебсокет-соединение открыто');
  });
  websocket.addEventListener('close', event => {
    alert('Соединение разорвано');
    imgLoader.style.display = 'none';
    console.log('Вебсокет-соединение закрыто');
    console.log(event);
  });
  websocket.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    switch (data.event) {
      case 'pic':
        imgLoader.style.display = 'none';
        img.src = data.pic.url;
        img.removeAttribute('new');
        resetComment();
        img.onload = function () {
          if (data.pic.mask) {
            mask.src = data.pic.mask;
            mask.style.display = 'inline-block';
            resizeCanvas();
          };
          if (data.pic.comments) {
            commentsLoad(data.pic.comments);
          };
        };
        break;
      case 'comment':
        commentsToggle();
        renderComment(data.comment);
        break;
      case 'mask':
        mask.src = data.url;
        mask.style.display = 'inline-block';
        mask.style.display = 'absolute';
        break;
    };
    console.log(data);
  });
  websocket.addEventListener('error', error => {
    console.log(`Произошла ошибка: ${error.data}`);
  });
};

img.addEventListener('load', function() {
  pictureDiv.style.width = (img.width) + 'px';
  pictureDiv.style.height = (img.height) + 'px';
});
