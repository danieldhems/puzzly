class puzzlePiece {
  constructor(ctx, opts = {
    debug: false,

  }){
    console.log(opts);
    this.debug = opts.debug;
    this.ctx = ctx;
  }

  /**
  * Fn getCurveArgs()
  * Calculates args for quadraticCurveTo() method
  * Will be executed each time quadraticCurveTo() is called i.e. several times when drawing each piece
  *
  * @param {String} connectorType - 'plug' or 'socket'
  * @param {String} compassPoint - 'n', 'e', 's', 'w' (which side of the piece is this for?)
  * @param {Object} startPosition - {x,y} Current drawing coordinate
  * @return {Array} [controlPointX, controlPointY, endPointX, endPointY]
  */
  getCurveArgs(connectorType, compassPoint, startPosition){


  }

  plugTRBL(startAt){
    this.ctx.beginPath();
    this.ctx.moveTo(200,200);
    this.ctx.lineTo(275,200);
    // top plug geometry
    // values are relative to current x,y position
    // first curve
    // control point is {x: -25, y: -50}
    // end point is {x: +25, y: -50}
    this.ctx.quadraticCurveTo(250,150,300,150);
    // second curve
    // control point is {x: +75, y: -50}
    // end point is {x: +50, y: ==}
    this.ctx.quadraticCurveTo(350,150,325,200);
    if(this.debug){
      this.ctx.fillRect(250,150,5,5);
      this.ctx.fillRect(350,150,5,5);
    }
    this.ctx.lineTo(400,200);
    this.ctx.lineTo(400,275);
    // right plug geometry
    // values are relative to current x,y position
    // control point is {x: +50, y: -25}
    // end point is {x: +50, y: +25}
    this.ctx.quadraticCurveTo(450,250,450,300);
    // second curve
    // control point is {x: +50, y: +25}
    // end point is {x: ==, y: +50}
    this.ctx.quadraticCurveTo(450,350,400,325);
    if(this.debug){
      this.ctx.fillRect(450,250,5,5);
      this.ctx.fillRect(450,350,5,5);
    }
    this.ctx.lineTo(400,400);
    this.ctx.lineTo(325,400);
    // bottom plug geometry
    // first curve
    // control point is {x: +25, y: +50}
    // end point is {x: -25, y: +50}
    this.ctx.quadraticCurveTo(350,450,300,450);
    // second curve
    // control point is {x: -75, y: +50}
    // end point is {x: -50, y: ==}
    this.ctx.quadraticCurveTo(250,450,275,400);
    if(this.debug){
      this.ctx.fillRect(350,450,5,5);
      this.ctx.fillRect(250,450,5,5);
    }
    this.ctx.lineTo(200,400);
    this.ctx.lineTo(200,325);
    // left plug geometry
    // first curve
    // control point is {x: -50, y: -25}
    // end point is {x: -50, y: -25}
    this.ctx.quadraticCurveTo(150,350,150,300);
    // second curve
    // control point is {x: -50, y: -75}
    // end point is {x: ==, y: -50}
    this.ctx.quadraticCurveTo(150,250,200,275);
    if(this.debug){
      this.ctx.fillRect(150,350,5,5);
      this.ctx.fillRect(150,250,5,5);
    }
    this.ctx.lineTo(200,200);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  plugTBsocketRL(){
    this.ctx.beginPath();
    this.ctx.moveTo(200,200);
    this.ctx.lineTo(275,200);
    this.ctx.quadraticCurveTo(250,150,300,150);
    this.ctx.quadraticCurveTo(350,150,325,200);
    if(this.debug){
      this.ctx.fillRect(250,150,5,5)
      this.ctx.fillRect(350,150,5,5)
    }
    this.ctx.lineTo(400,200);
    this.ctx.lineTo(400,275);
    this.ctx.quadraticCurveTo(350,250,350,300);
    this.ctx.quadraticCurveTo(350,350,400,325);
    if(this.debug){
      this.ctx.fillRect(350,250,5,5)
      this.ctx.fillRect(350,350,5,5)
    }
    this.ctx.lineTo(400,400);
    this.ctx.lineTo(325,400);
    this.ctx.quadraticCurveTo(350,450,300,450);
    this.ctx.quadraticCurveTo(250,450,275,400);
    if(this.debug){
      this.ctx.fillRect(350,450,5,5)
      this.ctx.fillRect(250,450,5,5)
    }
    this.ctx.lineTo(200,400);
    this.ctx.lineTo(200,325);
    this.ctx.quadraticCurveTo(150,350,150,300);
    this.ctx.quadraticCurveTo(150,250,200,275);
    if(this.debug){
      this.ctx.fillRect(150,350,5,5)
      this.ctx.fillRect(150,250,5,5)
    }
    this.ctx.lineTo(200,200);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  plugRBLsocketT(){
    this.ctx.beginPath();
    this.ctx.moveTo(200,200);
    this.ctx.lineTo(275,200);
    this.ctx.quadraticCurveTo(250,250,300,250);
    this.ctx.quadraticCurveTo(350,250,325,200);
    this.ctx.lineTo(400,200);
    this.ctx.lineTo(400,275);
    this.ctx.quadraticCurveTo(450,250,450,300);
    this.ctx.quadraticCurveTo(450,350,400,325);
    this.ctx.lineTo(400,400);
    this.ctx.lineTo(325,400);
    this.ctx.quadraticCurveTo(350,450,300,450);
    this.ctx.quadraticCurveTo(250,450,275,400);
    this.ctx.lineTo(200,400);
    this.ctx.lineTo(200,325);
    this.ctx.quadraticCurveTo(150,350,150,300);
    this.ctx.quadraticCurveTo(150,250,200,275);
    this.ctx.lineTo(200,200);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  plugBLsocketTR(){
    this.ctx.beginPath();
    this.ctx.moveTo(200,200);
    this.ctx.lineTo(275,200);
    this.ctx.quadraticCurveTo(250,250,300,250);
    this.ctx.quadraticCurveTo(350,250,325,200);
    this.ctx.lineTo(400,200);
    this.ctx.lineTo(400,275);
    this.ctx.quadraticCurveTo(350,250,350,300);
    this.ctx.quadraticCurveTo(350,350,400,325);
    this.ctx.lineTo(400,400);
    this.ctx.lineTo(325,400);
    this.ctx.quadraticCurveTo(350,450,300,450);
    this.ctx.quadraticCurveTo(250,450,275,400);
    this.ctx.lineTo(200,400);
    this.ctx.lineTo(200,325);
    this.ctx.quadraticCurveTo(150,350,150,300);
    this.ctx.quadraticCurveTo(150,250,200,275);
    this.ctx.lineTo(200,200);
    this.ctx.closePath();
    this.ctx.stroke();
  }
}

export default puzzlePiece;
