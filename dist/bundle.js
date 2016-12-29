/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _puzzly = __webpack_require__(1);

	var _puzzly2 = _interopRequireDefault(_puzzly);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var form = document.forms[0];
	form.addEventListener('submit', function (e) {
		e.preventDefault();
		upload(form);
	});

	function onUploadSuccess(response) {
		// Puzzly.init('canvas', response.image.path, response.numPieces);
	}

	function onUploadFailure(response) {
		console.log(response);
	}

	function upload(form) {

		var fd = new FormData(form);

		fetch('/api/new', {
			body: fd,
			method: 'POST'
		}).then(function (r) {
			return r.json();
		}).then(function (d) {
			onUploadSuccess(d);
		}).catch(function (err) {
			onUploadFailure(err);
		});
	}

	new _puzzly2.default('canvas', './hl.jpg', 1);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _spriteMap = __webpack_require__(2);

	var _spriteMap2 = _interopRequireDefault(_spriteMap);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Puzzly = function () {
		function Puzzly(canvasId, imageUrl, numPieces) {
			var _this = this;

			_classCallCheck(this, Puzzly);

			this.config = {
				pieceSize: {
					'500': 35,
					'1000': 30,
					'2000': 20
				},
				jigsawSquareSize: 123,
				jigsawPlugSize: 41,
				boardBoundary: 200,
				numPiecesOnVerticalSides: 27,
				numPiecesOnHorizontalSides: 38,
				backgroundImages: [{
					name: 'wood',
					path: './bg-wood.jpg'
				}]
			};

			this.pieces = [];

			console.log('Initiating puzzly: ', imageUrl, numPieces);

			this.canvas = document.getElementById(canvasId);
			this.tmpCanvas = document.getElementById('tmp-canvas');
			this.bgCanvas = document.getElementById('tmp-canvas');
			this.ctx = this.canvas.getContext('2d');
			this.tmpCtx = this.tmpCanvas.getContext('2d');
			this.bgCtx = this.bgCanvas.getContext('2d');

			this.SourceImage = new Image();
			this.SourceImage.src = imageUrl;

			this.BgImage = new Image();
			this.BgImage.src = this.config.backgroundImages[0].path;

			this.JigsawSprite = new Image();
			this.JigsawSprite.src = './jigsaw-sprite.png';

			this.BgImage.onload = function () {
				// this.drawBackground();
			};

			this.SourceImage.onload = function () {
				_this.canvas.width = _this.SourceImage.width + _this.config.boardBoundary * 2;
				_this.canvas.height = _this.SourceImage.height + _this.config.boardBoundary * 2;
				_this.tmpCanvas.width = window.innerWidth;
				_this.tmpCanvas.height = window.innerHeight;
				_this.bgCanvas.width = _this.canvas.width;
				_this.bgCanvas.height = _this.canvas.height;

				_this.makePieces(_this.SourceImage, 500, _this.config.pieceSize['500'], _this.config.boardBoundary);
			};

			window.addEventListener('click', this.onWindowClick);
		}

		_createClass(Puzzly, [{
			key: 'onWindowClick',
			value: function onWindowClick(e) {
				this.getClickTarget(e);
			}
		}, {
			key: 'drawImage',
			value: function drawImage(img, imgX, imgY, imgW, imgH, inBoardArea) {
				if (inBoardArea) {
					var cX = this.canvas.ObjectffsetLeft + this.config.boardBoundary;
					var cY = this.canvas.offsetTop + this.config.boardBoundary;
				}

				// this.tmpCtx.drawImage(img, imgX, imgY, imgW, imgH);
				this.ctx.drawImage(img, 0, 0, imgW, imgH);
			}
		}, {
			key: 'makePieces',
			value: function makePieces(img, numPieces, pieceSize) {

				var boardLeft = this.canvas.offsetLeft + this.config.boardBoundary;
				var boardTop = this.canvas.offsetTop + this.config.boardBoundary;

				// prepare draw options
				var curImgX = 0;
				var curImgY = 0;
				var curCanvasX = boardLeft;
				var curCanvasY = boardTop;

				var done = false;
				var i = 0;

				var adjacentPieceBehind = null;
				var adjacentPieceAbove = null;
				var endOfRow = false;

				while (!done) {

					// All pieces not on top row
					if (this.pieces.length > this.config.numPiecesOnHorizontalSides) {
						adjacentPieceAbove = this.pieces[i - this.config.numPiecesOnHorizontalSides];
					}

					// Last piece in row
					if (this.pieces.length % (this.config.numPiecesOnHorizontalSides - 1) === 0) {
						endOfRow = true;
					} else {
						endOfRow = false;
					}

					if (this.pieces.length > 0 && !endOfRow) {
						adjacentPieceBehind = this.pieces[i - 1];
					}

					// First piece on new row
					if (this.pieces.length % this.config.numPiecesOnHorizontalSides === 0) {
						adjacentPieceBehind = null;
					}

					var candidatePieces = this.getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow);
					var currentPiece = candidatePieces[Math.floor(Math.random() * candidatePieces.length)];

					this.assignInitialPieceData(curImgX, curImgY, curCanvasX, curCanvasY, currentPiece, i);
					this.drawPiece({ x: curImgX, y: curImgY }, { x: curCanvasX, y: curCanvasY }, currentPiece);

					// reached last piece, start next row
					if (this.pieces.length % this.config.numPiecesOnHorizontalSides === 0) {
						curImgX = 0;
						curImgY += pieceSize;
						curCanvasX = boardLeft;
						curCanvasY += pieceSize;
					} else {
						curImgX += pieceSize;
						curCanvasX += pieceSize;
					}

					if (this.pieces.length === this.config.numPiecesOnHorizontalSides * this.config.numPiecesOnVerticalSides) done = true;

					i++;
				}
			}

			// Draw puzzle piece

		}, {
			key: 'drawPiece',
			value: function drawPiece(sourceImgCoords, canvasCoords, piece) {
				var dims = this.getPieceDimensions(piece, this.config.pieceSize['1000']);

				this.tmpCtx.save();
				this.tmpCtx.drawImage(this.SourceImage, sourceImgCoords.x, sourceImgCoords.y, dims.w, dims.h, 0, 0, dims.w, dims.h);
				this.tmpCtx.globalCompositeOperation = 'destination-atop';
				this.tmpCtx.drawImage(this.JigsawSprite, piece.coords.x, piece.coords.y, piece.width, piece.height, 0, 0, dims.w, dims.h);
				this.ctx.drawImage(this.tmpCanvas, canvasCoords.x, canvasCoords.y);
				this.tmpCtx.restore();
			}
		}, {
			key: 'drawBackground',
			value: function drawBackground() {
				this.bgCtx.save();
				this.bgCtx.globalCompositeOperation = 'destination-over';
				this.bgCtx.drawImage(this.BgImage, 0, 0, this.BgImage.width, this.BgImage.height);
				this.ctx.drawImage(this.bgCanvas, 0, 0, this.BgImage.width, this.BgImage.height, 0, 0, this.canvas.width, this.canvas.height);
				this.bgCtx.restore();
			}
		}, {
			key: 'getCandidatePieces',
			value: function getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow) {
				var candidatePieces = [];
				console.log('adjacentPieceAbove', adjacentPieceAbove, 'adjacentPieceBehind', adjacentPieceBehind);
				if (!adjacentPieceBehind && !adjacentPieceAbove) {
					return _spriteMap2.default.filter(function (o) {
						return o.type.indexOf('corner-tl') > -1;
					});
				}

				if (!adjacentPieceAbove) {
					var pieceType = adjacentPieceBehind.type;

					console.log(pieceType);
					// Does lastPiece have a plug on its right side?
					var lastPieceHasRightPlug = adjacentPieceBehind.connectors.plugs.indexOf('r') > -1;
					// Does lastPiece have a socket on its right side?
					var lastPieceHasRightSocket = adjacentPieceBehind.connectors.sockets.indexOf('r') > -1;
					var iterateeIsCorrectType = void 0;

					var _pieces = _spriteMap2.default.filter(function (o) {
						if (endOfRow) {
							return o.type.indexOf('corner-tr') > -1;
						} else {
							return o.type.indexOf('side-t') > -1;
						}
					});
					console.log('filtered', _pieces);

					for (var i = 0, l = _pieces.length; i < l; i++) {
						var iterateeHasLeftSocket = _pieces[i].connectors.sockets.indexOf('l') > -1;
						var iterateeHasLeftPlug = _pieces[i].connectors.plugs.indexOf('l') > -1;
						if (lastPieceHasRightPlug && iterateeHasLeftSocket) {
							candidatePieces.push(_pieces[i]);
						} else if (lastPieceHasRightSocket && iterateeHasLeftPlug) {
							candidatePieces.push(_pieces[i]);
						}
					}
				} else {
					if (!adjacentPieceBehind) {

						var _pieces2 = _spriteMap2.default.filter(function (o) {
							return o.type.indexOf('side-l') > -1;
						});
						var pieceAboveHasSocket = adjacentPieceAbove.connectors.sockets.indexOf('b') > -1;
						var pieceAboveHasPlug = adjacentPieceAbove.connectors.plugs.indexOf('b') > -1;

						for (var _i = 0, _l = _pieces2.length; _i < _l; _i++) {
							var iterateeHasTopSocket = _pieces2[_i].connectors.sockets.indexOf('t') > -1;
							var iterateeHasTopPlug = _pieces2[_i].connectors.plugs.indexOf('t') > -1;
							if (pieceAboveHasSocket && iterateeHasTopPlug) {
								candidatePieces.push(_pieces2[_i]);
							} else if (pieceAboveHasPlug && iterateeHasTopSocket) {
								candidatePieces.push(_pieces2[_i]);
							}
						}
					}
				}

				return candidatePieces;
			}
		}, {
			key: 'getPieceDimensions',
			value: function getPieceDimensions(piece, pieceSize) {
				var scale = pieceSize / this.config.jigsawSquareSize;
				var dims = {
					w: null,
					h: null
				};
				if (piece.connectors.plugs.length === 1) {
					if (piece.connectors.plugs === 'l' || piece.connectors.plugs === 'r') {
						dims.w = pieceSize + this.config.jigsawPlugSize * scale;
						dims.h = pieceSize;
					}
					if (piece.connectors.plugs === 't' || piece.connectors.plugs === 'b') {
						dims.h = pieceSize + this.config.jigsawPlugSize * scale;
						dims.w = pieceSize;
					}
				} else {
					dims.w = pieceSize;
					dims.h = pieceSize;
					if (piece.connectors.plugs.indexOf('l') > -1) {
						dims.w += this.config.jigsawPlugSize * scale;
					}
					if (piece.connectors.plugs.indexOf('r') > -1) {
						dims.w += this.config.jigsawPlugSize * scale;
					}
					if (piece.connectors.plugs.indexOf('t') > -1) {
						dims.h += this.config.jigsawPlugSize * scale;
					}
					if (piece.connectors.plugs.indexOf('b') > -1) {
						dims.h += this.config.jigsawPlugSize * scale;
					}
				}
				return dims;
			}
		}, {
			key: 'assignInitialPieceData',
			value: function assignInitialPieceData(imgX, imgY, canvX, canvY, piece, i) {
				var data = Object.assign({
					id: i,
					imgX: imgX,
					imgY: imgY,
					currentX: canvX,
					currentY: canvY,
					solvedX: canvX,
					solvedY: canvY
				}, piece);
				this.pieces.push(data);
				return data;
			}
		}, {
			key: 'hasCollision',
			value: function hasCollision(source, target) {
				var pieceBoundary = {
					top: Math.round(target.currentY),
					right: Math.round(target.currentX) + config.pieceSize,
					bottom: Math.round(target.currentY) + config.pieceSize,
					left: Math.round(target.currentX)
				};
				return source.x > pieceBoundary.left && source.x < pieceBoundary.right && source.y < pieceBoundary.bottom && source.y > pieceBoundary.top;
			}
		}, {
			key: 'getCellByCoords',
			value: function getCellByCoords(coords) {
				for (var i = pieces.length - 1; i > -1; i--) {
					var piece = pieces[i];
					if (hasCollision(coords, piece)) {
						return piece;
					}
				}
				return null;
			}
		}, {
			key: 'getClickTarget',
			value: function getClickTarget(e) {
				var coords = {
					x: e.clientX,
					y: e.clientY
				};
				console.log(getCellByCoords(coords));
			}
		}]);

		return Puzzly;
	}();

	exports.default = Puzzly;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = [{
		width: 124,
		height: 161,
		type: 'corner-tl-srb',
		connectors: {
			sockets: 'r',
			plugs: 'b'
		},
		coords: {
			x: 41,
			y: 0
		}
	}, {
		width: 121,
		height: 163,
		type: 'corner-tl-sr-pb',
		connectors: {
			sockets: 'r',
			plugs: 'b'
		},
		coords: {
			x: 286,
			y: 0
		}
	}, {
		width: 163,
		height: 121,
		type: 'corner-tl-sb-pr',
		connectors: {
			sockets: 'b',
			plugs: 'r'
		},
		coords: {
			x: 531,
			y: 0
		}
	}, {
		width: 163,
		height: 163,
		type: 'corner-tl-prb',
		connectors: {
			sockets: '',
			plugs: 'rb'
		},
		coords: {
			x: 776,
			y: 0
		}
	}, {
		width: 121,
		height: 121,
		type: 'corner-bl-str',
		connectors: {
			sockets: 'tr',
			plugs: ''
		},
		coords: {
			x: 1022,
			y: 0
		}
	}, {
		width: 121,
		height: 121,
		type: 'side-l-strb',
		connectors: {
			sockets: 'trb',
			plugs: ''
		},
		coords: {
			x: 1267,
			y: 0
		}
	}, {
		width: 121,
		height: 163,
		type: 'side-l-str-pb',
		connectors: {
			sockets: 'tr',
			plugs: 'b'
		},
		coords: {
			x: 1512,
			y: 0
		}
	}, {
		width: 163,
		height: 121,
		type: 'corner-bl-st-pr',
		connectors: {
			sockets: 't',
			plugs: 'r'
		},
		coords: {
			x: 1757,
			y: 0
		}
	}, {
		width: 121,
		height: 121,
		type: 'side-l-strb',
		connectors: {
			sockets: 'tr',
			plugs: ''
		},
		coords: {
			x: 537,
			y: 0
		}
	}, {
		width: 121,
		height: 121,
		type: 'side-t-srbl',
		connectors: {
			sockets: 'rbl',
			plugs: ''
		},
		coords: {
			x: 529,
			y: 489
		}
	}, {
		width: 121,
		height: 163,
		type: 'side-t-srl-pb',
		connectors: {
			sockets: 'rl',
			plugs: 'b'
		},
		coords: {
			x: 532,
			y: 491
		}
	}, {
		width: 163,
		height: 121,
		type: 'side-t-srb-pl',
		connectors: {
			sockets: 'rb',
			plugs: 'l'
		},
		coords: {
			x: 490,
			y: 1227
		}
	}, {
		width: 163,
		height: 163,
		type: 'side-t-sr-pbl',
		connectors: {
			sockets: 'r',
			plugs: 'bl'
		},
		coords: {
			x: 735,
			y: 1227
		}
	}, {
		width: 206,
		height: 121,
		type: 'side-t-sb-prl',
		connectors: {
			sockets: 'b',
			plugs: 'rl'
		},
		coords: {
			x: 980,
			y: 1227
		}
	}, {
		width: 206,
		height: 163,
		type: 'side-t-prbl',
		connectors: {
			sockets: '',
			plugs: 'rbl'
		},
		coords: {
			x: 1225,
			y: 1227
		}
	}, {
		width: 163,
		height: 121,
		type: 'corner-tr-sb-pl',
		connectors: {
			sockets: 'b',
			plugs: 'l'
		},
		coords: {
			x: 0,
			y: 1227
		}
	}, {
		width: 163,
		height: 163,
		type: 'corner-tr-pbl',
		connectors: {
			sockets: '',
			plugs: 'bl'
		},
		coords: {
			x: 241,
			y: 1227
		}
	}, {
		width: 121,
		height: 121,
		type: 'corner-tr-sbl',
		connectors: {
			sockets: 'bl',
			plugs: ''
		},
		coords: {
			x: 41,
			y: 490
		}
	}, {
		width: 165,
		height: 121,
		type: 'side-l-stb-pr',
		connectors: {
			sockets: 'tb',
			plugs: 'r'
		},
		coords: {
			x: 40,
			y: 245
		}
	}, {
		width: 163,
		height: 164,
		type: 'side-l-st-prb',
		connectors: {
			sockets: 't',
			plugs: 'rb'
		},
		coords: {
			x: 287,
			y: 246
		}
	}, {
		width: 163,
		height: 20,
		type: 'side-l-ptrb',
		connectors: {
			plugs: 'trb',
			sockets: ''
		},
		coords: {
			x: 1757,
			y: 204
		}
	}, {
		width: 206,
		height: 206,
		type: 'middle-ptrbl',
		connectors: {
			plugs: 'trbl',
			sockets: ''
		},
		coords: {
			x: 1714,
			y: 1673
		}
	}];

/***/ }
/******/ ]);