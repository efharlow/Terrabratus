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
var width = 480, height = 320, scale = 32;
var canvas = elt({elt: "canvas", to: document.body, width: width, height: height, pos: "absolute", top: "0px", left: "0px"});
var cx = canvas.getContext("2d");
function Level(plan, title) {
  this.title = title;
  this.grid = [];
  this.levels = plan.length;
  this.height = plan[0].layer.length;
  this.width = plan[0].layer[0].length;
  this.playerLevel = 1;
  plan.forEach(function(layer, i) {
    //console.log("exec");
    var layerPlan = layer.layer,
        key = layer.key,
        layeri = [];
    //console.log(layerPlan, key, layer);
    if (key.playerLevel)
      this.playerLevel = i + 1;
    for (var y = 0; y < this.height; y++) {
      var row = [];
      for (var x = 0; x < this.width; x++) {
        var ch = layerPlan[y][x],
            type = typeOf[key[ch]];
        //console.log(type, key[ch], ch);
        row.push(type);
      }
      layeri.push(row);
    }
    this.grid.push(layeri);
  }, this);
  this.changeLevel = null;
  this.changeDelay = null;
  this.changePos = new Vector(0, 0);
  this.viewport = {top: 0, left: 0, width: width/scale, height: height/scale, margin: height/scale/5};
  this.animationTime = 0;
  this.analytical = false;
}
var typeOf = {
  grass: {type: "grass", passable: true},
  tree: {type: "tree", passable: false},
  "tree top": {type: "tree top", passable: false},
  flower1: {type: "flower1", passable: true},
  flower2: {type: "flower2", passable: true},
  blueDoor: {type: "blueDoor", passable: true, baseType: "door", changeTo: "forest", changePos: new Vector(0, 5)},
  space: {type: "space", passable: true},
  pTop: {type: "pTop", passable: true},
  pTree: {type: "pTree", passable: false},
  treeEverMix: {type: "treeEverMix", passable: false},
  door2: {type: "blueDoor", passable: true, baseType: "door", changeTo: "main", changePos: new Vector(38, 4)}
},
imageIndexOf = {
  grass: new Vector(0, 0),
  "tree top": new Vector(7, 0),
  flower1: new Vector(3, 0),
  flower2: new Vector(4, 0),
  tree: new Vector(2, 0),
  space: new Vector(8, 0),
  blueDoor: new Vector(9, 0),
  pTop: new Vector(10, 0),
  pTree: new Vector(11, 0),
  treeEverMix: new Vector(12, 0)
},
otherPlayers = [], player = null, imgs = {};
imgs.items = document.createElement("img");
imgs.items.src = "items.png";
Level.prototype.change = function() {
  return this.changeLeve !== null && this.changeDelay < 0;
};
function Vector(x, y) {
  this.x = x; this.y = y;
}
Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function(factor) {
  return new Vector(this.x * factor, this.y * factor);
};
function Player(name, pos, field) {
  this.name = name;
  this.pos = pos;
  this.field = field;
  this.moving = 1;
  this.lastPos = pos;
  this.firstPos = pos;
  this.status = "on";
}
function Character(name, pos, field, status) {
  this.name = name;
  this.pos = pos;
  this.field = field;
  this.move = new Vector(0, 0);
  this.status = status;
  this.moving = 1;
  this.lastPos = pos;
  this.tempMove = "";
  this.promise = new Vector(0, 0);
  this.lastChange = new Vector(0, 0);
  this.lastField = field;
}
var maxTime = 0.05;
Level.prototype.update = function(time) {
  //console.log("Level.prototype.update", "time = " + time);
  this.animationTime += time;
  if (this.changeDelay)
    this.changeDelay -= time;
  if (this.changeDelay < 0) {
    level = new Level(levels[this.changeLevel], this.changeLevel);
    player.field = this.changeLevel;
    //player.lastPos = this.changePos;
    player.pos = player.firstPos = player.lastPos = this.changePos;
    sendPlayerData();
  }
  while (time > 0) {
    var current = Math.min(time, maxTime);
    if (player)
      player.actUpon(this, current);
    otherPlayers.forEach(function(player) {
      player.actUpon(this, time);
    }, this);
    time -= current;
  }
  this.updateViewport();
  cx.clearRect(0, 0, width, height);
  for (var l = 0; l < this.playerLevel; l++) {
    this.drawLevel(l);
  }
  this.drawPlayers();
  for (l; l < this.levels; l++) {
    this.drawLevel(l);
  }
  if (/* !this.changeLevel && */player.lastPos.x !== Math.floor(player.pos.x) || player.lastPos.y !== Math.floor(player.pos.y)) { //((Math.floor(player.lastPos.x) === player.firstPos.x || Math.floor(player.lastPos.x) === player.firstPos.x - 1) && (Math.floor(player.lastPos.y) === player.firstPos.y || Math.floor(player.lastPos.y) === player.firstPos.y - 1)) {//(/* !this.changeLevel && */(player.lastPos.x !== Math.floor(player.pos.x) || player.lastPos.y !== Math.floor(player.pos.y)) {
    player.lastPos = new Vector(Math.floor(player.pos.x), Math.floor(player.pos.y));
    player.status = "on";
    sendPlayerData();
    if (((Math.floor(player.pos.x) !== player.firstPos.x) && (Math.floor(player.pos.x) !== player.firstPos.x - 1)) || ((Math.floor(player.pos.y) !== player.firstPos.y) && (Math.floor(player.pos.y) !== player.firstPos.y - 1)))
      player.firstPos = new Vector(-1, -1);
  }
  if (this.analytical) {
    this.drawNames();
  }
};
Level.prototype.itemCollision = function(pos) {
  var startX = Math.floor(pos.x), endX = Math.ceil(pos.x + 1), startY = Math.floor(pos.y), endY = Math.ceil(pos.y + 1), door = false;
  //console.log(endX);
  if (startX < 0 || endX > this.width || startY < 0 || endY > this.height)
    return {result: true, object: null, reason: "not passable"};
  for (var l = 0; l < this.playerLevel; l++) {
    for (var y = startY; y < endY; y++) {
      for (var x = startX; x < endX; x++) {
        var square = this.grid[l][y][x];
        if (square.passable === false)
          return {result: true, object: square, reason: "not passable"};
        if (square.changeTo) {
          var door = {result: true, object: square, reason: "doorway"};
        }
      }
    }
  }
  if (door) 
    return door;
  return {result: false};
};
Player.prototype.actUpon = function(level, time) {
  //console.log("Player.prototype.actUpon");
  move.horizontal = (keyResults.left ? -1 : 0) + (keyResults.right ? 1 : 0);
  move.vertical = (keyResults.down ? 1 : 0) + (keyResults.up ? -1 : 0);
  move.speed = keyResults.speed ? 2 : 1;
  //console.log("move = ", move);
  this.moveY(level, time);
  this.moveX(level, time);
};
var moveFactor = 2;
Player.prototype.checkCollision = function(newPos) {
  var result = false;
  if (!((Math.floor(this.pos.x) === this.firstPos.x || Math.floor(this.pos.x) === this.firstPos.x - 1) && (Math.floor(this.pos.y) === this.firstPos.y || Math.floor(this.pos.y) === this.firstPos.y - 1))) {
    otherPlayers.forEach(function(player) {
      if (player.status == "on" && player.field == this.field && player.pos.x < newPos.x + 1 && player.pos.x + 1 > newPos.x && player.pos.y < newPos.y + 1 && player.pos.y + 1 > newPos.y) {
        result = true;
      }
    }, this);
  }
  return result;
};
Player.prototype.moveX = function(level, time) {
  if (move.horizontal > 0)
    this.moving = 2;
  else if (move.horizontal < 0)
    this.moving = 3;
  var newPos = this.pos.plus(new Vector(move.horizontal * move.speed * time * moveFactor, 0));
  var collision = level.itemCollision(newPos), otherCollision = this.checkCollision(newPos);
  if (!collision.result && !otherCollision) {
    this.pos = newPos;
  } else if (collision.reason === "doorway" /*&& !(level.changeLevel)*/ && !otherCollision) {
    this.pos = newPos;
    if (!(level.changeLevel)) {
      level.changeLevel = collision.object.changeTo;
      level.changeDelay = 1;
      level.changePos = collision.object.changePos;
    }
  }
};
Player.prototype.moveY = function(level, time) {
  if (move.vertical < 0)
    this.moving = 0;
  else if (move.vertical > 0)
    this.moving = 1;
  var newPos = this.pos.plus(new Vector(0, move.vertical * move.speed * time * moveFactor));
  var collision = level.itemCollision(newPos), otherCollision = this.checkCollision(newPos);
  if (!collision.result && !otherCollision) {
    this.pos = newPos;
  } else if (collision.reason === "doorway" /*&& !(level.changeLevel)*/ && !otherCollision) {
    this.pos = newPos;
    if (!(level.changeLevel)) {
      level.changeLevel = collision.object.changeTo;
      level.changeDelay = 1;
      level.changePos = collision.object.changePos;
    }
  }
};
Character.prototype.actUpon = function(level, time) {
  //if (this.lastField !== this.field) {
    //this.lastPos = this.pos;
  //}
  this.lastField = this.field;
  if (this.field == player.field) {
    this.lastPos = this.pos;
    this.moveY(level, time);
    this.moveX(level, time);
    if (this.pos.y === this.lastPos.y && this.pos.x === this.lastPos.x && (this.move.x === 0 || this.promise.x !== 0) && (this.move.y > 1 || this.move.y < -1)/* && (this.tempMove === "" || this.tempMove === "horizontal")*/) {//  this.tempMove = {horizonal: 0, vertical: 0, trying: ""};
      this.tempMove = "vertical";
      if (this.move.x === 0)
        this.promise.x += this.move.x = (this.lastChange.x > 0 ? -1 : 1);
      //console.log(this.move.x, this.promise.x);
    } else if (this.pos.y === this.lastPos.y && this.pos.x === this.lastPos.x && (this.move.y === 0 || this.promise.y !== 0) && (this.move.x > 1 || this.move.x < -1)/*&& (this.move.x > 1 (aka 1.1, 2) || this.move.x < -1)*//* && (this.tempMove === "" || this.tempMove === "horizontal")*/) {
      this.tempMove = "horizontal";
      if (this.move.y === 0)
        this.promise.y += this.move.y = (this.lastChange.y > 0 ? -1 : 1);
      //console.log(this.move.y, this.promise.y);
    } else if ((this.tempMove === "vertical" && this.pos.y !== this.lastPos.y/* && this.move.x === 0*/) || (this.tempMove === "horizontal" && this.pos.x !== this.lastPos.x/* && this.move.y === 0*/)) {
      this.tempMove = "";
      this.move = this.move.plus(this.promise.times(-1));
      this.promise = new Vector(0, 0);
    }
  } else {
    //this.lastPos = this.pos.plus(this.move);
    //this.pos = this.pos.plus(this.move);
  }
};
Character.prototype.checkCollision = function(newPos) {
  var result = false;
  otherPlayers.forEach(function(player) {
    if (player !== this) {
      if (player.status == "on" && player.field == this.field && player.pos.x < newPos.x + 1 && player.pos.x + 1 > newPos.x && player.pos.y < newPos.y + 1 && player.pos.y + 1 > newPos.y) {
        result = true;
      }
    }
  }, this);
  if (player.pos.x < newPos.x + 1 && player.pos.x + 1 > newPos.x && player.pos.y < newPos.y + 1 && player.pos.y + 1 > newPos.y) {
    result = true;
  }
  return result;
};
Character.prototype.moveX = function(level, time) {
  var move = this.move.x, change = 0;
  if (move > 0)
    this.moving = 2;//(this.tempMove === "horizontal" ? 3 : 2);
  else if (move < 0)
    this.moving = 3;//(this.tempMove === "horizontal" ? 2 : 3);
  if (move < 0) {
    change = Math.max(move, -moveFactor * time);
  } else if (move > 0) {
    change = Math.min(move, moveFactor * time);
  }
  if (change !== 0 && this.tempMove === "")
    this.lastChange.x = change;
  //change = (this.tempMove === "horizontal" ? -change : change);
  var newPos = this.pos.plus(new Vector(change, 0));
  if (change !== 0) {
    var otherCollision = this.checkCollision(newPos), collision = level.itemCollision(newPos);
    if (!otherCollision && !collision.result) {
      this.pos = newPos;
      this.move.x -= change;
    }
  }
};
Character.prototype.moveY = function(level, time) {
  var move = this.move.y, change = 0;
  if (move < 0)
    this.moving = 0;//(this.tempMove === "vertical" ? 1 : 0);
  else if (move > 0)
    this.moving = 1;//(this.tempMove === "horizontal" ? 0 : 1);
  if (move < 0) {
    change = Math.max(move, -moveFactor * time);
  } else if (move > 0) {
    change = Math.min(move, moveFactor * time);
  }
  if (change !== 0 && this.tempMove === "")
    this.lastChange.y = change;
  //change = (this.tempMove === "horizontal" ? -change : change);
  var newPos = this.pos.plus(new Vector(0, change));
  if (change !== 0) {
    var otherCollision = this.checkCollision(newPos), collision = level.itemCollision(newPos);
    if (!otherCollision && !collision.result) {
      this.pos = newPos;
      this.move.y -= change;
    }
  }
};
Level.prototype.updateViewport = function(center) {
  var center = center || player.pos.plus(new Vector(.5, .5)), margin = this.viewport.margin;
  if (center.x < this.viewport.left + margin)
    this.viewport.left = Math.max(center.x - margin, 0);
  else if (center.x > this.viewport.left + this.viewport.width - margin)
    this.viewport.left = Math.min(center.x + margin - this.viewport.width,
                         this.width - this.viewport.width);
  if (center.y < this.viewport.top + margin)
    this.viewport.top = Math.max(center.y - margin, 0);
  else if (center.y > this.viewport.top + this.viewport.height - margin)
    this.viewport.top = Math.min(center.y + margin - this.viewport.height,
                        this.height - this.viewport.height);
};
Level.prototype.drawLevel = function(level) {
  var draws = this.grid[level].map(function(row) {
    return row.map(function(square) { return imageIndexOf[square.type];});
  });
  var yStart = Math.floor(this.viewport.top), yEnd = Math.ceil(this.viewport.top + this.viewport.height),
      xStart = Math.floor(this.viewport.left), xEnd = Math.ceil(this.viewport.left + this.viewport.width);
  //console.log(yStart, yEnd, xStart, xEnd, draws);
  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      //console.log(x, y);
      cx.drawImage(imgs.items, draws[y][x].x * scale, draws[y][x].y * scale, scale, scale, Math.floor((x - this.viewport.left) * scale), Math.floor((y - this.viewport.top) * scale), scale, scale);
    }
  }
};
Level.prototype.drawPlayers = function() {
  var view = this.viewport;
  otherPlayers.forEach(function(playeri) {
    if (playeri.status === "on" && playeri.field == player.field &&
        playeri.pos.x + 1 > view.left &&
        playeri.pos.x < view.left + view.width &&
        playeri.pos.y + 1 > view.top &&
        playeri.pos.y < view.top + view.height) {
      cx.drawImage(imgs[playeri.name], (4*playeri.moving + ((playeri.move.x !== 0 || playeri.move.y !== 0) ? Math.floor(this.animationTime * 7) % 4 : 0)) * scale, 0, scale, scale, Math.floor((playeri.pos.x - view.left) * scale), Math.floor((playeri.pos.y - view.top) * scale), scale, scale);
    }
  }, this);
  cx.drawImage(imgs[player.name], (4*player.moving + ((move.horizontal !== 0 || move.vertical !== 0) ? Math.floor(this.animationTime * 7) % 4 : 0)) * scale, 0, scale, scale, Math.floor((player.pos.x - this.viewport.left) * scale), Math.floor((player.pos.y - this.viewport.top) * scale), scale, scale);
};
cx.font = "12px Georgia";
cx.fillStyle = "white";
Level.prototype.drawNames = function() {
  var view = this.viewport;
  otherPlayers.forEach(function(playeri) {
    if (playeri.status === "on" && playeri.field == player.field &&
        playeri.pos.x + 1 > view.left &&
        playeri.pos.x < view.left + view.width &&
        playeri.pos.y + 1 > view.top &&
        playeri.pos.y < view.top + view.height) {
        cx.fillText(playeri.name, Math.floor((playeri.pos.x - view.left) * scale), Math.floor((playeri.pos.y + 1.25 - view.top) * scale));
        //cx.drawImage(imgs[playeri.name], (4*playeri.moving + ((playeri.move.x !== 0 || playeri.move.y !== 0) ? Math.floor(this.animationTime * 7) % 4 : 0)) * scale, 0, scale, scale, Math.floor((playeri.pos.x - view.left) * scale), Math.floor((playeri.pos.y - view.top) * scale), scale, scale);
    }
  }, this);
};
var move = {horizontal: 0, vertical: 0, speed: 1}, keyResults = {left: false, right: false, up: false, down: false, speed: false},
    keys = {87: "up", 65: "left", 83: "down", 68: "right", 38: "up", 39: "right", 37: "left", 40: "down", 90: "speed"};
