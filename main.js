let offsetX = 0;
let offsetY = 0;
let viewportSpeed = 20;

let mouseDown = false;

let world;
let viewport;
let p2p;

function setupP2P() {
	p2p = new P2PDataChannel();

	p2p.onSignalGenerated = (signal) => {
		console.log(signal);
		navigator.clipboard.writeText(signal);
		alert("Text Copied");
	};

	p2p.onDataReceived = (data) => {
		world.decodeRemoteData(data)
	};
}


function setup() {
	createCanvas(windowWidth, windowHeight);
	world = new World()
	viewport = new Viewport(0, 0);
	viewport.restrict(0, 0)
	world.attachViewport(viewport);
	for (let i=0; i<100; i++) {
		world.addUnit(new Unit(i, createVector(100, 100), createVector(100, 100), 12, 10, 0.8, 10, createVector(1, 0)));
	}
}


function draw() {
	background(0, 0, 0);

	if (keyIsDown(37)) {
		viewport.position.x -= viewportSpeed;
	}
	if (keyIsDown(38)) {
		viewport.position.y -= viewportSpeed;
	}
	if (keyIsDown(39)) {
		viewport.position.x += viewportSpeed;
	}
	if (keyIsDown(40)) {
		viewport.position.y += viewportSpeed;
	}

	world.render();

	noFill();
	stroke(255);
	strokeWeight(2);
	if (mouseDown) {
		rect(offsetX, offsetY, mouseX-offsetX, mouseY-offsetY);
	}
	if (p2p) {
		p2p.sendData(world.encodeLocalData());
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
	world.localData.units.forEach(unit => {
		unit.target = screenToWorld(createVector(mouseX, mouseY), viewport)
	});

	mouseDown = true;
	offsetX = mouseX;
	offsetY = mouseY;
}

function mouseReleased() {
	mouseDown = false;
}



window.onload = () => {
	setupP2P();

	const hash = window.location.hash;
	if (hash.startsWith("#offer=")) {
		const encodedSignal = hash.substring('#offer='.length);

		try {
			decoded = decodeURIComponent(encodedSignal)
			p2p.process(decodeURIComponent(encodedSignal))
		} catch(e) {}
	} else {
		p2p.createOffer()
	}
};














/*
let thisPosX = 0;
let thisPosY = 0;
let otherPosX = 0;
let otherPosY = 0;

function setupP2P() {
	p2p = new P2PDataChannel();

	p2p.onSignalGenerated = (signal) => {
		document.getElementById("copyText").style.display = "block";
		document.getElementById("output").textContent = signal;
	};

	p2p.onDataReceived = (data) => {
		let receivedData = JSON.parse(data);
		otherPosX = receivedData[0];
		otherPosY = receivedData[1];
	};
}


let offerButton = document.getElementById("offer")
let inputArea = document.getElementById("input")
let processButton = document.getElementById("process")


function setup() {
	createCanvas(500, 500);

	thisPosX = width / 2;
	thisPosY = height / 2;
	otherPosX = width / 2;
	otherPosY = height / 2;
}

function draw() {
	background(0);

	fill(255, 0, 0);
	noStroke();
	circle(thisPosX, thisPosY, 50);

	fill(0, 0, 255);
	noStroke();
	circle(otherPosX, otherPosY, 50);
}

function mouseMoved() {
	thisPosX = mouseX;
	thisPosY = mouseY;
	if (p2p) {
		p2p.sendData([thisPosX, thisPosY]);
	}
}

function copyText() {
	navigator.clipboard.writeText(document.getElementById("output").textContent);

	alert("Text Copied");
}

window.onload = () => {
	setupP2P();

	const hash = window.location.hash;
	if (hash.startsWith("#offer=")) {
		const encodedSignal = hash.substring('#offer='.length);

		try {
			decoded = decodeURIComponent(encodedSignal)
			document.getElementById("accept").style.display = "block";
			offerButton.style.display = "none"
			inputArea.style.display = "none"
			process.style.display = "none"
			p2p.process(decodeURIComponent(encodedSignal))
		} catch(e) {}
	}
};
*/