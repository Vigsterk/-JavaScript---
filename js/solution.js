const wrap = document.querySelector('.wrap');
const menu = document.querySelector('.menu');
const img = document.querySelector('.current-image');
const newPic = document.querySelector('.new');

document.addEventListener('DOMContentLoaded', function() {
  burger.style.display = 'none';
  share.style.display = 'none';
  comments.style.display = 'none';
  draw.style.display = 'none';
  img.style.display = 'none';
});

menu.setAttribute('draggable', true);
menu.addEventListener('mousedown', (e) => {
  if (e.which != 1) {
    return;
  }
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
    let newLocation = {
      x: limits.left,
      y: limits.top
    };
    if (e.pageX > limits.right) {
      newLocation.x = limits.right;
    } else if (e.pageX > limits.left) {
      newLocation.x = e.pageX;
    }
    if (e.pageY > limits.bottom) {
      newLocation.y = limits.bottom;
    } else if (e.pageY > limits.top) {
      newLocation.y = e.pageY;
    }
    menu.style.left = newLocation.x - shiftX + 'px';
    menu.style.top = newLocation.y - shiftY + 'px';
    menu.style.marginRight = '-1px'
  }

  document.onmousemove = function(e) {
    moveAt(e);
  };

  menu.onmouseup = function() {
    document.onmousemove = null;
    menu.onmouseup = null;
  };

  menu.ondragstart = function() {
    return false;
  };

  function getCoords(elem) {
    let box = elem.getBoundingClientRect();
    return {
      top: box.top + pageYOffset,
      left: box.left + pageXOffset
    };
  }
});

// Кнопка загрузки файла
const loadData = document.createElement('input');
loadData.type = 'file';
loadData.accept = '.jpg, .png'
const newFileBtn = document.getElementsByClassName('new')[0];
newFileBtn.appendChild(loadData);
loadData.style.position = 'absolute';
loadData.style.left = '0';
loadData.style.top = '0';
loadData.style.width = '100%';
loadData.style.height = '100%';
loadData.style.opacity = '0';
loadData.style.cursor =  'pointer';

document.querySelector('input[type="file"]').addEventListener('change', function(e) {
    upload(this.files);
}, false);

const newDropZone = document.createElement('div');
newDropZone.setAttribute('id','dropZone')
wrap.appendChild(newDropZone);
newDropZone.style.position = 'absolute';
newDropZone.style.top = '1px';
newDropZone.style.width = '100%';
newDropZone.style.height = '100vh';
newDropZone.style.display = 'flex';
newDropZone.style.flexDirection = 'row';
newDropZone.style.zIndex = 1;

const imgLoader = document.getElementsByClassName('image-loader')[0];
const dropFiles = document.getElementById('dropZone');
const errorMsg = document.getElementsByClassName('error')[0];
const repeatDownload = document.querySelector('#repeat-download');
errorMsg.style.backgroundColor = '#707885';
dropFiles.addEventListener('drop', onFilesDrop);
dropFiles.addEventListener('dragover', event => event.preventDefault());
img.setAttribute('new','')

function onFilesDrop(event) {
  event.preventDefault();
  const dropFilesArr = Array.from(event.dataTransfer.files);
  const checkDrop = dropFilesArr.forEach(function(elem) {
    console.log (`Загружаемый тип изображения: ${elem.type}`)
    console.log (`Текущий SRC тега img: ${img.src}`)
    if (elem.type == 'image/jpeg' || elem.type == 'image/png') {
      if (img.hasAttribute('new')){
        upload(dropFilesArr);
        errorMsg.style.display = 'none';
      } else {
        repeatDownload.style.display = 'inline-block'
      }
    } else {
      errorMsg.style.display = 'block';
    }
  }
)}


const serverError = document.querySelector('#server-error');

function upload(file) {
  repeatDownload.style.display = 'none'
  const formData = new FormData();
  for (var i = 0, file; file = file[i]; ++i) {
  formData.append('title', file.name);
  formData.append('image', file);
  }
  imgLoader.style.display = 'block'
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
  imgLoader.style.display = 'none'
  serverError.style.display = 'none'
  img.src = data.url;
  img.id = data.id;
  img.style.display = 'block';
  img.style.width = 'auto';
  img.style.height = '95vh';
  startShareMode()
 })
