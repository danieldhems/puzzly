class jigsawPaths {
  constructor(pieceSize, connectorSize, connectorWidth){
    this.pieceSize = pieceSize;
    this.connectorSize = connectorSize;
		this.connectorWidth = connectorWidth;
  }
	getPlug(side, startPos){
		let cp1x, cp1y, cp2x, cp2y, destX, destY;
		const connectorSize = this.connectorSize;
		const halfConnectorSize = connectorSize / 2;
		if(side === "top"){
			cp1x = startPos.x - halfConnectorSize;
			cp1y = startPos.y - connectorSize;
			cp2x = startPos.x + this.connectorWidth + halfConnectorSize;
			cp2y = startPos.y - connectorSize;
			destX = startPos.x + this.connectorWidth;
			destY = startPos.y;
		} else if(side === "right"){
			cp1x = startPos.x + connectorSize;
			cp1y = startPos.y - halfConnectorSize;
			cp2x = startPos.x + connectorSize;
			cp2y = startPos.y + this.connectorWidth + halfConnectorSize;
			destX = startPos.x;
			destY = startPos.y + this.connectorWidth
		} else if(side === "bottom"){
			cp1x = startPos.x + halfConnectorSize;
			cp1y = startPos.y + connectorSize;
			cp2x = startPos.x - this.connectorWidth - halfConnectorSize;
			cp2y = startPos.y + connectorSize;
			destX = startPos.x - this.connectorWidth;
			destY = startPos.y;
		} else if(side === "left"){
			cp1x = startPos.x - connectorSize;
			cp1y = startPos.y + halfConnectorSize;
			cp2x = startPos.x - connectorSize;
			cp2y = startPos.y - this.connectorWidth - halfConnectorSize;
			destX = startPos.x;
			destY = startPos.y - this.connectorWidth
		}
		return {
			cp1: {
				x: cp1x,
				y: cp1y,
			},
			cp2: {
				x: cp2x,
				y: cp2y,
			},
			destX,
			destY,
		}
	}
	getSocket(side, startPos){
		let cp1x, cp1y, cp2x, cp2y, destX, destY;
		const connectorSize = this.connectorSize;
		const halfConnectorSize = this.connectorSize / 2;
		if(side === "top"){
			cp1x = startPos.x - halfConnectorSize;
			cp1y = startPos.y + connectorSize;
			cp2x = startPos.x + this.connectorWidth + halfConnectorSize;
			cp2y = startPos.y + connectorSize;
			destX = startPos.x + this.connectorWidth;
			destY = startPos.y;
		} else if(side === "right"){
			cp1x = startPos.x - connectorSize;
			cp1y = startPos.y - halfConnectorSize;
			cp2x = startPos.x - connectorSize;
			cp2y = startPos.y + this.connectorWidth + halfConnectorSize;
			destX = startPos.x;
			destY = startPos.y + this.connectorWidth
		} else if(side === "bottom"){
			cp1x = startPos.x + halfConnectorSize;
			cp1y = startPos.y - connectorSize;
			cp2x = startPos.x - this.connectorWidth - halfConnectorSize;
			cp2y = startPos.y - connectorSize;
			destX = startPos.x - this.connectorWidth;
			destY = startPos.y;
		} else if(side === "left"){
			cp1x = startPos.x + connectorSize;
			cp1y = startPos.y + halfConnectorSize;
			cp2x = startPos.x + connectorSize;
			cp2y = startPos.y - this.connectorWidth - halfConnectorSize;
			destX = startPos.x;
			destY = startPos.y - this.connectorWidth
		}
		return {
			cp1: {
				x: cp1x,
				y: cp1y,
			},
			cp2: {
				x: cp2x,
				y: cp2y,
			},
			destX,
			destY,
		}
	}
  getTopPlug(leftBoundary, topBoundary, rightBoundary){
		return {
			firstCurve: {
				destX: leftBoundary + this.connectorDistanceFromCorner + (this.connectorSize/6),
				destY: topBoundary - (this.connectorSize/5),
				cpX: leftBoundary + this.connectorDistanceFromCorner + (this.connectorSize/5),
				cpY: topBoundary - (this.connectorSize/10),
			},
			secondCurve: {
				cp1: {
					x: leftBoundary + this.connectorDistanceFromCorner - this.connectorDistanceFromCorner/4,
					y: topBoundary - (this.connectorSize/3),
				},
				cp2: {
					x: leftBoundary + this.connectorDistanceFromCorner - this.connectorDistanceFromCorner/4,
					y: topBoundary - this.connectorSize,
				},
				destX: leftBoundary + (this.pieceSize / 2),
				destY: topBoundary - this.connectorSize,
			},
			thirdCurve: {
				cp1: {
					x: rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					y: topBoundary - this.connectorSize,
				},
				cp2: {
					x: rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					y: topBoundary - (this.connectorSize/3),
				},
				destX: rightBoundary - this.connectorDistanceFromCorner - (this.connectorSize/6),
				destY: topBoundary - (this.connectorSize/5),
			},
			fourthCurve: {
				cpX: rightBoundary - this.connectorDistanceFromCorner - (this.connectorSize/5),
				cpY: topBoundary - (this.connectorSize/10),
				destX: rightBoundary - this.connectorDistanceFromCorner,
				destY: topBoundary,
			}
		}
	}

	getTopSocket(leftBoundary, topBoundary, rightBoundary){
		return {
			firstCurve: {
				destX: leftBoundary + this.connectorDistanceFromCorner + (this.connectorSize/6),
				destY: topBoundary + (this.connectorSize/5),
				cpX: leftBoundary + this.connectorDistanceFromCorner + (this.connectorSize/5),
				cpY: topBoundary + (this.connectorSize/10),
			},
			secondCurve: {
				cp1: {
					x: leftBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					y: topBoundary + (this.connectorSize/3),
				},
				cp2: {
					x: leftBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					y: topBoundary + this.connectorSize,
				},
				destX: leftBoundary + (this.pieceSize/2),
				destY: topBoundary + this.connectorSize,
			},
			thirdCurve: {
				cp1: {
					x: rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					y: topBoundary + this.connectorSize,
				},
				cp2: {
					x: rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					y: topBoundary + (this.connectorSize/3),
				},
				destX: rightBoundary - this.connectorDistanceFromCorner - (this.connectorSize/6),
				destY: topBoundary + (this.connectorSize/5),
			},
			fourthCurve: {
				cpX: rightBoundary - this.connectorDistanceFromCorner - (this.connectorSize/5),
				cpY: topBoundary + (this.connectorSize/10),
				destX: rightBoundary - this.connectorDistanceFromCorner,
				destY: topBoundary,
			}
		}
	}

	getRightPlug(topBoundary, rightBoundary, bottomBoundary){
		return {
			firstCurve: {
				destX: rightBoundary + (this.connectorSize/5),
				destY: topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/6),
				cpX: rightBoundary + (this.connectorSize/10),
				cpY: topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/5),
			},
			secondCurve: {
				cp1: {
					y: topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					x: rightBoundary + (this.connectorSize / 3),
				},
				cp2: {
					y: topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					x: rightBoundary + this.connectorSize,
				},
				destX: rightBoundary + this.connectorSize,
				destY: bottomBoundary - (this.pieceSize / 2),
			},
			thirdCurve: {
				cp1: {
					y: bottomBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					x: rightBoundary + this.connectorSize,
				},
				cp2: {
					y: bottomBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					x: rightBoundary + (this.connectorSize/3),
				},
				destY: bottomBoundary - this.connectorDistanceFromCorner - (this.connectorSize/6),
				destX: rightBoundary + (this.connectorSize/5),
			},
			fourthCurve: {
				cpY: bottomBoundary - this.connectorDistanceFromCorner - (this.connectorSize/5),
				cpX: rightBoundary + (this.connectorSize/10),
				destY: bottomBoundary - this.connectorDistanceFromCorner,
				destX: rightBoundary,
			}
		}
	}

	getRightSocket(topBoundary, rightBoundary, bottomBoundary){
		return {
			firstCurve: {
				destX: rightBoundary - (this.connectorSize/5),
				destY: topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/6),
				cpX: rightBoundary - (this.connectorSize/10),
				cpY: topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/5),
			},
			secondCurve: {
				cp1: {
					y: topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					x: rightBoundary - (this.connectorSize/3),
				},
				cp2: {
					y: topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					x: rightBoundary - this.connectorSize,
				},
				destX: rightBoundary - this.connectorSize,
				destY: topBoundary + (this.pieceSize/2),
			},
			thirdCurve: {
				cp1: {
					y: bottomBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					x: rightBoundary - this.connectorSize,
				},
				cp2: {
					y: bottomBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					x: rightBoundary - (this.connectorSize/3),
				},
				destY: bottomBoundary - this.connectorDistanceFromCorner - (this.connectorSize/6),
				destX: rightBoundary - (this.connectorSize/5),
			},
			fourthCurve: {
				cpY: bottomBoundary - this.connectorDistanceFromCorner - (this.connectorSize/5),
				cpX: rightBoundary - (this.connectorSize/10),
				destY: bottomBoundary - this.connectorDistanceFromCorner,
				destX: rightBoundary,
			}
		}
	}

	getBottomPlug(rightBoundary, bottomBoundary, leftBoundary){
		return {
			firstCurve: {
				destX: rightBoundary - this.connectorDistanceFromCorner - (this.connectorSize/6),
				destY: bottomBoundary + (this.connectorSize/5),
				cpX: rightBoundary - this.connectorDistanceFromCorner - (this.connectorSize/5),
				cpY: bottomBoundary + (this.connectorSize/10),
			},
			secondCurve: {
				cp1: {
					x: rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					y: bottomBoundary + (this.connectorSize/3),
				},
				cp2: {
					x: rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					y: bottomBoundary + this.connectorSize,
				},
				destX: leftBoundary + (this.pieceSize/2),
				destY: bottomBoundary + this.connectorSize,
			},
			thirdCurve: {
				cp1: {
					x: leftBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					y: bottomBoundary + this.connectorSize,
				},
				cp2: {
					x: leftBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					y: bottomBoundary + (this.connectorSize/3),
				},
				destX: leftBoundary + this.connectorDistanceFromCorner + (this.connectorSize/6),
				destY: bottomBoundary + (this.connectorSize/5),
			},
			fourthCurve: {
				cpX: leftBoundary + this.connectorDistanceFromCorner + (this.connectorSize/5),
				cpY: bottomBoundary + (this.connectorSize/10),
				destX: leftBoundary + this.connectorDistanceFromCorner,
				destY: bottomBoundary,
			}
		}
	}

	getBottomSocket(rightBoundary, bottomBoundary, leftBoundary){
		return {
			firstCurve: {
				destX: rightBoundary - this.connectorDistanceFromCorner - (this.connectorSize/6),
				destY: bottomBoundary - (this.connectorSize/5),
				cpX: rightBoundary - this.connectorDistanceFromCorner - (this.connectorSize/5),
				cpY: bottomBoundary - (this.connectorSize/10),
			},
			secondCurve: {
				cp1: {
					x: rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					y: bottomBoundary - (this.connectorSize/3),
				},
				cp2: {
					x: rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					y: bottomBoundary - this.connectorSize,
				},
				destX: rightBoundary - (this.pieceSize/2),
				destY: bottomBoundary - this.connectorSize,
			},
			thirdCurve: {
				cp1: {
					x: leftBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					y: bottomBoundary - this.connectorSize,
				},
				cp2: {
					x: leftBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					y: bottomBoundary - (this.connectorSize/3),
				},
				destX: leftBoundary + this.connectorDistanceFromCorner + (this.connectorSize/6),
				destY: bottomBoundary - (this.connectorSize/5),
			},
			fourthCurve: {
				cpX: leftBoundary + this.connectorDistanceFromCorner + (this.connectorSize/5),
				cpY: bottomBoundary - (this.connectorSize/10),
				destX: leftBoundary + this.connectorDistanceFromCorner,
				destY: bottomBoundary,
			}
		}
	}

	getLeftPlug(bottomBoundary, leftBoundary, topBoundary){
		return {
			firstCurve: {
				destX: leftBoundary - (this.connectorSize/5),
				destY: bottomBoundary - this.connectorDistanceFromCorner - (this.connectorSize/6),
				cpX: leftBoundary - (this.connectorSize/10),
				cpY: bottomBoundary - this.connectorDistanceFromCorner - (this.connectorSize/5),
			},
			secondCurve: {
				cp1: {
					y: bottomBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					x: leftBoundary - (this.connectorSize/3),
				},
				cp2: {
					y: bottomBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					x: leftBoundary - this.connectorSize,
				},
				destX: leftBoundary - this.connectorSize,
				destY: bottomBoundary - (this.pieceSize/2),
			},
			thirdCurve: {
				cp1: {
					y: topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					x: leftBoundary - this.connectorSize,
				},
				cp2: {
					y: topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					x: leftBoundary - (this.connectorSize/3),
				},
				destY: topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/6),
				destX: leftBoundary - (this.connectorSize/5),
			},
			fourthCurve: {
				cpY: topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/5),
				cpX: leftBoundary - (this.connectorSize/10),
				destY: topBoundary + this.connectorDistanceFromCorner,
				destX: leftBoundary,
			}
		}
	}

	getLeftSocket(bottomBoundary, leftBoundary, topBoundary){
		return {
			firstCurve: {
				destX: leftBoundary + (this.connectorSize/5),
				destY: bottomBoundary - this.connectorDistanceFromCorner - (this.connectorSize/6),
				cpX: leftBoundary + (this.connectorSize/10),
				cpY: bottomBoundary - this.connectorDistanceFromCorner - (this.connectorSize/5),
			},
			secondCurve: {
				cp1: {
					y: bottomBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					x: leftBoundary + (this.connectorSize/3),
				},
				cp2: {
					y: bottomBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					x: leftBoundary + this.connectorSize,
				},
				destX: leftBoundary + this.connectorSize,
				destY: bottomBoundary - (this.pieceSize/2)
			},
			thirdCurve: {
				cp1: {
					y: topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					x: leftBoundary + this.connectorSize,
				},
				cp2: {
					y: topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					x: leftBoundary + (this.connectorSize/3),
				},
				destY: topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/6),
				destX: leftBoundary + (this.connectorSize/5),
			},
			fourthCurve: {
				cpY: topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/5),
				cpX: leftBoundary + (this.connectorSize/10),
				destY: topBoundary + this.connectorDistanceFromCorner,
				destX: leftBoundary,
			}
		}
	}

	drawPlugGuides(ctx, plug){
		ctx.fillStyle = 'black';
		ctx.beginPath();
		ctx.arc(plug.firstCurve.cpX, plug.firstCurve.cpY, 2, 0, 2 * Math.PI);  // Control point one
		ctx.fill()
		
		// ctx.fillStyle = 'brown';
		ctx.beginPath();
		ctx.arc(plug.secondCurve.cp1.x, plug.secondCurve.cp1.y, 2, 0, 2 * Math.PI);  // Control point one
		ctx.fill()

		ctx.beginPath();
		ctx.arc(plug.secondCurve.cp2.x, plug.secondCurve.cp2.y, 2, 0, 2 * Math.PI);  // Control point one
		ctx.fill()
		
		// ctx.fillStyle = 'green';
		ctx.beginPath();
		ctx.arc(plug.thirdCurve.cp1.x, plug.thirdCurve.cp1.y, 2, 0, 2 * Math.PI);  // Control point one
		ctx.fill()

		ctx.beginPath();
		ctx.arc(plug.thirdCurve.cp2.x, plug.thirdCurve.cp2.y, 2, 0, 2 * Math.PI);  // Control point one
		ctx.fill()

		// ctx.fillStyle = 'purple';
		ctx.beginPath();
		ctx.arc(plug.fourthCurve.cpX, plug.fourthCurve.cpY, 2, 0, 2 * Math.PI);  // Control point one
		ctx.fill()
	}
}

exports.default = jigsawPaths;
