function goFullscreen() {
	// if (document.body.requestFullscreen) document.body.requestFullscreen();
}

function screenToWorld(screen, viewport) {
	return createVector(viewport.position.x+screen.x, viewport.position.y+screen.y)
}