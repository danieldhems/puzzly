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
					'500': Math.sqrt(500),
					'1000': 30,
					'2000': 20
				},
				jigsawSquareSize: 123,
				jigsawPlugSize: 41,
				boardBoundary: 200,
				numPieces: 1000
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
				// drawImage(canvas, this.ctx, img, config.boardBoundary);

				var jigsawPiece1 = _spriteMap2.default['side-l-st-prb'];
				var jigsawPiece2 = _spriteMap2.default['corner-tl-sr-pb'];
				var jigsawPiece3 = _spriteMap2.default['side-l-ptrb'];
				var jigsawPiece4 = _spriteMap2.default['side-m-ptrbl'];

				_this.ctx.strokeRect(0, 0, _this.canvas.width, _this.canvas.height);

				_this.drawPiece(_this.SourceImage, { x: 50, y: 50 }, _this.JigsawSprite, jigsawPiece1, _this.config.pieceSize['500'], { x: 50, y: 100 });
				_this.drawPiece(_this.SourceImage, { x: 50, y: 24 }, _this.JigsawSprite, jigsawPiece2, _this.config.pieceSize['500'], { x: 500, y: 550 });
				_this.drawPiece(_this.SourceImage, { x: 200, y: 24 }, _this.JigsawSprite, jigsawPiece3, _this.config.pieceSize['500'], { x: 20, y: 350 });
				_this.drawPiece(_this.SourceImage, { x: 250, y: 24 }, _this.JigsawSprite, jigsawPiece4, _this.config.pieceSize['500'], { x: 20, y: 250 });

				_this.makePieces(_this.canvas, _this.SourceImage, 500, _this.config.pieceSize['500'], _this.config.boardBoundary);
			};

			window.addEventListener('click', this.onWindowClick);
		}

		// Draw puzzle piece


		_createClass(Puzzly, [{
			key: 'drawPiece',
			value: function drawPiece(sourceImg, sourceImgCoords, jigsawSprite, piece, pieceSize, canvasCoords) {

				var dims = this.getPieceDimensions(piece, pieceSize);

				this.tmpCtx.save();
				this.tmpCtx.drawImage(sourceImg, sourceImgCoords.x, sourceImgCoords.y, dims.w, dims.h, 0, 0, dims.w, dims.h);
				this.tmpCtx.globalCompositeOperation = 'destination-atop';
				this.tmpCtx.drawImage(jigsawSprite, piece.coords.x, piece.coords.y, piece.width, piece.height, 0, 0, dims.w, dims.h);
				this.ctx.drawImage(this.tmpCanvas, canvasCoords.x, canvasCoords.y);
				this.tmpCtx.restore();
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
			value: function makePieces(canvas, img, numPieces, pieceSize, boardBoundary) {

				var boardLeft = this.canvas.offsetLeft + boardBoundary;
				var boardTop = this.canvas.offsetTop + boardBoundary;

				// prepare draw options
				var curImgX = 0;
				var curImgY = 0;
				var curCanvasX = boardLeft;
				var curCanvasY = boardTop;

				for (var i = 0; i < numPieces; i++) {
					// do draw

					var initialPieceData = this.assignInitialPieceData(curImgX, curImgY, curCanvasX, curCanvasY, pieceSize, i);

					this.ctx.strokeStyle = '#000';
					this.ctx.strokeRect(curCanvasX, curCanvasY, pieceSize, pieceSize);

					// reached last piece, start next row
					if (curImgX === img.width - pieceSize) {
						curImgX = 0;
						curImgY += pieceSize;
						curCanvasX = boardLeft;
						curCanvasY += pieceSize;
					} else {
						curImgX += pieceSize;
						curCanvasX += pieceSize;
					}
				}
			}
		}, {
			key: 'assignInitialPieceData',
			value: function assignInitialPieceData(imgX, imgY, canvX, canvY, pieceSize, i) {
				var data = {
					id: i,
					imgX: imgX,
					imgY: imgY,
					currentX: canvX,
					currentY: canvY,
					solvedX: canvX,
					solvedY: canvY
				};
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
	exports.default = {
		'corner-tl-srb': {
			width: 124,
			height: 161,
			connectors: {
				sockets: 'r',
				plugs: 'b'
			},
			coords: {
				x: 21,
				y: 0
			}
		},
		'corner-tl-sr-pb': {
			width: 121,
			height: 163,
			connectors: {
				sockets: 'r',
				plugs: 'b'
			},
			coords: {
				x: 286,
				y: 0
			}
		},
		'corner-tl-sb-pr': {
			width: 86,
			height: 65,
			connectors: {
				sockets: 'b',
				plugs: 'r'
			},
			coords: {
				x: 279,
				y: 0
			}
		},
		'corner-tl-prb': {
			width: 86,
			height: 86,
			connectors: {
				sockets: '',
				plugs: 'rb'
			},
			coords: {
				x: 279,
				y: 0
			}
		},
		'corner-bl-str': {
			connectors: {
				sockets: '',
				plugs: 'rb'
			},
			coords: {
				x: 408,
				y: 0
			}
		},
		'side-l-strb': {
			width: 65,
			height: 65,
			connectors: {
				sockets: 'tr',
				plugs: ''
			},
			coords: {
				x: 537,
				y: 0
			}
		},

		'side-l-stb-pr': {
			width: 165,
			height: 121,
			connectors: {
				sockets: 'tb',
				plugs: 'r'
			},
			coords: {
				x: 40,
				y: 245
			}
		},
		'side-l-st-prb': {
			width: 163,
			height: 164,
			connectors: {
				sockets: 't',
				plugs: 'rb'
			},
			coords: {
				x: 287,
				y: 246
			}
		},
		'side-l-ptrb': {
			width: 163,
			height: 205,
			connectors: {
				plugs: 'trb'
			},
			coords: {
				x: 1757,
				y: 204
			}
		},
		'side-m-ptrbl': {
			width: 206,
			height: 206,
			connectors: {
				plugs: 'trbl'
			},
			coords: {
				x: 1714,
				y: 1673
			}
		} };

/***/ }
/******/ ]);