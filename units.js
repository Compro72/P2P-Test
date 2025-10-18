class Unit {
    constructor(id, target, position, collisionRadius, maxSpeed, maxTargetForce, maxAvoidForce, displayDir) {
        this.id = id;
        this.target = target;
        this.position = position;
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.collisionRadius = collisionRadius;
        this.maxSpeed = maxSpeed;
        this.maxTargetForce = maxTargetForce;
        this.maxAvoidForce = maxAvoidForce;
	    this.stoppingRadius = 1000;
	    this.unitSpacing = 4*collisionRadius;
        this.displayDir = displayDir
        this.vectorToTarget = null;
        
        
        colorMode(HSL, 100)
        this.colour = color(random(0, 100), 100, 50);
        colorMode(RGB, 255)
    }

    getEncodedData() {
        return [[this.position.x, this.position.y], this.collisionRadius, [this.displayDir.x, this.displayDir.y], [red(this.colour), green(this.colour), blue(this.colour)]];
    }

    getTargetForce(allUnits, avgDispVector) {
        this.vectorToTarget = p5.Vector.sub(this.target, this.position);
        let desired = this.vectorToTarget.copy();
        let distance = desired.mag();

        if (distance < 1) {
            this.velocity.mult(0);
            return createVector(0, 0);
        }

        let speed = this.maxSpeed;

        if (distance < this.stoppingRadius / 2) {
            speed = map(distance, 0, this.stoppingRadius / 2, 0, this.maxSpeed);
        }

        if (avgDispVector !== null) {
			let avgDistMag = avgDispVector.mag();
			
			let dampeningRadius = 2*(sqrt((allUnits.length-1)/3)*(2*this.collisionRadius+this.unitSpacing/3));
			
			if (avgDistMag < dampeningRadius) {
				let dampeningMultiplier = map(avgDistMag, 0, dampeningRadius, 0.1, 1);
				speed *= dampeningMultiplier;
			}
		}

        desired.setMag(speed)
        let targetForce = p5.Vector.sub(desired, this.velocity);
        targetForce.limit(this.maxGoalForce);

        return targetForce;
    }

    getAvoidForce(allUnits) {
        let force = createVector(0, 0);

        for (let other of allUnits) {
            if (other.id === this.id) continue;

            let vectorToOther = p5.Vector.sub(other.position, this.position);
            let dist = vectorToOther.mag();
            let minSeparation = this.collisionRadius + other.collisionRadius;
            let avoidanceDist = minSeparation + this.unitSpacing;

            if (dist > 0 && dist < avoidanceDist) {
                let direction = vectorToOther.copy().normalize();
                let repulsionMagnitude;
                
                if (dist < minSeparation) {
                    repulsionMagnitude = this.maxAvoidForce * 100; 
                } else {
                    let ratio = (avoidanceDist - dist) / (avoidanceDist - minSeparation);
                    repulsionMagnitude = ratio * ratio * this.maxAvoidForce;
                }
                
                let repulsion = direction.mult(-repulsionMagnitude);
                force.add(repulsion);
            }
        }
	
        return force.limit(this.maxAvoidForce);
    }

    update(allUnits, avgDispVector) {
        let targetForce = this.getTargetForce(allUnits, avgDispVector);
        let avoidForce = this.getAvoidForce(allUnits);

        let totalForce = p5.Vector.add(targetForce, avoidForce);
        
        this.acceleration.add(totalForce);

        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }

    render(viewport) {
        strokeWeight(this.collisionRadius*2);
        stroke(this.colour)
        point(this.position.x-viewport.position.x, this.position.y-viewport.position.y);

        let temp = createVector(this.velocity.x, this.velocity.y)
        if (temp.mag()>0.5) {
            this.displayDir = createVector(this.velocity.x, this.velocity.y)
        }
        strokeWeight(1);
        stroke(255)
        line(this.position.x-viewport.position.x, this.position.y-viewport.position.y, this.position.x-viewport.position.x+this.displayDir.normalize().mult(this.collisionRadius).x, this.position.y-viewport.position.y+this.displayDir.normalize().mult(this.collisionRadius).y)
    }
}

class RemoteUnit {
    constructor(data) {
        this.id = null;
        this.position = createVector(...data[0]);
        this.collisionRadius = data[1];
        this.displayDir = createVector(...data[2]);
        this.colour = color(...data[3]);
    }

    render(viewport) {
        strokeWeight(this.collisionRadius*2);
        stroke(this.colour)
        point(this.position.x-viewport.position.x, this.position.y-viewport.position.y);

        strokeWeight(1);
        stroke(255)
        line(this.position.x-viewport.position.x, this.position.y-viewport.position.y, this.position.x-viewport.position.x+this.displayDir.normalize().mult(this.collisionRadius).x, this.position.y-viewport.position.y+this.displayDir.normalize().mult(this.collisionRadius).y)
    }
}