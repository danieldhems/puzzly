class JigsawPath {
  constructor(pieceSize, connectorSize) {
    this.pieceSize = pieceSize;
    this.connectorSize = connectorSize;
    this.humpSize = parseInt((this.connectorSize * 1.2).toFixed());
    this.halfConnectorSize = parseInt((this.connectorSize / 2).toFixed());

    // console.log("connectorSize", this.connectorSize);
    // console.log("humpSize", this.humpSize);
    // console.log("halfConnectorSize", this.halfConnectorSize);

    this.getPlug = this.getPlug.bind(this);
    this.getSocket = this.getSocket.bind(this);
    this.rotate = this.rotate.bind(this);
    this.getRotatedConnector = this.getRotatedConnector.bind(this);
  }

  getPlug() {
    // Assume 'top' is the default plug,
    // and all others are taken from the rotation of this one
    return {
      cp1: {
        x: 0 - this.halfConnectorSize,
        y: 0 - this.humpSize,
      },
      cp2: {
        x: this.connectorSize + this.halfConnectorSize,
        y: 0 - this.humpSize,
      },
      dest: {
        x: this.connectorSize,
        y: 0,
      },
    };
  }

  getSocket() {
    // Assume 'top' is the default socket,
    // and all others are taken from the rotation of this one
    return {
      cp1: {
        x: 0 - this.halfConnectorSize,
        y: this.humpSize,
      },
      cp2: {
        x: this.connectorSize + this.halfConnectorSize,
        y: this.humpSize,
      },
      dest: {
        x: this.connectorSize,
        y: 0,
      },
    };
  }

  rotate(point, deg) {
    const rad = (deg * Math.PI) / 180;

    const origin = { x: 0, y: 0 };
    const { x: px, y: py } = point;

    const qx =
      origin.x +
      Math.cos(rad) * (px - origin.x) -
      Math.sin(rad) * (py - origin.y);
    const qy =
      origin.y +
      Math.sin(rad) * (px - origin.x) +
      Math.cos(rad) * (py - origin.y);

    return {
      x: qx,
      y: qy,
    };
  }

  getRotatedConnector(connector, deg) {
    const rotatedCp1 = this.rotate(connector.cp1, deg);
    const rotatedCp2 = this.rotate(connector.cp2, deg);
    const rotatedDest = this.rotate(connector.dest, deg);
    return {
      cp1: rotatedCp1,
      cp2: rotatedCp2,
      dest: rotatedDest,
    };
  }

  drawPlugGuides(ctx, plug) {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(plug.firstCurve.cpX, plug.firstCurve.cpY, 2, 0, 2 * Math.PI); // Control point one
    ctx.fill();

    // ctx.fillStyle = 'brown';
    ctx.beginPath();
    ctx.arc(plug.secondCurve.cp1.x, plug.secondCurve.cp1.y, 2, 0, 2 * Math.PI); // Control point one
    ctx.fill();

    ctx.beginPath();
    ctx.arc(plug.secondCurve.cp2.x, plug.secondCurve.cp2.y, 2, 0, 2 * Math.PI); // Control point one
    ctx.fill();

    // ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(plug.thirdCurve.cp1.x, plug.thirdCurve.cp1.y, 2, 0, 2 * Math.PI); // Control point one
    ctx.fill();

    ctx.beginPath();
    ctx.arc(plug.thirdCurve.cp2.x, plug.thirdCurve.cp2.y, 2, 0, 2 * Math.PI); // Control point one
    ctx.fill();

    // ctx.fillStyle = 'purple';
    ctx.beginPath();
    ctx.arc(plug.fourthCurve.cpX, plug.fourthCurve.cpY, 2, 0, 2 * Math.PI); // Control point one
    ctx.fill();
  }
}

export default JigsawPath;
