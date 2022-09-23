class jigsawPaths {
  constructor(pieceSize, connectorSize, connectorDistanceFromCorner){
    this.pieceSize = pieceSize;
    this.connectorSize = connectorSize;
    this.connectorDistanceFromCorner = connectorDistanceFromCorner;
  }
  getTopPlug(leftBoundary, topBoundary, rightBoundary){
		return {
			firstCurve: {
				destX: leftBoundary + this.connectorDistanceFromCorner + this.connectorSize/6,
				destY: topBoundary - this.connectorSize/5,
				cpX: leftBoundary + this.connectorDistanceFromCorner + this.connectorSize/5,
				cpY: topBoundary - this.connectorSize/10,
			},
			secondCurve: {
				cp1: {
					x: leftBoundary + this.connectorDistanceFromCorner - this.connectorDistanceFromCorner/4,
					y: topBoundary - this.connectorSize/3,
				},
				cp2: {
					x: leftBoundary + this.connectorDistanceFromCorner - this.connectorDistanceFromCorner/4,
					y: topBoundary - this.connectorSize + 1,
				},
				destX: leftBoundary + this.pieceSize / 2,
				destY: topBoundary - this.connectorSize + 1,
			},
			thirdCurve: {
				cp1: {
					x: rightBoundary - this.connectorDistanceFromCorner + this.connectorDistanceFromCorner/4,
					y: topBoundary - this.connectorSize + 1,
				},
				cp2: {
					x: rightBoundary - this.connectorDistanceFromCorner + this.connectorDistanceFromCorner/4,
					y: topBoundary - this.connectorSize/3,
				},
				destX: rightBoundary - this.connectorDistanceFromCorner - this.connectorSize/6,
				destY: topBoundary - this.connectorSize/5,
			},
			fourthCurve: {
				cpX: rightBoundary - this.connectorDistanceFromCorner - this.connectorSize/5,
				cpY: topBoundary - this.connectorSize/10,
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
					y: topBoundary + this.connectorSize -1,
				},
				destX: leftBoundary + (this.pieceSize/2),
				destY: topBoundary + this.connectorSize -1,
			},
			thirdCurve: {
				cp1: {
					x: rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					y: topBoundary + this.connectorSize -1,
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
					x: rightBoundary + (this.connectorSize/3),
				},
				cp2: {
					y: topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					x: rightBoundary + this.connectorSize - 2,
				},
				destX: rightBoundary + this.connectorSize - 2,
				destY: bottomBoundary - (this.pieceSize/2),
			},
			thirdCurve: {
				cp1: {
					y: bottomBoundary - this.connectorDistanceFromCorner + this.connectorDistanceFromCorner/4,
					x: rightBoundary + this.connectorSize - 2,
				},
				cp2: {
					y: bottomBoundary - this.connectorDistanceFromCorner + this.connectorDistanceFromCorner/4,
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
				cpX: rightBoundary - this.connectorDistanceFromCorner - this.connectorSize/5,
				cpY: bottomBoundary + (this.connectorSize/10),
			},
			secondCurve: {
				cp1: {
					x: rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					y: bottomBoundary + (this.connectorSize/3),
				},
				cp2: {
					x: rightBoundary - this.connectorDistanceFromCorner + (this.connectorDistanceFromCorner/4),
					y: bottomBoundary + this.connectorSize -1,
				},
				destX: leftBoundary + this.pieceSize - (this.pieceSize/2),
				destY: bottomBoundary + this.connectorSize -1,
			},
			thirdCurve: {
				cp1: {
					x: leftBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					y: bottomBoundary + this.connectorSize-1,
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
					y: bottomBoundary - this.connectorSize +1,
				},
				destX: rightBoundary - (this.pieceSize/2),
				destY: bottomBoundary - this.connectorSize +1,
			},
			thirdCurve: {
				cp1: {
					x: leftBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					y: bottomBoundary - this.connectorSize +1,
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
					x: leftBoundary - this.connectorSize + 1,
				},
				destX: leftBoundary - this.connectorSize + 1,
				destY: bottomBoundary - (this.pieceSize/2),
			},
			thirdCurve: {
				cp1: {
					y: topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					x: leftBoundary - this.connectorSize + 1,
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
					x: leftBoundary + this.connectorSize -1,
				},
				destX: leftBoundary + this.connectorSize -1,
				destY: bottomBoundary - (this.pieceSize/2)
			},
			thirdCurve: {
				cp1: {
					y: topBoundary + this.connectorDistanceFromCorner - (this.connectorDistanceFromCorner/4),
					x: leftBoundary + this.connectorSize -1,
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
}

exports.default = jigsawPaths;
