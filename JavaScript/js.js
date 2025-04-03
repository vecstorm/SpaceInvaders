var navePlayer1, navePlayer2;
var projectiles = [];

function startGame() {
    myGameArea.start();
    
}
// Creacion del canvas
var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = 1600;
        this.canvas.height = 870;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);
        }
    }

function updateGameArea() {
    myGameArea.clear();
    
}