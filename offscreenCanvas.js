//var Stats = require('stats.js');
onmessage = (evt) => {
    const canvas = evt.data.canvas;
    const context = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 1;
    const numOfCircles = 500;
    let circles = [];

    class Circle {
        constructor(x, y, radius, color, velocity) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.mass = radius;
            this.color = color;
            this.velocity = velocity;
            this.left = this.x - this.radius;
            this.right = this.x + this.radius;
            this.top = this.y - this.radius;
            this.bottom = this.y + this.radius;
        }

        checkCollision(other) {
            if (getDistance(other, this) < this.radius + other.radius) {
                this.changeColor();
                other.changeColor();
                this.resolveCollision(this, other);
            }
        }

        rotate(velocity, angle) {
            const rotatedVelocities = {
                x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
                y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
            };

            return rotatedVelocities;
        }

        resolveCollision(circle, otherCircle) {
            const xVelocityDiff = circle.velocity.x - otherCircle.velocity.x;
            const yVelocityDiff = circle.velocity.y - otherCircle.velocity.y;

            const xDist = otherCircle.x - circle.x;
            const yDist = otherCircle.y - circle.y;

            // Prevent accidental overlap of circles
            if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

                // Grab angle between the two colliding circles
                const angle = -Math.atan2(otherCircle.y - circle.y, otherCircle.x - circle.x);

                // Store mass for better readability
                const m1 = circle.mass;
                const m2 = otherCircle.mass;

                // Velocity before equation
                const u1 = this.rotate(circle.velocity, angle);
                const u2 = this.rotate(otherCircle.velocity, angle);

                // Velocity after 1d collision equation
                const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
                const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

                // Final velocity after rotating axis back to original location
                const vFinal1 = this.rotate(v1, -angle);
                const vFinal2 = this.rotate(v2, -angle);

                // Swap circle velocities for elastic physics effect 
                circle.velocity.x = vFinal1.x;
                circle.velocity.y = vFinal1.y;

                otherCircle.velocity.x = vFinal2.x;
                otherCircle.velocity.y = vFinal2.y;
            }
        }

        intersects(other) {
            return getDistance(other, this) < this.radius + other.radius;
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
    
    //var stats = new Stats();
    //stats.showPanel(0);
    //document.body.appendChild(stats.dom);
    
    function initCircles() {
        for (let i = 0; i < numOfCircles; i++) {
            let randomAngle = Math.random() * (2 * Math.PI - 1) + 1;
            let randomDirection = {x: Math.cos(randomAngle), y: Math.sin(randomAngle)};

            let circle = new Circle(
                getRandomInt(canvas.width),
                getRandomInt(canvas.height),
                getRandomInt(12) + radius,
                'green',
                {x: randomDirection.x, y: randomDirection.y, magnitude: getRandomInt(6)+3}
            )
            //todo: move this logic somewhere better
            circle.mass = circle.radius;

            for (let j = 0; j < circles.length; j++) {
                if (circle.intersects(circles[j])) {
                    circle.x = getRandomInt(canvas.width);
                    circle.y = getRandomInt(canvas.height);
                    j = -1;
                }
            }
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
        sweepAndPrune.overlaps.forEach( overlap => {
            overlap[0].checkCollision(overlap[1]);
        });
        
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
            context.arc(Math.floor(circle.x), Math.floor(circle.y), circle.radius, 0, 2 * Math.PI, false);
            context.closePath();
            context.fillStyle = circle.color;
            context.fill();
        })
    }
    
    function animate() {
        requestAnimationFrame(animate);
        //stats.begin();
        sweepAndPrune.update();
        draw();
        updatePhysics();
        //stats.end();
    }
    
    let sweepAndPrune = new SweepAndPrune();
    initCircles();
    requestAnimationFrame(animate);
}
