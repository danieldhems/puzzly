class Bridge {
  constructor(puzzly) {
    this.bridge = document.querySelector("#pockets-bridge");
    this.stage = document.querySelector("#stage");
    this.movingElement = null;
    this.elementClone = null;
    this.zoomLevel = puzzly.zoomLevel;

    this.setZoomLevel(this.zoomLevel);
    this.setupBridge(this.stage);
  }

  setZoomLevel(zoomLevel) {
    this.zoomLevel = zoomLevel;
  }

  setupBridge(stage) {
    const stageBoundingBox = stage.getBoundingClientRect();
    this.bridge.style.width = stageBoundingBox.width + "px";
    this.bridge.style.height = stageBoundingBox.height + "px";
    this.bridge.style.top = stageBoundingBox.top + "px";
    this.bridge.style.left = stageBoundingBox.left + "px";
    this.bridge.style.transform = `scale(${this.zoomLevel})`;
  }

  makeClone(element) {
    // console.log("making clone")
    this.elementClone = element.cloneNode(true);
    this.elementClone.style.pointerEvents = "none";
    this.elementClone.style.transform = `scale(${this.zoomLevel})`;
    this.setClonePosition();
    this.bridge.style.zIndex = 2;
    return this.elementClone;
  }

  add(element) {
    console.log("adding to bridge", element);
    this.movingElement = element;
    this.bridge.appendChild(this.makeClone(element));

    const bridgeBox = this.bridge.getBoundingClientRect();
    const elementBox = element.getBoundingClientRect();

    element.style.top = bridgeBox.top + elementBox.top * this.zoomLevel + "px";
    element.style.left =
      bridgeBox.left + elementBox.left * this.zoomLevel + "px";

    this.bridge.style.zIndex = 2;
  }

  setClonePosition() {
    this.elementClone.style.top = parseInt(this.movingElement.style.top) + "px";
    this.elementClone.style.left =
      parseInt(this.movingElement.style.left) + "px";
  }

  setCloneContainerPosition() {
    this.bridge.style.top = parseInt(this.mainCanvas.style.top) + "px";
    this.bridge.style.left = parseInt(this.mainCanvas.style.left) + "px";
  }

  removeClone() {
    this.elementClone.remove();
    this.elementClone = null;
    this.bridge.style.zIndex = 1;
  }

  clearbridge() {
    Array.from(this.bridge?.childNodes).forEach((el) => el.remove());
  }
}

export default Bridge;
