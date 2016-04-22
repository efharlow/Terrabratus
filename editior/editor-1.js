function elt(props) {
  "use strict";
  var temp = document.createElement(props.elt);
  if(props.to)
    props.to.appendChild(temp);
  if (props.pos) { temp.style.position = props.pos; }
  if (props.back) { temp.style.background = props.back; }
  if (props.height) { temp.height = props.height; }
  if (props.width) { temp.width = props.width; }
  if (props.sW) { temp.style.width = props.sW; }
  if (props.sH) { temp.style.height = props.sH; }
  if (props.top) { temp.style.top = props.top; }
  if (props.left) { temp.style.left = props.left; }
  if (props.type) { temp.type = props.type; }
  if (props.src) { temp.src = props.src; }
  if (props.disp) { temp.style.display = props.disp; }
  if (props.txt) { temp.textContent = props.txt; }
  if (props.alt) { temp.alt = props.alt; }
  if (props.href) { temp.href = props.href; }
  if (props.radius) { temp.style.borderRadius = props.radius; }
  if (props.centerTxt) {temp.style["text-align"] = "center"; temp.style["vertical-align"] = "middle"; temp.style["line-height"] = props.centerTxt + "px";}
  if (props.noSelect) {temp.style["-webkit-touch-callout"] = temp.style["-webkit-user-select"] = temp.style["-khtml-user-select"] = temp.style["-moz-user-select"] = temp.style["-ms-user-select"] = temp.style["user-select"] = "none"; }
  if (props.overflow) { temp.style.overflow = props.overflow; }
  if (props.list) { props.list.forEach(function (listener) {
    temp.addEventListener(listener.what, listener.list);
  }); }
  if (props.className) { temp.className = props.className; }
  return temp;
}

