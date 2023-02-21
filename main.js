var Stats = require('stats.js');
const canvas = document.getElementById('main-canvas');
const context = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 10;
let circles = [];

class Circle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.left = this.x - this.radius;
        this.right = this.x + this.radius;
        this.top = this.y - this.radius;
        this.bottom = this.y + this.radius;
    }

    checkCollision(other) {
        if (getDistance(other, this) < this.radius * 2) {
            this.changeColor();
            other.changeColor();
        }
    }

    update() {
        this.left = this.x - this.radius;
        this.right = this.x + this.radius;
        this.top = this.y - this.radius;
        this.bottom = this.y + this.radius;
    }

    changeColor() {
        this.color = 'red'
    }
}

class SweepAndPrune {
    constructor() {
        this.circles = [];
        this.sortedCircles = [];
        this.overlaps = new Set();
    }

    addCircle(circle) {
        this.circles.push(circle);
        this.sortedCircles = this.circles.sort((a, b) => a.left - b.left);
    }
}

var stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

function initCircles() {
    /*let circle1 = new Circle(100, 100, radius, 'blue', {x: 1, y: 1, magnitude: 1});
    let circle2 = new Circle(500, 500, radius, 'green', {x: -1, y: -1, magnitude: 1});

    circles.push(circle1, circle2);*/
    for (let i = 0; i < 100; i++) {
        let circle = new Circle(
            getRandomInt(canvas.width),
            getRandomInt(canvas.height),
            radius,
            'green',
            {x: 1, y: 1, magnitude: 1}
        )
        circles.push(circle);
    }
}

function updatePhysics() {
    circles.forEach( (circle, i) => {
        let x = circle.x;
        let y = circle.y;
        let vx = circle.velocity.x;
        let vy = circle.velocity.y;
        let r = circle.radius;

        if (i === 0) {
            circle.checkCollision(circles[1]);
        }

        if (x + vx > canvas.width - r || x + vx < r) {
            circle.velocity.x *= -1;
        }

        if (y + vy > canvas.height - r || y + vy < r) {
            circle.velocity.y *= -1;
        }
        circle.x += circle.velocity.x * circle.velocity.magnitude;
        circle.y += circle.velocity.y * circle.velocity.magnitude;
        circle.update();
    });
}

function getDistance(obj1, obj2) {
    let xDistance = obj2.x - obj1.x;
    let yDistance = obj2.y - obj1.y;

    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    circles.forEach( circle => {
        context.beginPath();
        context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
        context.closePath();
        context.fillStyle = circle.color;
        context.fill();
    })
}

function animate() {
    requestAnimationFrame(animate);
    stats.begin();
    updatePhysics();
    draw();
    stats.end();
}

initCircles();
animate();
