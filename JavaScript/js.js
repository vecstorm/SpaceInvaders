var navePlayer1, navePlayer2;
var projectiles = [];
var vidasJ1 = 5; // Vidas del jugador 1
var vidasJ2 = 5; // Vidas del jugador 2
var enemigosEliminadosJ1 = 0; // Contador de enemigos eliminados por el jugador 1
var enemigosEliminadosJ2 = 0; // Contador de enemigos eliminados por el jugador 2

// Variables para el movimiento de los cuadrados
var squareX = 0; // Posición X inicial de los cuadrados
var squareCount = 11; // Número de cuadrados en la fila
var squareRows = 5; // Número de filas de cuadrados
var squareSize = 30; // Tamaño de cada cuadrado
var squareSpeed = 4; // Velocidad de movimiento de los cuadrados
var padding = 20; // Espacio entre los cuadrados
var squareDirection = 1; // Dirección de movimiento (1 = derecha, -1 = izquierda)

function startGame() {
    myGameArea.start();
    navePlayer1 = new component(30, 30, "pink", 1000, 750);
    navePlayer2 = new component(30, 30, "green", 600, 750);
    
    dibujarCuadrados(); // Llamar a la función para dibujar los cuadrados
}

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

            // Disparar cuando se presiona la tecla correspondiente
            if (e.keyCode === 32) { // Espacio para nave 1
                disparar(navePlayer1.x + navePlayer1.width / 2, navePlayer1.y, "pink");
            }
            if (e.keyCode === 96) { // 0 del numpad para nave 2
                disparar(navePlayer2.x + navePlayer2.width / 2, navePlayer2.y, "green");
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

        // Limitar los bordes
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > myGameArea.canvas.width) this.x = myGameArea.canvas.width - this.width;
    }
}

function dibujarCuadrados() {
    var context = myGameArea.context;
    var startY = 50; // Posición Y de los cuadrados

    for (var i = 0; i < squareCount; i++) { // Dibujar los cuadrados en la fila
        for (var j = 0; j < squareRows; j++) { // Dibujar los cuadrados en las filas
            context.fillStyle = "blue"; // Color de los cuadrados
            context.fillRect(squareX + i * (squareSize + padding), startY + j * (squareSize + padding), squareSize, squareSize);
        }
    }
}

function moverCuadrados() {
    // Mover todos los cuadrados en la dirección actual
    squareX += squareSpeed * squareDirection;

    // Calcular el ancho total del grupo de cuadrados
    var totalWidth = squareCount * (squareSize + padding) - padding; // Ajustar el total para el padding

    // Cambiar dirección si se sale del canvas
    if (squareX < 0 || squareX + totalWidth > myGameArea.canvas.width) {
        squareDirection *= -1; // Cambiar la dirección
    }
}

function Projectile(x, y, color) {
    this.width = 5;
    this.height = 10;
    this.x = x - this.width / 2; // Centrar el disparo
    this.y = y;
    this.speedY = -10; // Dirección hacia arriba
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

function disparar(x, y, color) {
    projectiles.push(new Projectile(x, y, color));
}

function updateGameArea() {
    myGameArea.clear();
    moverCuadrados(); // Mover los cuadrados
    dibujarCuadrados(); // Redibujar los cuadrados en cada actualización

    // Movimiento nave 1 (A y D)
    navePlayer1.speedX = 0;
    if (myGameArea.keys && myGameArea.keys[65]) { navePlayer1.speedX = -7; } // A
    if (myGameArea.keys && myGameArea.keys[68]) { navePlayer1.speedX = 7; }  // D
    navePlayer1.newPos();
    navePlayer1.update();

    // Movimiento nave 2 (Flechas Izquierda y Derecha)
    navePlayer2.speedX = 0;
    if (myGameArea.keys && myGameArea.keys[37]) { navePlayer2.speedX = -7; } // Flecha Izquierda
    if (myGameArea.keys && myGameArea.keys[39]) { navePlayer2.speedX = 7; }  // Flecha Derecha
    navePlayer2.newPos();
    navePlayer2.update();

    // Actualizar proyectiles
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].newPos();
        projectiles[i].update();
    }

    // Eliminar proyectiles fuera del canvas
    projectiles = projectiles.filter(p => p.y > 0);

    // Mostrar vidas
    mostrarVidas();
    
    // Verificar condiciones de victoria
    verificarVictoria();
}

function mostrarVidas() {
    var context = myGameArea.context;
    context.fillStyle = "white";
    context.font = "20px Arial";
    context.fillText("Jugador 1 Vidas: " + vidasJ1, 10, 20);
    context.fillText("Jugador 2 Vidas: " + vidasJ2, 10, 50);
}

function verificarVictoria() {
    if (vidasJ1 <= 0) {
        alert("¡Jugador 2 gana!");
        clearInterval(myGameArea.interval);
    }
    if (vidasJ2 <= 0) {
        alert("¡Jugador 1 gana!");
        clearInterval(myGameArea.interval);
    }
}

// Aquí puedes agregar la lógica para reducir las vidas de los jugadores
// cuando sean golpeados por un enemigo o un proyectil enemigo.