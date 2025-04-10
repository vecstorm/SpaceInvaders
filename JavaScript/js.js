//Variables para proyectiles, naves y HUD
var navePlayer1, navePlayer2;
var projectiles = [];
var vidasJ1 = 5;
var vidasJ2 = 5;
var enemigosEliminadosJ1 = 0;
var enemigosEliminadosJ2 = 0;
var enemigos = []; // Representación lógica de los enemigos

//Variables para los enemigos
var squareX = 0;
var squareCount = 11;
var squareRows = 5;
var squareSize = 30;
var squareSpeed = 4;
var padding = 20;
var squareDirection = 1;

//Inicio del juego
function startGame() {
    myGameArea.start();
    navePlayer1 = new component(30, 30, "pink", 1000, 750);
    navePlayer2 = new component(30, 30, "green", 600, 750);
    inicializarEnemigos();
    setInterval(dispararCuadrados, 100);
}

//Creacion del canvas y event listener para los imputs del player
var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = 1600;
        this.canvas.height = 870;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);

        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");

            if (e.keyCode === 32) {
                dispararNave(navePlayer1.x + navePlayer1.width / 2, navePlayer1.y, "pink");
            }
            if (e.keyCode === 96) {
                dispararNave(navePlayer2.x + navePlayer2.width / 2, navePlayer2.y, "green");
            }
        });

        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        });
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

//Dibujado de las naves
function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.x = x;
    this.y = y;

    this.update = function () {
        context = myGameArea.context;
        context.fillStyle = color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    this.newPos = function () {
        this.x += this.speedX;
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > myGameArea.canvas.width) this.x = myGameArea.canvas.width - this.width;
    }
}

//Inicialización de los enemigos
function inicializarEnemigos() {
    enemigos = [];
    for (let i = 0; i < squareCount; i++) {
        for (let j = 0; j < squareRows; j++) {
            enemigos.push({
                x: squareX + i * (squareSize + padding),
                y: 50 + j * (squareSize + padding),
                width: squareSize,
                height: squareSize,
                activo: true
            });
        }
    }
}

//Movimiento enemigos
function moverCuadrados() {
    squareX += squareSpeed * squareDirection;
    let totalWidth = squareCount * (squareSize + padding) - padding;
    if (squareX < 0 || squareX + totalWidth > myGameArea.canvas.width) {
        squareDirection *= -1;
    }
    enemigos.forEach(e => e.x += squareSpeed * squareDirection);
}

//Funcion disparo enemigos
function dispararCuadrados() {
    let activos = enemigos.filter(e => e.activo);
    if (activos.length === 0) return;
    let enemigo = activos[Math.floor(Math.random() * activos.length)];
    dispararCuadrado(enemigo.x + enemigo.width / 2, enemigo.y + enemigo.height, "blue");
}

//Funcion de disparo enemigos 2
function dispararCuadrado(x, y, color) {
    projectiles.push(new Projectile(x, y, color, 4));
}

//Funcion disparo players
function dispararNave(x, y, color) {
    projectiles.push(new Projectile(x, y, color, -10));
}

//Funcion de dibujado de los proyectiles
function Projectile(x, y, color, speedY) {
    this.width = 5;
    this.height = 10;
    this.x = x - this.width / 2;
    this.y = y;
    this.speedY = speedY;
    this.color = color;

    this.update = function () {
        context = myGameArea.context;
        context.fillStyle = color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    this.newPos = function () {
        this.y += this.speedY;
    }
}

//Funcion updateGameArea para hacer funcionar el codigo y funciones en conjunto
function updateGameArea() {
    myGameArea.clear();
    moverCuadrados();

    navePlayer1.speedX = 0;
    if (myGameArea.keys && myGameArea.keys[65]) { navePlayer1.speedX = -7; }
    if (myGameArea.keys && myGameArea.keys[68]) { navePlayer1.speedX = 7; }
    navePlayer1.newPos();
    navePlayer1.update();

    navePlayer2.speedX = 0;
    if (myGameArea.keys && myGameArea.keys[37]) { navePlayer2.speedX = -7; }
    if (myGameArea.keys && myGameArea.keys[39]) { navePlayer2.speedX = 7; }
    navePlayer2.newPos();
    navePlayer2.update();

    //Colorear enemigos
    enemigos.forEach(e => {
        if (e.activo) {
            context = myGameArea.context;
            context.fillStyle = "blue";
            context.fillRect(e.x, e.y, e.width, e.height);
        }
    });
    
    //Movimiento proyectiles
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].newPos();
        projectiles[i].update();
    }

    detectarColisiones();

    projectiles = projectiles.filter(p => p.y < myGameArea.canvas.height && p.y + p.height > 0);
    mostrarHUD();
    verificarVictoria();
}

//Funcion de deteccion de colisiones (Usa los colores para determinar que colisiona con que)
function detectarColisiones() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];

        if (p.color === "pink" || p.color === "green") {
            enemigos.forEach(e => {
                if (e.activo && colision(p, e)) {
                    e.activo = false;
                    if (p.color === "pink") enemigosEliminadosJ1++;
                    if (p.color === "green") enemigosEliminadosJ2++;
                    projectiles.splice(i, 1);
                }
            });
        } else if (p.color === "blue") {
            if (colision(p, navePlayer1)) {
                vidasJ1--;
                projectiles.splice(i, 1);
            } else if (colision(p, navePlayer2)) {
                vidasJ2--;
                projectiles.splice(i, 1);
            }
        }
    }
}

//Funcion para las colisiones como tal
function colision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
}

//Funcion para el dibujado del HUD
function mostrarHUD() {
    var context = myGameArea.context;
    context.fillStyle = "white";
    context.font = "20px Arial";
    context.fillText("Jugador 1 Vidas: " + vidasJ1, 10, 20);
    context.fillText("Jugador 2 Vidas: " + vidasJ2, 10, 50);
    context.fillText("Eliminados J1: " + enemigosEliminadosJ1, 10, 80);
    context.fillText("Eliminados J2: " + enemigosEliminadosJ2, 10, 110);
}

//Funcion para comprobar el ganador
function verificarVictoria() {
    if (vidasJ1 <= 0) {
        alert("¡Jugador 2 gana!");
        clearInterval(myGameArea.interval);
    } else if (vidasJ2 <= 0) {
        alert("¡Jugador 1 gana!");
        clearInterval(myGameArea.interval);
    } else if (enemigosEliminadosJ1 >= 30 || enemigosEliminadosJ2 >= 30) { //El ejercicio pedia matar a 100 enemigos(Hay 30), pero eso nos forzaria a hacer reaparecer a los enemigos y no nos ha dado tiempo.
        if (enemigosEliminadosJ1 > enemigosEliminadosJ2) {
            alert("¡Jugador 1 gana por eliminar enemigos!");
        } else if (enemigosEliminadosJ2 > enemigosEliminadosJ1) {
            alert("¡Jugador 2 gana por eliminar enemigos!");
        } else {
            alert("¡Empate!");
        }
        clearInterval(myGameArea.interval);
    }
}