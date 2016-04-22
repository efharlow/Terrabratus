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
var submitBox = elt({elt: "div", to: document.body, pos: "absolute", top: 100 + "px", left: 100 + "px"});
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
var link = elt({elt: "a", href: "../editor", to: submitBox, txt: "Afer signing up, you need to create a character to play!"});
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
        response.textContent = "response: user already taken";
    }
  }
  xmlhttpi.open("GET", "signup-1.php?name=" + encodeURIComponent(userName.value) + "&password=" + encodeURIComponent(password.value) + "&date=" + Date.now());
  xmlhttpi.send();
}