.catch((error) => {
  imgLoader.style.display = 'none'
  serverError.style.display = 'block' });
}

function startShareMode() {
  newDropZone.style.display = 'none';
  burger.style.display = 'inline-block';
  menu.style.display = 'inline-block';
  share.style.display = 'inline-block';
  shareEl.style.display = 'inline-block';
  comments.style.display = 'none';
  commentsEl.style.display = 'none';
  draw.style.display = 'none';
  drawEl.style.display = 'none';
  newPic.style.display = 'none';
}

const burger = document.querySelector('.burger');
burger.addEventListener('click', mainMenuMode)

function mainMenuMode(event){
  newPic.style.display = 'inline-block';
  newDropZone.style.display = 'inline-block';
  burger.style.display = 'none';
  menu.style.display = 'inline-block';
  share.style.display = 'inline-block';
  shareEl.style.display = 'none';
  comments.style.display = 'inline-block';
  commentsEl.style.display = 'none';
  draw.style.display = 'inline-block';
  drawEl.style.display = 'none';
}

const share = document.querySelector('.share');
const shareEl = document.querySelector('.share-tools');
share.addEventListener('click', shareMode)

function shareMode() {
  newDropZone.style.display = 'none';
  newDropZone.style.zIndex = 0;
  burger.style.display = 'inline-block';
  menu.style.display = 'inline-block';
  share.style.display = 'inline-block';
  shareEl.style.display = 'inline-block';
  comments.style.display = 'none';
  commentsEl.style.display = 'none';
  draw.style.display = 'none';
  drawEl.style.display = 'none';
  newPic.style.display = 'none';
}

const draw = document.querySelector('.draw');
const drawEl = document.querySelector('.draw-tools');
const eraserEl = document.querySelector('.menu__eraser');

draw.addEventListener('click', paintMode)

let div = document.createElement('div');
div.id = 'picture';
div.appendChild(img);
let mask = document.createElement('canvas');
mask.id = 'mask';
mask.style.display = 'none';
div.appendChild(mask);
wrap.appendChild(div);
let initMouse = {x:0, y:0};
let curMouse = {x:0, y:0};

