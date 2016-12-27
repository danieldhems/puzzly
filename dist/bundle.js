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
				numPiecesOnHorizontalSides: 38
			};

			this.pieces = [];

			console.log('Initiating puzzly: ', imageUrl, numPieces);

			this.canvas = document.getElementById(canvasId);
			this.tmpCanvas = document.getElementById('tmp-canvas');
			this.ctx = this.canvas.getContext('2d');
			this.tmpCtx = this.tmpCanvas.getContext('2d');

			this.SourceImage = new Image();
			this.SourceImage.src = imageUrl;

			this.JigsawSprite = new Image();
			this.JigsawSprite.src = './jigsaw-sprite.png';

			this.SourceImage.onload = function () {
				_this.canvas.width = _this.SourceImage.width + _this.config.boardBoundary * 2;
				_this.canvas.height = _this.SourceImage.height + _this.config.boardBoundary * 2;
				_this.tmpCanvasWidth = _this.canvas.width;
				_this.tmpCanvasHeight = _this.canvas.height;

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
			value: function drawImage(canvas, ctx, img, boardBoundary) {
				var cX = canvas.offsetLeft + boardBoundary;
				var cY = canvas.offsetTop + boardBoundary;

				ctx.drawImage(img, 0, 0, img.width, img.height, cX, cY, img.width, img.height);
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
					// this.ctx.strokeStyle = '#000';
					// this.ctx.strokeRect(curCanvasX, curCanvasY, pieceSize, pieceSize);

					if (this.pieces.length > 0) {
						adjacentPieceBehind = this.pieces[i - 1];
					}
					if (this.pieces.length > this.config.numPiecesOnHorizontalSides) {
						adjacentPieceAbove = this.pieces[i - this.config.numPiecesOnHorizontalSides];
					}

					// console.log(this.pieces);
					console.log('adjacents', adjacentPieceBehind, adjacentPieceAbove);
					var candidatePieces = this.getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow);
					console.log(candidatePieces);

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
			key: 'getCandidatePieces',
			value: function getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow) {
				var candidatePieces = [];
				// let plugs = lastPiece.connectors.plugs;
				// let sockets = lastPiece.connectors.sockets;
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

					for (var i = 0, l = _spriteMap2.default.length; i < l; i++) {
						var iterateeIsTopSide = _spriteMap2.default[i].type.indexOf('side-t') > -1;
						var iterateeHasLeftSocket = _spriteMap2.default[i].connectors.sockets.indexOf('l') > -1;
						var iterateeHasLeftPlug = _spriteMap2.default[i].connectors.plugs.indexOf('l') > -1;
						if (iterateeIsTopSide && lastPieceHasRightPlug && iterateeHasLeftSocket) {
							candidatePieces.push(_spriteMap2.default[i]);
						} else if (iterateeIsTopSide && lastPieceHasRightSocket && iterateeHasLeftPlug) {
							candidatePieces.push(_spriteMap2.default[i]);
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
			x: 40,
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
			x: 532,
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
			x: 279,
			y: 0
		}
	}, {
		width: 121,
		height: 121,
		type: 'corner-bl-str',
		connectors: {
			sockets: '',
			plugs: 'rb'
		},
		coords: {
			x: 408,
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