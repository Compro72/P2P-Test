class Viewport {
	constructor(positionX, positionY) {
		this.position = createVector(0, 0);
		this.minX = null;
		this.minY = null;
		this.maxX = null;
		this.maxY = null;
	}

	restrict(minX, minY, maxX, maxY) {
		this.minX = minX;
		this.minY = minY;
		this.maxX = maxX;
		this.maxY = maxY;
	}

	screenToWorld(screenX, screenY) {
		return //TODO
	}

	update() {
		if (this.minX!=null) {
			this.position.x = max(this.position.x, this.minX);
		}
		if (this.minY!=null) {
			this.position.y = max(this.position.y, this.minY);
		}
		if (this.maxX!=null) {
			this.position.x = min(this.position.x, this.maxX);
		}
		if (this.maxY!=null) {
			this.position.y = min(this.position.y, this.maxY);
		}
	}
}