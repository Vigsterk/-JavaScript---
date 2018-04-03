'use strict';

const wrap = document.getElementsByClassName('wrap')[0];
const menu = document.getElementsByClassName('menu')[0];
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

  menu.style.position = 'absolute';
  document.body.appendChild(menu);
  menu.style.zIndex = 1000;

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

const menuState = (eventent) => {
  menu.dataset.state = 'initial';
};
document.addEventListener('DOMContentLoaded', menuState);

const hamburger = document.querySelector('li.menu__item.burger');
hamburger.addEventListener('click', hamburgerFunc)
hamburger.style.display = 'none'


// Кнопка загрузки файла
const loadData = document.createElement('input');
loadData.setAttribute('type', 'file');
loadData.setAttribute('accept', 'image/jpeg, image/png')
const newFileBtn = document.getElementsByClassName('new')[0];
newFileBtn.appendChild(loadData);
loadData.style.position = 'absolute';
loadData.style.left = '0';
loadData.style.top = '0';
loadData.style.width = '100%';
loadData.style.height = '100%';
loadData.style.opacity = '0';
loadData.style.cursor =  'pointer';

// Перемещение картинки с рабочего стола в зону обработки изображений.
const newDropZone = document.createElement('div');
newDropZone.setAttribute('id','dropZone')
wrap.appendChild(newDropZone);
newDropZone.style.position = 'absolute';
newDropZone.style.top = '1px';
newDropZone.style.width = '100%';
newDropZone.style.height = '100vh';
newDropZone.style.display = 'flex';
newDropZone.style.flexDirection = 'row';

const imgLoader = document.getElementsByClassName('image-loader')[0];
const dropFiles = document.getElementById('dropZone');
const errorMsg = document.getElementsByClassName('error')[0];
dropFiles.addEventListener('drop', onFilesDrop);
dropFiles.addEventListener('dragover', eventent => eventent.prevententDefault());
function onFilesDrop(eventent) {
  eventent.prevententDefault();
	const dropFilesArr = Array.from(eventent.dataTransfer.files);
  const checkDrop = dropFilesArr.forEach(function(elem){
    //  console.log (elem.type)
      if (elem.type == 'image/jpeg' || elem.type == 'image/png'){
      	upload(dropFilesArr,'https://neto-api.herokuapp.com/pic/');
        errorMsg.style.display = 'none';
      } else {
        errorMsg.style.display = 'block';
      }

  })
}

// Отправка изображения на сервер
const xhr = new XMLHttpRequest();

function upload(files, url) {
console.log(files.type)
const formData = new FormData();
for (var i = 0, file; file = files[i]; ++i) {
formData.append('title', file.name);
formData.append('image', file);
}
imgLoader.style.display = 'block'
xhr.open('POST', url, true);
xhr.onload = function() {
  const response = JSON.parse(xhr.responseText);
  console.log(response);
  const imgUrl = JSON.parse(xhr.responseText).url;
  const img = document.querySelector('.current-image');
  imgLoader.style.display = 'none'
  img.src = imgUrl;
  img.style.width = 'auto';
  img.style.height = '95%'
  const imgID = JSON.parse(xhr.responseText).id;

  xhr.open('GET',url + imgID, true);
  xhr.onload = function() {
    const getResponse = JSON.parse(xhr.responseText);
    console.log(getResponse);
  }
  xhr.send(null);
}
xhr.send(formData);
// Иницализация режима редактирования
hamburger.style.display = 'inline-block'
menu.dataset.state = 'default';
}
document.querySelector('input[type="file"]').addEventListener('change', function(e) {
    upload(this.files,'https://neto-api.herokuapp.com/pic/');
}, false);

//Выпадающие блоки меню

const comments = document.querySelector('li.menu__item.mode.comments')
comments.addEventListener('click', selectedMode)

const draw = document.querySelector('li.menu__item.mode.draw')
draw.addEventListener('click', selectedMode)

const share = document.querySelector('li.menu__item.mode.share')
share.addEventListener('click', selectedMode)




function selectedMode(eventent) {
  const target = eventent.currentTarget;
  target.dataset.state = target.dataset.state === 'selected' ? '' : 'selected';
  target.parentElement.dataset.state = 'selected';
  console.log(eventent.target);
}

function hamburgerFunc(eventent) {
  menu.dataset.state = menu.dataset.state === 'selected' ? 'default' : 'selected';
}


const mask = document.createElement('canvas');
wrap.appendChild(mask);
mask.style.width = '50%'
mask.style.height = '50vh'
mask.style.position = 'absolute'
mask.style.zIndex = '900'
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
var rSize = 0.2;
var myColor = 'red';

canvas.onmousedown = function(event){
  let x = event.offsetX;
  let y = event.offsetY;
  ctx.beginPath();
  ctx.moveTo (x,y);
  ctx.drawing = true;
}
canvas.onmousemove = function (event){
  if (ctx.drawing){
    let x = event.offsetX;
    let y = event.offsetY;
    ctx.lineWidth = rSize
    ctx.strokeStyle = myColor
    ctx.lineCap = "round"
    ctx.lineTo (x,y)
    ctx.stroke()
  } }
canvas.onmouseup = function(){
  ctx.drawing = false;
}
