var Stats = require('stats.js');
const canvas = document.getElementById('main-canvas');
const context = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 1;
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

    intersects(other) {
        return getDistance(other, this) < this.radius * 2;
    }

    update() {
        this.left = this.x - this.radius;
        this.right = this.x + this.radius;
        this.top = this.y - this.radius;
        this.bottom = this.y + this.radius;
    }

    changeColor(color='blue') {
        this.color = color;
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

    sortCircles() {
        this.sortedCircles = this.circles.sort((a, b) => a.left - b.left);
    }

    update() {
        this.overlaps.clear();
        for (let i = 0; i < this.sortedCircles.length; i++) {
            const circle1 = this.sortedCircles[i];
            for (let j = i + 1; j < this.sortedCircles.length; j++) {
                const circle2 = this.sortedCircles[j];
                if (circle1.right < circle2.left) {
                    break;
                }
                if (circle1.intersects(circle2)) {
                    this.overlaps.add([circle1, circle2]);
                    circle1.changeColor('yellow');
                    circle2.changeColor('yellow');
                    setTimeout( () => {circle1.changeColor()}, 100);
                    setTimeout( () => {circle2.changeColor()}, 100);
                }
            }
        }
    }
}

var stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

function initCircles() {
    /*let circle1 = new Circle(100, 100, radius, 'blue', {x: 1, y: 1, magnitude: 1});
    let circle2 = new Circle(500, 500, radius, 'green', {x: -1, y: -1, magnitude: 1});

    circles.push(circle1, circle2);*/

    for (let i = 0; i < 1300; i++) {
        let randomAngle = Math.random() * (2 * Math.PI - 1) + 1;
        let randomDirection = {x: Math.cos(randomAngle), y: Math.sin(randomAngle)};
 
        let circle = new Circle(
            getRandomInt(canvas.width),
            getRandomInt(canvas.height),
            radius,
            'green',
            {x: randomDirection.x, y: randomDirection.y, magnitude: 1}
        )
        circles.push(circle);
        sweepAndPrune.addCircle(circle);
    }
    
    // Reroll Overlaps
    sweepAndPrune.update();
    sweepAndPrune.overlaps.forEach(overlapSet => {
        overlapSet[0].x = getRandomInt(canvas.width);
        overlapSet[0].y = getRandomInt(canvas.height);
    });
}

function updatePhysics() {
    /*testing*/
    //console.table(sweepAndPrune.overlaps);
    sweepAndPrune.overlaps.forEach( overlap => {
        overlap.forEach( circle => {
            circle.velocity.x *= -1;
            circle.velocity.y *= -1;
        });
    });
    
    /* naive approach example n^2 */
    /*circles.forEach((circle1, i ) => {
        circles.forEach((circle2, j) => {
            if (i !== j && circle1.intersects(circle2)) {
                circle1.velocity.x *= -1;
                circle1.velocity.y *= -1;
            }
        })
    })*/

    circles.forEach( (circle, i) => {
        let x = circle.x;
        let y = circle.y;
        let vx = circle.velocity.x;
        let vy = circle.velocity.y;
        let r = circle.radius;

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

    // this could be done more optimally.
    sweepAndPrune.sortCircles();
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
    sweepAndPrune.update();
    updatePhysics();
    draw();
    stats.end();
}

let sweepAndPrune = new SweepAndPrune();
initCircles();
animate();
