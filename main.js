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
    }

    checkCollision(other) {
        if (getDistance(other, this) < this.radius * 2) {
            this.changeColor();
            other.changeColor();
        }
    }

    changeColor() {
        this.color = 'red'
    }
}

function initCircles() {
    let circle1 = new Circle(100, 100, radius, 'green', {x: 1, y: 1, magnitude: 1});
    let circle2 = new Circle(500, 500, radius, 'green', {x: -1, y: -1, magnitude: 1});

    circles.push(circle1, circle2);
}

function updatePhysics() {
    circles.forEach( (circle, i) => {
        if (i === 0) {
            circle.checkCollision(circles[1]);
        }
        circle.x += circle.velocity.x * circle.velocity.magnitude;
        circle.y += circle.velocity.y * circle.velocity.magnitude;
    });
}

function getDistance(obj1, obj2) {
    let xDistance = obj2.x - obj1.x;
    let yDistance = obj2.y - obj1.y;

    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
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
    updatePhysics();
    draw();
}

initCircles();
animate();