function paintMode(event) {
  newDropZone.style.display = 'none';
  newDropZone.style.zIndex = 0;
  mask.style.zIndex = 2;
  burger.style.display = 'inline-block';
  menu.style.display = 'inline-block';
  share.style.display = 'none';
  shareEl.style.display = 'none';
  comments.style.display = 'none';
  commentsEl.style.display = 'none';
  draw.style.display = 'inline-block';
  drawEl.style.display = 'inline-block';
  newPic.style.display = 'none';
  mask.style.position = 'relative';
  document.getElementById('mask').style.display = '';
  document.getElementById('mask').width = img.clientWidth;
  document.getElementById('mask').height = img.clientHeight;
  commentsToggle();

  const canvas = document.getElementById('mask');
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'green';
  ctx.lineWidth = 5;

  canvas.onmousedown = function(event){
    initMouse.x = event.offsetX;
    initMouse.y = event.offsetY;
    ctx.drawing = true;
  }

  canvas.onmousemove = function(event){
    curMouse.x = event.offsetX;
    curMouse.y = event.offsetY;
    if (ctx.drawing){
      ctx.beginPath();
      ctx.lineJoin = 'round'
      ctx.moveTo(initMouse.x, initMouse.y);
      ctx.lineTo(curMouse.x, curMouse.y);
      ctx.closePath();
      ctx.stroke()
    }
    initMouse.x = curMouse.x;
    initMouse.y = curMouse.y;
  }
  canvas.onmouseup = function(){
    ctx.drawing = false;
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

  eraserEl.addEventListener('click', eraser, false)
  function eraser() {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 10;
  };

};

const comments = document.querySelector('.comments');
const commentsEl = document.querySelector('.comments-tools');
const commentsOn = document.querySelector('.menu__toggle');

comments.addEventListener('click', commentsMode)
function commentsMode(event) {
  newDropZone.style.display = 'none';
  newDropZone.style.zIndex = 0;
  burger.style.display = 'inline-block';
  menu.style.display = 'inline-block';
  share.style.display = 'none';
  shareEl.style.display = 'none';
  comments.style.display = 'inline-block';
  commentsEl.style.display = 'inline-block';
  draw.style.display = 'none';
  drawEl.style.display = 'none';
  newPic.style.display = 'none';
  document.getElementById('mask').style.display = 'none';
  document.getElementById('mask').width = img.clientWidth;
  document.getElementById('mask').height = img.clientHeight;
  document.getElementById('mask').style.display = 'none';
  commentsToggle();
};

commentsEl.addEventListener('click', commentsToggle);
img.addEventListener('click', commentAdd);

function commentsToggle (event) {
  if (commentsOn.checked) {
    console.log('Комментарии показаны')
    commentsState('block');
  } else {
    console.log('Комментарии скрыты')
    commentsState('none');
  };
};

function commentsState(param) {
  const commentsForm = document.getElementsByClassName('comments__form');
  for (let i = 0; i < comments.length; i++) {
    comments[i].style.display = param;
  };
};

function commentsLoad(comments) {
  for (let comment in comments) {
    let curComment = {
      message: comments[comment].message,
      left: comments[comment].left,
      top: comments[comment].top};
    createComment(curComment);
  };
};

function createComment(comment) {
  console.log(`Создание формы`)
  let form = document.createElement('form');
      form.classList.add('comments__form');
      form.classList.add('placeForm');
  let marker = document.createElement('span');
      marker.classList.add('comments__marker');
  let check = document.createElement('input');
      check.type = 'checkbox';
      check.classList.add('comments__marker-checkbox');
  let commentBody = document.createElement('div');
      commentBody.classList.add('comments__body');
  let commentDiv = document.createElement('div');
      commentDiv.classList.add('comment');
  let date = new Date();
  let time = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
  let commentUser = document.createElement('p');
      commentUser.classList.add('comment__author');
      commentUser.appendChild(document.createTextNode(time));
  let commentText = document.createElement('p');
      commentText.classList.add('comment__message');
      commentText.appendChild(document.createTextNode(commentText.message));
  form.appendChild(marker);
  form.appendChild(check);
  form.appendChild(commentBody);
  commentBody.appendChild(commentDiv);
  commentDiv.appendChild(commentUser);
  commentDiv.appendChild(commentText);
  form.style.left = commentText.left + '%';
  form.style.top = commentText.top + '%';
  document.getElementById('picture').appendChild(form);
};

function commentAdd(event) {
  console.log(`Добавление комментария`)
  if (document.getElementsByClassName('addForm').length >= 1){
    document.getElementById('picture').removeChild(document.getElementsByClassName('addForm')[0]);
  };
  let form = document.createElement('form');
      form.classList.add('comments__form');
      form.classList.add('addForm');
  let marker = document.createElement('span');
      marker.classList.add('comments__marker');
      form.appendChild(marker);
  let check = document.createElement('input');
      check.type = 'checkbox';
      check.classList.add('comments__marker-checkbox');
      check.checked = true;
      check.disabled = true;
      form.appendChild(check);
  let commentBody = document.createElement('div');
      commentBody.classList.add('comments__body');
      form.appendChild(commentBody);
  let commentText = document.createElement('textarea');
      commentText.type = 'text';
      commentText.classList.add('comments__input');
      commentBody.appendChild(commentText);
  let sendButton = document.createElement('input');
      sendButton.type = 'button';
      sendButton.value = 'отправить';
      sendButton.classList.add('comments__submit');
      commentBody.appendChild(sendButton);
      sendButton.addEventListener('click', function() {
        let commentData = {
          'message':commentText.value,
          'left': event.offsetx ,
          'top': event.offsetY};
      });
  let closeButton = document.createElement('input');
      closeButton.type = 'button';
      closeButton.value = 'закрыть';
      closeButton.classList.add('comments__close');
      commentBody.appendChild(closeButton);
      closeButton.addEventListener('click', function() {
        deleteComment(form);
      });
    form.style.left = `${event.offsetX}px`;
    form.style.top = `${event.offsetY}px`;
    document.getElementById('picture').appendChild(form);
    createComment()
};

function deleteComment(form, sendButton, closeButton) {
  form.innerHTML = '';
  document.getElementById('picture').removeChild(form);
};



let commentsArr = document.getElementsByClassName('comments__form');

function disableComment() {
  let elemArr = Array.from(commentsArr);
  let checkElemArr = elemArr.forEach(function(elem) {
    if (commentsForm.length > 1){
      document.getElementById('picture').removeChild(elemArr[i]);
    }
  })
};