function trackKeys(event) {
  var down = event.type == "keydown";
  if (keys.hasOwnProperty(event.keyCode))
    keyResults[keys[event.keyCode]] = down;
  if (event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 37 || event.keyCode === 40)
    event.preventDefault();
}
addEventListener("keydown", trackKeys);
addEventListener("keyup", trackKeys);
function touch(type, event) {keyResults[type] = event.type == "touchstart"; event.preventDefault();}
function touchP(type, event) {keyResults[type] = event.type == "touchstart";}
function mouse(type, event) {keyResults[type] = event.type == "mousedown"; event.preventDefault();}
var buttondim = 40;
if ((/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
  elt({elt: "div", to: document.body, pos: "absolute", top:"0px", left: "120px", sW: "240px", sH: "160px", list: [{list: touchP.bind(null, "up"), what: "touchstart"}, {list: touchP.bind(null, "up"), what: "touchend"}, {list: touchP.bind(null, "up"), what: "touchleave"}]});
  elt({elt: "div", to: document.body, pos: "absolute", top:"160px", left: "120px", sW: "240px", sH: "160px", list: [{list: touchP.bind(null, "down"), what: "touchstart"}, {list: touchP.bind(null, "down"), what: "touchend"}, {list: touchP.bind(null, "down"), what: "touchleave"}]});
  elt({elt: "div", to: document.body, pos: "absolute", top:"0px", left: "0px", sW: "120px", sH: "320px", list: [{list: touchP.bind(null, "left"), what: "touchstart"}, {list: touchP.bind(null, "left"), what: "touchend"}, {list: touchP.bind(null, "left"), what: "touchleave"}]});
  elt({elt: "div", to: document.body, pos: "absolute", top:"0px", left: "360px", sW: "120px", sH: "320px", list: [{list: touchP.bind(null, "right"), what: "touchstart"}, {list: touchP.bind(null, "right"), what: "touchend"}, {list: touchP.bind(null, "right"), what: "touchleave"}]});
}
elt({elt: "div", to: document.body/*, noSelect: true*/, centerTxt: buttondim, txt: " w", back: "rgb(245,233,187)", pos: "absolute", top: height + 20 - 5 + "px", left: width / 2 + "px", sW: buttondim + "px", sH: buttondim + "px", radius: buttondim/2 + "px", list: [{list: touch.bind(null, "up"), what: "touchstart"}, {list: touch.bind(null, "up"), what: "touchend"}, {list: touch.bind(null, "up"), what: "touchleave"}, {list: mouse.bind(null, "up"), what: "mousedown"}, {list: mouse.bind(null, "up"), what: "mouseup"}, {list: mouse.bind(null, "up"), what: "mouseout"}]});
elt({elt: "div", to: document.body/*, noSelect: true*/, centerTxt: buttondim, txt: " s", back: "rgb(245,233,187)", pos: "absolute", top: height + 20 + buttondim/* *2*/ + "px", left: width / 2  + "px", sW: buttondim + "px", sH: buttondim + "px", radius: buttondim/2 + "px", list: [{list: touch.bind(null, "down"), what: "touchstart"}, {list: touch.bind(null, "down"), what: "touchend"}, {list: touch.bind(null, "down"), what: "touchleave"}, {list: mouse.bind(null, "down"), what: "mousedown"}, {list: mouse.bind(null, "down"), what: "mouseup"}, {list: mouse.bind(null, "down"), what: "mouseout"}]});
elt({elt: "div", to: document.body/*, noSelect: true*/, centerTxt: buttondim, txt: " a", back: "rgb(245,233,187)", pos: "absolute", top: height + 20 + buttondim + "px", left: width / 2 + buttondim  + 5 + "px", sW: buttondim + "px", sH: buttondim + "px", radius: buttondim/2 + "px", list: [{list: touch.bind(null, "right"), what: "touchstart"}, {list: touch.bind(null, "right"), what: "touchend"}, {list: touch.bind(null, "right"), what: "touchleave"}, {list: mouse.bind(null, "right"), what: "mousedown"}, {list: mouse.bind(null, "right"), what: "mouseup"}, {list: mouse.bind(null, "right"), what: "mouseout"}]});
elt({elt: "div", to: document.body/*, noSelect: true*/, centerTxt: buttondim, txt: " d", back: "rgb(245,233,187)", pos: "absolute", top: height + 20 + buttondim + "px", left: width / 2  - buttondim  - 5 + "px", sW: buttondim + "px", sH: buttondim + "px", radius: buttondim/2 + "px", list: [{list: touch.bind(null, "left"), what: "touchstart"}, {list: touch.bind(null, "left"), what: "touchend"}, {list: touch.bind(null, "left"), what: "touchleave"}, {list: mouse.bind(null, "left"), what: "mousedown"}, {list: mouse.bind(null, "left"), what: "mouseup"}, {list: mouse.bind(null, "left"), what: "mouseout"}]});
elt({elt: "div", to: document.body/*, noSelect: true*/, centerTxt: buttondim, txt: " z", back: "rgb(245,233,187)", pos: "absolute", top: height + 20 + buttondim/* *3*/ + "px", left: width / 2  - 2*buttondim  - 10+ "px", sW: buttondim + "px", sH: buttondim + "px", radius: buttondim/2 + "px", list: [{list: touch.bind(null, "speed"), what: "touchstart"}, {list: touch.bind(null, "speed"), what: "touchend"}, {list: touch.bind(null, "speed"), what: "touchleave"}, {list: mouse.bind(null, "speed"), what: "mousedown"}, {list: mouse.bind(null, "speed"), what: "mouseup"}, {list: mouse.bind(null, "speed"), what: "mouseout"}]});
var analytical = elt({elt: "div", to: document.body/*, noSelect: true*/, centerTxt: buttondim, txt: "]0[", back: "rgb(245,233,187)", pos: "absolute", top: height + 20 + buttondim/* *3*/ + "px", left: width / 2  + 2*buttondim  + 10+ "px", sW: buttondim + "px", sH: buttondim + "px", radius: buttondim/2 + "px", list: [{list: analyze, what: "click"}/*{list: analyze, what: "touchend"}, {list: analyze, what: "mouseup"}*/]});
function analyze(event) {
  if (level) {
    level.analytical = !level.analytical;
    //analytical.textContent = level.analytical ? "]|[" : "]0["
  }
}
//rgb(245,208,124),rgb(245,208,124),rgb(245,208,124),rgb(120,232,211),rgb(218,129,232)
var level = null;
var lastTime = null;
elt({elt: "img", to: document.body, src: "Terrabratus.png", pos: "absolute", left: "5px", top: height + 5 + "px"});
elt({elt: "a", to: document.body, href: "editor", pos: "absolute", left: width - 125 + "px", top: height + 5 + "px", txt: "character editor"});
/*addEventListener("pagehide", function() {
  keyResults = {left: false, right: false, up: false, down: false, speed: false};
  player.status = "off";
  sendPlayerData();
});
addEventListener("pageshows", function() {
  player.status = "on";
  sendPlayerData();
});*/
function main(time) {
  //console.log(player.pos);
  window.requestAnimationFrame(main);
  if (lastTime)
    level.update(Math.min(time - lastTime, 100) / 1000);
  lastTime = time;
}

var timestamp = null;
function firstData(event/*name, password*/) {
  var name = userName.value, password = passwordi.value;
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "firstData.php?timestamp=" + timestamp + "&name=" + encodeURIComponent(name) + "&password=" + encodeURIComponent(password) + "&" + "time=" + (new Date()).getTime());
  oReq.send(null);
  oReq.onreadystatechange = function() {
    if (oReq.readyState == 4 && oReq.status >= 200 && oReq.status < 300 || oReq.status === 304) {
      if (oReq.responseText == "error") {
        response.textContent = "error: check password and username, if you have an account"
      } else {
        var json = JSON.parse(oReq.responseText);
        if (json["msg"][0][name]) {
          for (characterIn in json["msg"][0]) {
            var character = json["msg"][0][characterIn];
            imgs[characterIn] = document.createElement("img");
            imgs[characterIn].src = "img/" + characterIn + ".png";
            if (characterIn !== name)
              otherPlayers.push(new Character(characterIn, new Vector(Number(character.posX), Number(character.posY)), character.field, character.status));
          }
          player = new Player(name, new Vector(Number(json["msg"][0][name].posX), Number(json["msg"][0][name].posY)), json["msg"][0][name].field);
          sendPlayerData();
          level = new Level(levels[player.field], player.field);
          level.updateViewport(player.pos.plus(new Vector(level.viewport.width/2 - level.viewport.margin/2, level.viewport.height/2 - level.viewport.margin/2)));
          main();
          timestamp = json["timestamp"];
          document.body.removeChild(windowdiv);
          setTimeout(cometPlayerData, 10);
        }
      }
    }
  }
}
function cometPlayerData() {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "readPlayerData.php?timestamp=" + timestamp + "&" + "time=" + (new Date()).getTime());
  oReq.send(null);
  oReq.onreadystatechange = function() {
    if (oReq.readyState == 4 && oReq.status >= 200 && oReq.status < 300 || oReq.status === 304) {
      var json = JSON.parse(oReq.responseText);
      for (characterIn in json["msg"][0]) {
        var character = json["msg"][0][characterIn];
        if (characterIn !== player.name) {
          var notInside = true;
          otherPlayers.forEach(function(player) {
            if (player.name == characterIn) {
              if (player.field !== character.field) {
                player.lastPos = player.pos = new Vector(Number(character.posX), Number(character.posY));
              }
              player.move = new Vector(Number(character.posX) - player.pos.x, Number(character.posY) - player.pos.y);
              player.field = character.field;
              player.status = character.status;
              notInside = false;
            }
          });
          if (notInside) {
            imgs[characterIn] = document.createElement("img");
            imgs[characterIn].src = "img/" + characterIn + ".png";
            otherPlayers.push(new Character(characterIn, new Vector(Number(character.posX), Number(character.posY)), character.field, character.status));
          }
        }
      }
      timestamp = json["timestamp"];
      setTimeout(cometPlayerData, 10);
    } else if (oReq.readyState == 4 && (!(oReq.status >= 200) || !(oReq.status < 300) && oReq.status !== 304)) {
      setTimeout(cometPlayerData, 100);
    }
  }
}
function sendPlayerData() {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "writePlayerData.php?name=" + player.name + "&posX=" + player.lastPos.x + "&posY=" + player.lastPos.y + "&field=" + player.field + "&status=" + player.status + "&" + "timestamp=" + (new Date()).getTime() + "&password=" + encodeURIComponent(passwordi.value));
  oReq.send(null);
};

