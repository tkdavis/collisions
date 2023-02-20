const canvas = document.getElementById('main-canvas');
const context = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 10;
let circles = [];

initCircles();

function initCircles() {
    let circle1 = {
        x: 100,
        y: 100,
        radius: radius,
        color: "green",
        velocity: {x: 1, y: 1, magnitude: 1}
    }
    
    let circle2 = {
        x: 500,
        y: 500,
        radius: radius,
        color: "green",
        velocity: {x: 1, y: -1, magnitude: 1}
    }

    circles.push(circle1, circle2);
}

function updatePhysics() {
    circles.forEach( circle => {
        circle.x += circle.velocity.x * circle.velocity.magnitude;
        circle.y += circle.velocity.y * circle.velocity.magnitude;
    });
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

animate();
