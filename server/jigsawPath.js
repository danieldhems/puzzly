class jigsawPaths {
  constructor(pieceSize, connectorSize, connectorDistanceFromCorner){
    this.pieceSize = pieceSize;
    this.connectorSize = connectorSize;
    this.connectorDistanceFromCorner = connectorDistanceFromCorner;
  }
  getTopPlug(leftBoundary, topBoundary, rightBoundary){
		return {
			firstCurve: {
				destX: Math.ceil(leftBoundary + this.connectorDistanceFromCorner + this.connectorSize/6),
				destY: Math.ceil(topBoundary - this.connectorSize/5),
				cpX: Math.ceil(leftBoundary + this.connectorDistanceFromCorner + this.connectorSize/5),
				cpY: Math.ceil(topBoundary - this.connectorSize/10),
			},
			secondCurve: {
				cp1: {
					x: Math.ceil(leftBoundary + this.connectorDistanceFromCorner - this.connectorDistanceFromCorner/4),
					y: Math.ceil(topBoundary - this.connectorSize/3),
				},
				cp2: {
					x: Math.ceil(leftBoundary + this.connectorDistanceFromCorner - this.connectorDistanceFromCorner/4),
					y: topBoundary - this.connectorSize + 1,
				},
				destX: Math.ceil(leftBoundary + this.pieceSize / 2),
				destY: topBoundary - this.connectorSize + 1,
			},
			thirdCurve: {
				cp1: {
					x: Math.ceil(rightBoundary - this.connectorDistanceFromCorner + this.connectorDistanceFromCorner/4),
					y: topBoundary - this.connectorSize + 1,
				},
				cp2: {
					x: Math.ceil(rightBoundary - this.connectorDistanceFromCorner + this.connectorDistanceFromCorner/4),
					y: Math.ceil(topBoundary - this.connectorSize/3),
				},
				destX: Math.ceil(rightBoundary - this.connectorDistanceFromCorner - this.connectorSize/6),
				destY: Math.ceil(topBoundary - this.connectorSize/5),
			},
			fourthCurve: {
				cpX: Math.ceil(rightBoundary - this.connectorDistanceFromCorner - this.connectorSize/5),
				cpY: Math.ceil(topBoundary - this.connectorSize/10),
				destX: rightBoundary - this.connectorDistanceFromCorner,
				destY: topBoundary,
			}
		}
	}

	getTopSocket(leftBoundary, topBoundary, rightBoundary){
		return {
			firstCurve: {
				destX: Math.ceil(leftBoundary + this.connectorDistanceFromCorner + (this.connectorSize/6)),
				destY: Math.ceil(topBoundary + (this.connectorSize/5)),
				cpX: Math.ceil(leftBoundary + this.connectorDistanceFromCorner + (this.connectorSize/5)),
				cpY: Math.ceil(topBoundary + (this.connectorSize/10)),
			},
			secondCurve: {
				cp1: {
					x: Math.ceil(leftBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4)),
					y: Math.ceil(topBoundary + (this.connectorSize/3)),
				},
				cp2: {
					x: Math.ceil(leftBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4)),
					y: topBoundary + this.connectorSize -1,
				},
				destX: Math.ceil(leftBoundary + (this.pieceSize/2)),
				destY: topBoundary + this.connectorSize -1,
			},
			thirdCurve: {
				cp1: {
					x: Math.ceil(rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4)),
					y: topBoundary + this.connectorSize -1,
				},
				cp2: {
					x: Math.ceil(rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4)),
					y: Math.ceil(topBoundary + (this.connectorSize/3)),
				},
				destX: Math.ceil(rightBoundary - this.connectorDistanceFromCorner - (this.connectorSize/6)),
				destY: Math.ceil(topBoundary + (this.connectorSize/5)),
			},
			fourthCurve: {
				cpX: Math.ceil(rightBoundary - this.connectorDistanceFromCorner - (this.connectorSize/5)),
				cpY: Math.ceil(topBoundary + (this.connectorSize/10)),
				destX: rightBoundary - this.connectorDistanceFromCorner,
				destY: topBoundary,
			}
		}
	}

	getRightPlug(topBoundary, rightBoundary, leftBoundary){
		return {
			firstCurve: {
				destX: Math.ceil(rightBoundary + (this.connectorSize/5)),
				destY: Math.ceil(topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/6)),
				cpX: Math.ceil(rightBoundary + (this.connectorSize/10)),
				cpY: Math.ceil(topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/5)),
			},
			secondCurve: {
				cp1: {
					y: Math.ceil(topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4)),
					x: Math.ceil(leftBoundary + this.pieceSize + (this.connectorSize/3)),
				},
				cp2: {
					y: Math.ceil(topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4)),
					x: leftBoundary + this.pieceSize + this.connectorSize -1,
				},
				destX: leftBoundary + this.pieceSize + this.connectorSize -1,
				destY: Math.ceil(topBoundary + this.pieceSize - (this.pieceSize/2)),
			},
			thirdCurve: {
				cp1: {
					y: Math.ceil(topBoundary + this.pieceSize - this.connectorDistanceFromCorner + this.connectorDistanceFromCorner/4),
					x: leftBoundary + this.pieceSize + this.connectorSize -1,
				},
				cp2: {
					y: Math.ceil(topBoundary + this.pieceSize - this.connectorDistanceFromCorner + this.connectorDistanceFromCorner/4),
					x: Math.ceil(leftBoundary + this.pieceSize + (this.connectorSize/3)),
				},
				destY: Math.ceil(topBoundary + this.pieceSize - this.connectorDistanceFromCorner - (this.connectorSize/6)),
				destX: Math.ceil(leftBoundary + this.pieceSize + (this.connectorSize/5)),
			},
			fourthCurve: {
				cpY: Math.ceil(topBoundary + this.pieceSize - this.connectorDistanceFromCorner - (this.connectorSize/5)),
				cpX: Math.ceil(leftBoundary + this.pieceSize + (this.connectorSize/10)),
				destY: topBoundary + this.pieceSize - this.connectorDistanceFromCorner,
				destX: leftBoundary + this.pieceSize,
			}
		}
	}

	getRightSocket(topBoundary, rightBoundary, bottomBoundary){
		return {
			firstCurve: {
				destX: Math.ceil(rightBoundary - (this.connectorSize/5)),
				destY: Math.ceil(topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/6)),
				cpX: Math.ceil(rightBoundary - (this.connectorSize/10)),
				cpY: Math.ceil(topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/5)),
			},
			secondCurve: {
				cp1: {
					y: Math.ceil(topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4)),
					x: Math.ceil(rightBoundary - (this.connectorSize/3)),
				},
				cp2: {
					y: Math.ceil(topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4)),
					x: rightBoundary - this.connectorSize,
				},
				destX: rightBoundary - this.connectorSize,
				destY: Math.ceil(topBoundary + (this.pieceSize/2)),
			},
			thirdCurve: {
				cp1: {
					y: Math.ceil(topBoundary + this.pieceSize - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4)),
					x: rightBoundary - this.connectorSize,
				},
				cp2: {
					y: Math.ceil(topBoundary + this.pieceSize - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4)),
					x: Math.ceil(rightBoundary - (this.connectorSize/3)),
				},
				destY: Math.ceil(topBoundary + this.pieceSize - this.connectorDistanceFromCorner - (this.connectorSize/6)),
				destX: Math.ceil(rightBoundary - (this.connectorSize/5)),
			},
			fourthCurve: {
				cpY: Math.ceil(topBoundary + this.pieceSize - this.connectorDistanceFromCorner - (this.connectorSize/5)),
				cpX: Math.ceil(rightBoundary - (this.connectorSize/10)),
				destY: topBoundary + this.pieceSize - this.connectorDistanceFromCorner,
				destX: rightBoundary,
			}
		}
	}

	getBottomPlug(rightBoundary, bottomBoundary, leftBoundary){
		return {
			firstCurve: {
				destX: Math.ceil(rightBoundary - this.connectorDistanceFromCorner - (this.connectorSize/6)),
				destY: bottomBoundary + (this.connectorSize/5),
				cpX: Math.ceil(rightBoundary - this.connectorDistanceFromCorner - this.connectorSize/5),
				cpY: Math.ceil(bottomBoundary + (this.connectorSize/10)),
			},
			secondCurve: {
				cp1: {
					x: Math.ceil(rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4)),
					y: Math.ceil(bottomBoundary + (this.connectorSize/3)),
				},
				cp2: {
					x: Math.ceil(rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4)),
					y: bottomBoundary + this.connectorSize -1,
				},
				destX: Math.ceil(leftBoundary + this.pieceSize - (this.pieceSize/2)),
				destY: bottomBoundary + this.connectorSize -1,
			},
			thirdCurve: {
				cp1: {
					x: Math.ceil(leftBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4)),
					y: bottomBoundary + this.connectorSize-1,
				},
				cp2: {
					x: Math.ceil(leftBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4)),
					y: Math.ceil(bottomBoundary + (this.connectorSize/3)),
				},
				destX: Math.ceil(leftBoundary + this.connectorDistanceFromCorner + (this.connectorSize/6)),
				destY: Math.ceil(bottomBoundary + (this.connectorSize/5)),
			},
			fourthCurve: {
				cpX: Math.ceil(leftBoundary + this.connectorDistanceFromCorner + (this.connectorSize/5)),
				cpY: Math.ceil(bottomBoundary + (this.connectorSize/10)),
				destX: leftBoundary + this.connectorDistanceFromCorner,
				destY: bottomBoundary,
			}
		}
	}

	getBottomSocket(rightBoundary, bottomBoundary, leftBoundary){
		return {
			firstCurve: {
				destX: Math.ceil(rightBoundary - this.connectorDistanceFromCorner - (this.connectorSize/6)),
				destY: Math.ceil(bottomBoundary - (this.connectorSize/5)),
				cpX: Math.ceil(rightBoundary - this.connectorDistanceFromCorner - (this.connectorSize/5)),
				cpY: Math.ceil(bottomBoundary - (this.connectorSize/10)),
			},
			secondCurve: {
				cp1: {
					x: Math.ceil(rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4)),
					y: Math.ceil(bottomBoundary - (this.connectorSize/3)),
				},
				cp2: {
					x: Math.ceil(rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4)),
					y: bottomBoundary - this.connectorSize +1,
				},
				destX: Math.ceil(rightBoundary - (this.pieceSize/2)),
				destY: bottomBoundary - this.connectorSize +1,
			},
			thirdCurve: {
				cp1: {
					x: Math.ceil(leftBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4)),
					y: bottomBoundary - this.connectorSize +1,
				},
				cp2: {
					x: Math.ceil(leftBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4)),
					y: Math.ceil(bottomBoundary - (this.connectorSize/3)),
				},
				destX: Math.ceil(leftBoundary + this.connectorDistanceFromCorner + (this.connectorSize/6)),
				destY: bottomBoundary - (this.connectorSize/5),
			},
			fourthCurve: {
				cpX: Math.ceil(leftBoundary + this.connectorDistanceFromCorner + (this.connectorSize/5)),
				cpY: Math.ceil(bottomBoundary - (this.connectorSize/10)),
				destX: leftBoundary + this.connectorDistanceFromCorner,
				destY: bottomBoundary,
			}
		}
	}

	getLeftPlug(bottomBoundary, leftBoundary, topBoundary){
		return {
			firstCurve: {
				destX: Math.ceil(leftBoundary - (this.connectorSize/5)),
				destY: Math.ceil(bottomBoundary - this.connectorDistanceFromCorner - (this.connectorSize/6)),
				cpX: Math.ceil(leftBoundary - (this.connectorSize/10)),
				cpY: Math.ceil(bottomBoundary - this.connectorDistanceFromCorner - (this.connectorSize/5)),
			},
			secondCurve: {
				cp1: {
					y: Math.ceil(bottomBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4)),
					x: Math.ceil(leftBoundary - (this.connectorSize/3)),
				},
				cp2: {
					y: Math.ceil(bottomBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4)),
					x: leftBoundary - this.connectorSize,
				},
				destX: leftBoundary - this.connectorSize,
				destY: Math.ceil(bottomBoundary - (this.pieceSize/2)),
			},
			thirdCurve: {
				cp1: {
					y: Math.ceil(topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4)),
					x: leftBoundary - this.connectorSize,
				},
				cp2: {
					y: Math.ceil(topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4)),
					x: Math.ceil(leftBoundary - (this.connectorSize/3)),
				},
				destY: Math.ceil(topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/6)),
				destX: Math.ceil(leftBoundary - (this.connectorSize/5)),
			},
			fourthCurve: {
				cpY: Math.ceil(topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/5)),
				cpX: Math.ceil(leftBoundary - (this.connectorSize/10)),
				destY: Math.ceil(topBoundary + this.connectorDistanceFromCorner),
				destX: leftBoundary,
			}
		}
	}

	getLeftSocket(bottomBoundary, leftBoundary, topBoundary){
		return {
			firstCurve: {
				destX: Math.ceil(leftBoundary + (this.connectorSize/5)),
				destY: Math.ceil(bottomBoundary - this.connectorDistanceFromCorner - (this.connectorSize/6)),
				cpX: Math.ceil(leftBoundary + (this.connectorSize/10)),
				cpY: Math.ceil(bottomBoundary - this.connectorDistanceFromCorner - (this.connectorSize/5)),
			},
			secondCurve: {
				cp1: {
					y: Math.ceil(bottomBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4)),
					x: Math.ceil(leftBoundary + (this.connectorSize/3)),
				},
				cp2: {
					y: Math.ceil(bottomBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4)),
					x: leftBoundary + this.connectorSize -1,
				},
				destX: leftBoundary + this.connectorSize -1,
				destY: Math.ceil(bottomBoundary - (this.pieceSize/2))
			},
			thirdCurve: {
				cp1: {
					y: Math.ceil(topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4)),
					x: leftBoundary + this.connectorSize -1,
				},
				cp2: {
					y: Math.ceil(topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4)),
					x: Math.ceil(leftBoundary + (this.connectorSize/3)),
				},
				destY: Math.ceil(topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/6)),
				destX: Math.ceil(leftBoundary + (this.connectorSize/5)),
			},
			fourthCurve: {
				cpY: Math.ceil(topBoundary + this.connectorDistanceFromCorner + (this.connectorSize/5)),
				cpX: Math.ceil(leftBoundary + (this.connectorSize/10)),
				destY: topBoundary + this.connectorDistanceFromCorner,
				destX: leftBoundary,
			}
		}
	}
}

exports.default = jigsawPaths;