//comment
var globalDivCounter = 10;
var containter = elt({elt: "div", pos: "absolute", top: "150px", left: "550px", to: document.body});
function div(text, namei) {
  var div = containter.appendChild(document.createElement("div"));
  div.className = "div";
  div.style.position = "absolute";
  div.style.borderRadius = "10px";
  div.style.background = "rgb(217, 229, 242)";
  div.style.paddingLeft = "10px";
  div.style.paddingRight = "10px";
  div.style.width = "280px" //window.innerWidth > 900 ? window.innerWidth - 650 + "px" : "280px";
  //div.style.left = "340px";
  div.style.top = globalDivCounter + "px";
  div.style.wordWrap = "break-word";
  var p = div.appendChild(document.createElement("p"));
  p.textContent = text;
  var name = div.appendChild(document.createElement("p"));
  name.textContent = "-" + namei;
  var space = div.appendChild(document.createElement("div"));
  space.style.position = "absolute";
  space.style.height = "35px";
  globalDivCounter += div.offsetHeight + 25;
  //console.log(div.offsetHeight);
}
//document.body.overflow = "scroll";
var indiv = document.body.appendChild(document.createElement("div"));
indiv.style.position = "absolute";
indiv.style.width = "320px";
indiv.style.height = "200px";
indiv.style.top = "0px";
indiv.style.left = "550px";
//indiv.style.left = "10px"//window.innerWidth > 900 ? window.innerWidth - 330 + "px" : "900px";
var title = indiv.appendChild(document.createElement("p"));
title.textContent = "Post Comment";
var textarea = indiv.appendChild(document.createElement("input"));
textarea.style.position = "absolute";
textarea.style.resize = "none";
textarea.style.top = "60px";
textarea.addEventListener("keyup", function(event) { event.stopPropagation();});
textarea.addEventListener("keydown", function(event) { event.stopPropagation();});
var submit = indiv.appendChild(document.createElement("div"));
submit.textContent = "submit";
submit.style.position = "absolute";
submit.style.top = "100px";
submit.addEventListener("click", function () { send(textarea.value); });
function send(text) {
  var xmlhttpi;
  if (window.XMLHttpRequest) {
   xmlhttpi = new XMLHttpRequest();
   }
  else {
    xmlhttpi = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttpi.onreadystatechange = function() {
    if (xmlhttpi.readyState == 4 && xmlhttpi.status == 200) {
      
    }
  }
  xmlhttpi.open("GET", "writeDat.php?text=" + encodeURIComponent(text) + encodeURIComponent("[\\\\name\\\\]") + player.name + encodeURIComponent("\r\n") + "&time=" + (new Date()).getTime() + "&password=" + encodeURIComponent(passwordi.value) + "&name=" + encodeURIComponent(player.name));
  xmlhttpi.send();
}
var timestamp2 = null;
function requestDat() {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "readDat.php?timestamp=" + timestamp2 + "&" + "time=" + (new Date()).getTime());
  oReq.send(null);
  oReq.onreadystatechange = function() {
    if (oReq.readyState == 4 && oReq.status >= 200 && oReq.status < 300 || oReq.status === 304) {
      var json = JSON.parse(oReq.responseText);
      for (var i = containter.childNodes.length; i--; ) {
        containter.removeChild(containter.childNodes[i]);
      }
      globalDivCounter = 10;
      var txt = json["msg"];
      var divided = txt.split("\r\n");
      var greaterThan = Math.max(divided.length - 21, 0);
      for (var i = divided.length - 1; i >= greaterThan; i--) {
        divided[i] = divided[i].split("[\\\\name\\\\]");
        if (divided[i][0] !== "")
          div(divided[i][0], divided[i][1]);
      }
      timestamp2 = json["timestamp"];
      setTimeout(requestDat, 10);
    } else if (oReq.readyState == 4 && (!(oReq.status >= 200) || !(oReq.status < 300) && oReq.status !== 304)) {
      setTimeout(requestDat, 100);
    }
  }
}
requestDat();