var canvas = elt({elt: "canvas", to: document.body, top: "0px", left: "0px", pos: "absolute", height: "32", width: 32 * 16});
var cx = canvas.getContext("2d");
var imgs = {pants: "pants.png", shirt: "shirt.png", skin: "skin.png", eyes: "eyes.png", longHair: "longHair.png", upHair: "upHair.png"};
function createPic(src) {
  return elt({elt: "img", src: src, list: [{what: "load", list: function(event) {redraw();}}]});
}
function createClick(text, pic, type, number, posX, posY) {
  return elt({elt: "p", to: document.body, noSelect: true, pos: "absolute", top: posY + "px", left: posX + "px", txt: text,
  list: [{what: "click", list: function(event) {selected[type] = {img: pic, num: number}; redraw(); }}
  ]});
}
for (attr in imgs) {
  imgs[attr] = createPic(imgs[attr]);
}
elt({elt: "p", to: document.body, noSelect: true, pos: "absolute", top: 40 + "px", left: 0 + "px", txt: "Character Editor"});
var selected = {pants: {img: imgs.pants, num: 0}, shirt: {img: imgs.shirt, num: 0}, skin: {img: imgs.skin, num: 0}, eyes: {img: imgs.eyes, num: 0}, hair: {img: imgs.longHair, num: 0}};
elt({elt: "div", to: document.body, pos: "absolute", top: "134px", left: "0px", sW: "500px", sH: "1px", back: "black"});
elt({elt: "p", to: document.body, noSelect: true, pos: "absolute", top: 100 + "px", left: 50 + "px", txt: "pants"});
createClick("blue", imgs.pants, "pants", 0, 50, 120);
elt({elt: "p", to: document.body, noSelect: true, pos: "absolute", top: 100 + "px", left: 100 + "px", txt: "shirts"});
createClick("blue", imgs.shirt, "shirt", 0, 100, 120);
createClick("orange", imgs.shirt, "shirt", 1, 100, 140);
createClick("purple", imgs.shirt, "shirt", 2, 100, 160);
createClick("green", imgs.shirt, "shirt", 3, 100, 180);
createClick("yellow", imgs.shirt, "shirt", 4, 100, 200);
createClick("red", imgs.shirt, "shirt", 5, 100, 220);
elt({elt: "p", to: document.body, noSelect: true, pos: "absolute", top: 100 + "px", left: 150 + "px", txt: "skin"});
createClick("white", imgs.skin, "skin", 0, 150, 120);
createClick("tan", imgs.skin, "skin", 1, 150, 140);
createClick("black", imgs.skin, "skin", 2, 150, 160);
elt({elt: "p", to: document.body, noSelect: true, pos: "absolute", top: 100 + "px", left: 200 + "px", txt: "eyes"});
createClick("black", imgs.eyes, "eyes", 0, 200, 120); //,200
createClick("blue", imgs.eyes, "eyes", 1, 200, 140);
createClick("green", imgs.eyes, "eyes", 2, 200, 160);
createClick("grey", imgs.eyes, "eyes", 3, 200, 180);
createClick("brightBlue", imgs.eyes, "eyes", 4, 200, 200);
elt({elt: "p", to: document.body, noSelect: true, pos: "absolute", top: 100 + "px", left: 300 + "px", txt: "hair - long"});
createClick("brown", imgs.longHair, "hair", 0, 300, 120);
createClick("blond", imgs.longHair, "hair", 1, 300, 140);
createClick("blue", imgs.longHair, "hair", 2, 300, 160);
createClick("red", imgs.longHair, "hair", 3, 300, 180);
elt({elt: "p", to: document.body, noSelect: true, pos: "absolute", top: 100 + "px", left: 400 + "px", txt: "hair - up"});
createClick("brown", imgs.upHair, "hair", 0, 400, 120);
createClick("red", imgs.upHair, "hair", 1, 400, 140);
createClick("blue", imgs.upHair, "hair", 2, 400, 160);
createClick("blond", imgs.upHair, "hair", 3, 400, 180);
function redraw() {
  cx.clearRect(0, 0, 32 * 16, 32);
  ["pants", "shirt", "skin", "eyes", "hair"].forEach(function(elt) {
    var num = selected[elt].num;
    cx.drawImage(selected[elt].img, (num * 32 * 16), 0, (32 * 16), 32, 0, 0, (32 * 16), 32);
    //console.log(num, selected[elt].img, 0, 0, 32 * 16, 32, num * 32 * 16, 0, (num + 1) * 32 * 16, 32);
  });
}
var submitBox = elt({elt: "div", to: document.body, pos: "absolute", top: 0 + "px", left: 600 + "px"});
elt({elt: "p", to: submitBox, txt: "user name"});
var userName = elt({elt: "input", to: submitBox});
elt({elt: "p", to: submitBox, txt: "password"});
var password = elt({elt: "input", type: "password", to: submitBox, list: [{what: "keyup", list: passwordikey}]});
function passwordikey(event) {
  if (event.keyCode === 13)
    send();
}
var submit = elt({elt: "p", to: submitBox, txt: "[[submit]]", list: [{what: "click", list: send}]});
var response = elt({elt: "p", to: submitBox, txt: "response:"});
var link = elt({elt: "a", href: "../", to: submitBox, txt: "return to game"});
//link.text = "return to game";
function send(event) {
  var xmlhttpi;
  if (window.XMLHttpRequest) {
   xmlhttpi = new XMLHttpRequest();
   }
  else {
    xmlhttpi = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttpi.onreadystatechange = function() {
    if (xmlhttpi.readyState == 4 && xmlhttpi.status == 200) {
      var text = xmlhttpi.responseText;
      if (text === "good")
        response.textContent = "response: success!";
      else if (text === "user")
        response.textContent = "response: user not defined";
      else if (text === "password")
        response.textContent = "response: incorrect password";
    }
  }
  xmlhttpi.open("GET", "postSprite.php?name=" + encodeURIComponent(userName.value) + "&password=" + encodeURIComponent(password.value) + "&imgBase64=" + canvas.toDataURL());
  xmlhttpi.send();
}
/*var i = 0;
for (attr in imgs) {
  elt({elt: "p", to: document.body, pos: "absolute", top: 100 + "px", left: (i + 1) * 50 + "px", txt: attr});
  imgs[attr] = createPic(imgs[attr]);
  
}*/
