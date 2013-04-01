var soKOban = {};
  
soKOban.Tile = function(tileState) {
  var self = this;
  
  var states = {
    " ": ["empty", ""],
    "☺": ["empty", "man"],
    "○": ["empty", "box"],
    "█": ["wall", ""],
    "■": ["placeholder", ""],
    "◙": ["placeholder", "box"],
    "☻": ["placeholder", "man"]
  };
  
  var initialState = states[tileState];
  
  self.type = ko.observable(initialState[0]);
  self.contents = ko.observable(initialState[1]);
  
  self.canManMoveHere = function(){
    return self.type() !== "wall";
  };
  self.canBoxMoveHere = function(){
    return self.type() !== "wall" && 
      self.contents() === "";
  };
  self.containsMisplacedBox = function(){
    return self.contents() == "box" && self.type() !== "placeholder";
  };
};

soKOban.Board = function() {
  
  var self = this;
  
  self.boardRows = ko.observableArray([]);

  self.loadLevel = function(levelText) {  

    self.boardRows.removeAll();
    
    var rows = levelText.split('\n');
  
    for(var i = 0; i < rows.length; i++) {
    
      var currentRow = ko.observableArray([]);
    
      var tileValues = rows[i].split('');
      for(var j = 0; j < tileValues.length; j++) {    
        var tile = new soKOban.Tile(tileValues[j]);
          
        if(tile.contents() === "man") {
          self.manCoords = { x: j, y: i };
        }
      
        currentRow().push(tile);
      }
    
      self.boardRows.push(currentRow);
    }
  };
  
  self.misplacedBoxesCount = ko.computed(function () {
    var misplacedCount = 0;
    
    for(var i = 0; i < self.boardRows().length; i++) {
      var row = self.boardRows()[i]();
      
      for(var j = 0; j < row.length; j++) {
        var tile = row[j];
        
        if(tile.containsMisplacedBox()){
          misplacedCount++;
        }
      }
    }
    
    return misplacedCount;    
  });
   
  self.levelSolved = ko.computed(function(){
    return self.misplacedBoxesCount() === 0;
  });
  
  self.getTileAt = function (coords){
    return self.boardRows()[coords.y]()[coords.x];
  };
  
  self.moveLeft = function(){ self.move('left'); };
  self.moveRight = function(){ self.move('right'); };
  self.moveDown = function(){ self.move('down'); };
  self.moveUp = function(){ self.move('up'); };
  
  self.move = function(direction) {
    
    console.log(direction);
    
    if(self.levelSolved())
      return;
    
    var moveToCoords = self.adjacentTile(self.manCoords, direction);
    
    var moveToTile = self.getTileAt(moveToCoords);
    var currentTile = self.getTileAt(self.manCoords);
    
    if(!moveToTile.canManMoveHere()){
      console.log("cannot move man!");
      return;
    }
    
    if(moveToTile.contents() === "box" && 
       !self.tryMoveBox(moveToCoords, direction)){
      console.log("cannot move box!");
      return;
    }
    
    currentTile.contents("");
    moveToTile.contents("man");
        
    self.manCoords = moveToCoords;
  };
  
  self.tryMoveBox = function(moveFromCoords, direction) {
    var moveToCoords = self.adjacentTile(moveFromCoords, direction);
    
    var moveToTile = self.getTileAt(moveToCoords);
    
    if(!moveToTile.canBoxMoveHere())
      return false;
    
    moveToTile.contents("box");
    
    return true;
  };
  
  self.adjacentTile = function(referenceCoords, direction) {
    var xOffset = (direction === "right") - (direction === "left");
    var yOffset = (direction === "down") - (direction === "up");
        
    return {
      x: referenceCoords.x + xOffset,
      y: referenceCoords.y + yOffset
    };
  };
};

keys = {
  up: [38, 75, 87],
  down: [40, 74, 83],
  left: [37, 65, 72],
  right: [39, 68, 76]
};

Object.prototype.getKey = function(value){
  for(var key in this){
    if(this[key] instanceof Array && this[key].indexOf(value) >= 0){
      return key;
    }
  }
  return null;
};

addEventListener("keydown", function (e) {
    direction = keys.getKey(e.keyCode);
  
    if (['up', 'down', 'left', 'right'].indexOf(direction) >= 0) {
      model.move(direction) ;
    }
}, false);


var levels = [
    "███████ \n" + 
    "█ ☺   ██\n" + 
    "███ ○██ \n" + 
    "  █  █  \n" + 
    "  █ ○██ \n" + 
    " ██   ██\n" + 
    " █■  ◙■█\n" + 
    " ███████\n",
  
  "    █████          \n" +                                                        
  "    █   █          \n" +                                                     
  "    █○  █          \n" +                                                     
  "  ███  ○██         \n" +                                       
  "  █  ○ ○ █         \n" +                                                     
  "███ █ ██ █   ██████\n" +                                                     
  "█   █ ██ █████  ■■█\n" +                                                     
  "█ ○  ○          ■■█\n" +                                                     
  "█████ ███ █☺██  ■■█\n" +                                                          
  "    █     █████████\n" +                                                             
  "    ███████        \n",

    " █████   \n" +                                                               
    " █   ████\n" +                                                              
    " █   █  █\n" +                                                            
    " ██    ■█\n" +                                                            
    "███ ███■█\n" +                                                               
    "█ ○ █ █■█\n" +                                                             
    "█ ○○█ ███\n" +                                                              
    "█☺  █    \n" +                                                           
    "█████    \n",
  
    "  █████\n" +          
    "  █   █\n" +       
    "███ ○ █\n" +         
    "█    ██\n" +       
    "█■■☻◙█ \n" +       
    "█ ○  ██\n" +        
    "███ ○ █\n" +       
    "  █   █\n" +      
    "  █████\n"
];

function playLevel(levelNumber){
  var levelText = levels[levelNumber];
  model.loadLevel(levelText);  
}

var model = new soKOban.Board();
ko.applyBindings(model); 


playLevel(0);