var windowdiv = elt({elt: "div", to: document.body, back: "white", sW: window.innerWidth + "px", sH: window.innerHeight + "px", pos: "absolute", top: "0px", left: "0px"});
/*var input = elt({elt: "input", to: windowdiv, list: [{what: "change", list: function(event) {
  firstData(input.value);
}}]});*/
var h1 = elt({elt: "h3", to: windowdiv, txt: "Terrabratus"});
//h3.appendChild(document.createTextNode('Terrabratus'));
var submitBox = elt({elt: "div", to: windowdiv, pos: "absolute", left: "100px", top: "50px"});
elt({elt: "p", to: submitBox, txt: "user name"});
var userName = elt({elt: "input", to: submitBox});
elt({elt: "p", to: submitBox, txt: "password"});
var passwordi = elt({elt: "input", type: "password", to: submitBox, list: [{what: "keyup", list: passwordikey}]});
function passwordikey(event) {
  if (event.keyCode === 13)
    firstData();
}
var submit = elt({elt: "p", to: submitBox, txt: "{submit}", list: [{what: "click", list: firstData}]});
var response = elt({elt: "p", to: submitBox, txt: ""});
var link = elt({elt: "a", href: "signup", to: submitBox, txt: "Don't have an account? Sign up!"});
var unloadTrue = window.onload !== "undefined";
if (typeof window.onbeforeunload !== "undefined")
  window.onbeforeunload = end;
