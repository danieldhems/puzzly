class puzzlePiece {
  constructor(opts){

  }

  static plugTRBL(ctx){
    ctx.beginPath();
    ctx.moveTo(200,200);
    ctx.lineTo(275,200);
    ctx.quadraticCurveTo(250,150,300,150);
    ctx.quadraticCurveTo(350,150,325,200);
    ctx.lineTo(400,200);
    ctx.lineTo(400,275);
    ctx.quadraticCurveTo(450,250,450,300);
    ctx.quadraticCurveTo(450,350,400,325);
    ctx.lineTo(400,400);
    ctx.lineTo(325,400);
    ctx.quadraticCurveTo(350,450,300,450);
    ctx.quadraticCurveTo(250,450,275,400);
    ctx.lineTo(200,400);
    ctx.lineTo(200,325);
    ctx.quadraticCurveTo(150,350,150,300);
    ctx.quadraticCurveTo(150,250,200,275);
    ctx.lineTo(200,200);
    ctx.closePath();
    ctx.stroke();
  }

  static plugTBLsocketR(ctx){
    ctx.beginPath();
    ctx.moveTo(200,200);
    ctx.lineTo(275,200);
    ctx.quadraticCurveTo(250,150,300,150);
    ctx.quadraticCurveTo(350,150,325,200);
    ctx.lineTo(400,200);
    ctx.lineTo(400,275);
    ctx.quadraticCurveTo(350,250,350,300);
    ctx.quadraticCurveTo(350,350,400,325);
    ctx.lineTo(400,400);
    ctx.lineTo(325,400);
    ctx.quadraticCurveTo(350,450,300,450);
    ctx.quadraticCurveTo(250,450,275,400);
    ctx.lineTo(200,400);
    ctx.lineTo(200,325);
    ctx.quadraticCurveTo(150,350,150,300);
    ctx.quadraticCurveTo(150,250,200,275);
    ctx.lineTo(200,200);
    ctx.closePath();
    ctx.stroke();
  }

  static plugRBLsocketT(ctx){
    ctx.beginPath();
    ctx.moveTo(200,200);
    ctx.lineTo(275,200);
    ctx.quadraticCurveTo(250,250,300,250);
    ctx.quadraticCurveTo(350,250,325,200);
    ctx.lineTo(400,200);
    ctx.lineTo(400,275);
    ctx.quadraticCurveTo(450,250,450,300);
    ctx.quadraticCurveTo(450,350,400,325);
    ctx.lineTo(400,400);
    ctx.lineTo(325,400);
    ctx.quadraticCurveTo(350,450,300,450);
    ctx.quadraticCurveTo(250,450,275,400);
    ctx.lineTo(200,400);
    ctx.lineTo(200,325);
    ctx.quadraticCurveTo(150,350,150,300);
    ctx.quadraticCurveTo(150,250,200,275);
    ctx.lineTo(200,200);
    ctx.closePath();
    ctx.stroke();
  }

  static plugBLsocketTR(ctx){
    ctx.beginPath();
    ctx.moveTo(200,200);
    ctx.lineTo(275,200);
    ctx.quadraticCurveTo(250,250,300,250);
    ctx.quadraticCurveTo(350,250,325,200);
    ctx.lineTo(400,200);
    ctx.lineTo(400,275);
    ctx.quadraticCurveTo(350,250,350,300);
    ctx.quadraticCurveTo(350,350,400,325);
    ctx.lineTo(400,400);
    ctx.lineTo(325,400);
    ctx.quadraticCurveTo(350,450,300,450);
    ctx.quadraticCurveTo(250,450,275,400);
    ctx.lineTo(200,400);
    ctx.lineTo(200,325);
    ctx.quadraticCurveTo(150,350,150,300);
    ctx.quadraticCurveTo(150,250,200,275);
    ctx.lineTo(200,200);
    ctx.closePath();
    ctx.stroke();
  }
}

export default puzzlePiece;
