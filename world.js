class World {
	constructor() {
		this.mainViewport = null;
		this.totalDispVector = createVector(0, 0);

		this.localData = {
			units: []
		}

		this.remoteData = {
			units: []
		}
	}

	addUnit(unit) {
		this.localData.units.push(unit)
	}

	attachViewport(viewport) {
		this.mainViewport = viewport;
	}
	
	decodeRemoteData(data) {
		let parsed = JSON.parse(data)
		this.remoteData.units = [];
		parsed.forEach(unitData => {
			this.remoteData.units.push(new RemoteUnit(unitData))
		});
	}
	
	encodeLocalData() {
		let data = [];
		this.localData.units.forEach(unit => {
			data.push(unit.getEncodedData())
		});
		return data
	}

	render() {
		this.mainViewport.update();
		
		let tempDispVector = createVector(0, 0)
		let allUnits = [...this.localData.units, ...this.remoteData.units]
		this.localData.units.forEach(unit => {
			unit.update(allUnits, this.totalDispVector)
			unit.render(this.mainViewport)
			tempDispVector.add(unit.vectorToTarget)
		});
		this.remoteData.units.forEach(unit => {
			unit.render(this.mainViewport)
		});
		
		tempDispVector = tempDispVector.div(this.localData.units.length);
		this.totalDispVector = tempDispVector.copy()
	}
}