else
  window.onunload = end;
function end(event) {
  if (player) {
    player.status = "off";
    sendPlayerData();
  }
}
window.onblur = function() {
  if (player) {
    keyResults = {left: false, right: false, up: false, down: false, speed: false};
    if (!unloadTrue || (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)))
      player.status = "off";
    sendPlayerData();
  }
}

levels = {
  main: [
    { key: {"g": "grass", "t": "tree top", "B": "tree", "f": "flower1", "F": "flower2", "d": "blueDoor"},
      layer: ["gggggggggggggggggggggggggggggggggggggggg", 
              "FgBgggBgggggggggBgggggBBBBBBBgggggggBggg", 
              "ggggggggggggggggggggFggggggggggggggggggg", 
              "ggggggFggggggggggggggggggggggggggfgggggg", 
              "gggggffgggggggFgggggggggggggfggggggggggg", 
              "BgggggggggggggggggfggggggggggggggggggggB", 
              "gggggggggggggggggggggggggggggggggggggggg", 
              "ggggggggfgggggggFggggggggggFggggggggFggg", 
              "gggggggggggggggggggggggggggggggggggggggg", 
              "gggggggggFggggggggfgggggggggggfggggggggB", 
              "BBggggggFggggggggggggggggggggggggggggggg", 
              "gggggggggggfgggggggggggggggggggfgggggggg", 
              "gggggggggggggggggggBgggggggggggggggggggg", 
              "ggggggBggggggggggggggggggggggggggggggggg", 
              "gggggggggggggggggggggggBBBBBBBBBgggggggg"]
    },
    {
      key: {"d": "blueDoor", playerLevel: true, " ": "space"},
      layer: ["                                        ", 
              "                                        ", 
              "                                        ", 
              "                                       d", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        "]
    },
    {
      key: {"g": "grass", "t": "tree top", "B": "tree", "f": "flower1", "F": "flower2", " ": "space"},
      layer: ["  t   t         t     ttttttt       t   ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "t                                      t", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                       t", 
              "tt                                      ", 
              "                                        ", 
              "                   t                    ", 
              "      t                                 ", 
              "                       ttttttttt        ", 
              "                                        "]
    }
  ],
  forest: [
    { key: {"g": "treeEverMix", "t": "pTop", "B": "pTree", "f": "grass", "d": "door2", "m": "flower1", "F": "flower2"},
      layer: ["ggggggggggggggggggfFffgggggggggggggggggg", 
              "ggggggggggggggggggffmfgggggggggggggggggg", 
              "gggBBBBBBBBgggggBBffffgggggggggggggggggg", 
              "BBBffffffffBBBBBffFfffgggggggggggggggggg", 
              "ffmfffffffffffffffFfffgggggggggggggggggg", 
              "ffffmFffffFfffmFffffmFgggggggggggggggggg", 
              "fmFffffffmfffffffggggggggggggggggggggggg", 
              "ffffFfgggggfmmfFgggggggggggggggggggggggg", 
              "gggggggggggffmFfBBBBBBBBBBBBBBBBBBBBBBBB", 
              "gggggggggggffffffffffFfffffmmfffffffffff", 
              "gggggggggggfffmmFffffffffffffffffmmfffff", 
              "gggggggggggfffffffffffmFFfffffffffffffff", 
              "gggggggggggffffffffffffffffffffffffFFfff", 
              "gggggggggggggggggggggggggggggggggggggggg", 
              "gggggggggggggggggggggggggggggggggggggggg"]
    },
    {
      key: {"d": "door2", playerLevel: true, " ": "space"},
      layer: ["                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "d                                       ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        "]
    },
    {
      key: {"g": "treeEverMix", "t": "pTop", "B": "pTree", "f": "grass", "d": "door2", " ": "space"},
      layer: ["                                        ", 
              "   tttttttt     tt                      ", 
              "ttt        ttttt                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                tttttttttttttttttttttttt", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        ", 
              "                                        "]
    }
  ]
};
/*
var typeOf = {
  grass: {type: "grass", passable: true},
  tree: {type: "tree", passable: false},
  "tree top": {type: "tree top", passable: false},
  flower1: {type: "flower1", passable: true},
  flower2: {type: "flower2", passable: true},
  blueDoor: {type: "blueDoor", passable: true, baseType: "door", changeTo: "forest", changePos: new Vector(0, 5)},
  space: {type: "space", passable: true},
  pTop: {type: "pTop", passable: true},
  pTree: {type: "pTree", passable: false},
  treeEverMix: {type: "treeEverMix", passable: false},
  door2: {type: "blueDoor", passable: true, baseType: "door", changeTo: "forest", changePos: new Vector(0, 5)}
},
imageIndexOf = {
  grass: new Vector(0, 0),
  "tree top": new Vector(7, 0),
  flower1: new Vector(3, 0),
  flower2: new Vector(4, 0),
  tree: new Vector(2, 0),
  space: new Vector(8, 0),
  blueDoor: new Vector(9, 0),
  pTop: new Vector(10, 0),
  pTree: new Vector(11, 0),
  treeEverMix: new Vector(12, 0)
},*/