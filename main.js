class P2PDataChannel {
	constructor() {
		this.device = null;
		this.dataChannel = null;
		this.iceList = [];
		this.isInitiator = null;

		this.onSignalGenerated = (signal) => {};
		this.onDataReceived = (data) => {};
	}

	initialize() {
		if (this.device && this.device.connectionState !== "closed") {
			this.device.close();
		}

		this.device = new RTCPeerConnection({iceServers: [{urls: "stun:stun.l.google.com:19302"}]});
		this.iceList = [];

		this.device.onicecandidate = ({ candidate }) => {
			if (candidate != null) {
				this.iceList.push(candidate);
			} else {
				let input = JSON.stringify({
					sdp: this.device.localDescription,
					iceList: this.iceList
				}, null, 2);

				if (this.isInitiator) {
					input = document.URL + "#offer=" + input;
				}
				
				this.onSignalGenerated(input);
			}
		};

		this.device.ondatachannel = (event) => {
			this.setupDataChannelListeners(event.channel);
		};
	}

	setupDataChannelListeners(dc) {
		this.dataChannel = dc;
		this.dataChannel.onmessage = (event) => this.onDataReceived(event.data);
	}

	async createOffer() {
		this.isInitiator = true;
		this.initialize(true);

		let dc = this.device.createDataChannel("p5-data-channel");
		this.setupDataChannelListeners(dc);

		let offer = await this.device.createOffer();
		await this.device.setLocalDescription(offer);
	}

	async process(text) {
		let input = JSON.parse(text);
		let otherSDP = input.sdp;
		let remoteCandidates = input.iceCandidates || [];
		
		if (!this.device) {
			this.isInitiator = false;
			this.initialize();
		}
		
		await this.device.setRemoteDescription(new RTCSessionDescription(otherSDP));

		remoteCandidates.forEach(candidate => {
			this.device.addIceCandidate(new RTCIceCandidate(candidate))
				.catch(e => console.error(`Error adding remote ICE candidate: ${e}`));
		});

		if (otherSDP.type === "offer") {
			let answer = await this.device.createAnswer();
			await this.device.setLocalDescription(answer);
		}
	}

	sendData(data) {
		if (this.dataChannel && this.dataChannel.readyState === "open") {
			this.dataChannel.send(JSON.stringify(data));
			return true;
		}
		return false;
	}
}










let p2p; 

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