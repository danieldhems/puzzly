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
					'500': 40,
					'1000': 30,
					'2000': 20
				},
				jigsawSquareSize: 121,
				jigsawPlugSize: 45,
				boardBoundary: 200,
				numPieces: 1000
			};

			this.Pieces = [];

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
				_this.tmpCanvasWidth = window.innerWidth;
				_this.tmpCanvasHeight = window.innerHeight;
				// drawImage(canvas, this.ctx, img, config.boardBoundary);

				var jigsawPiece1 = _spriteMap2.default['side-l-st-prb'];
				var jigsawPiece2 = _spriteMap2.default['corner-tl-sr-pb'];

				console.log(jigsawPiece1);
				console.log(jigsawPiece2);

				_this.drawPiece(_this.SourceImage, { x: 50, y: 50 }, _this.JigsawSprite, jigsawPiece1, 50, { x: 50, y: 50 });
				_this.drawPiece(_this.SourceImage, { x: 50, y: 0 }, _this.JigsawSprite, jigsawPiece2, 50, { x: 100, y: 100 });
				// makePieces(canvas, img, 1000, config.pieceSize['1000'], config.boardBoundary);
			};

			window.addEventListener('click', this.onWindowClick);
		}

		// Draw puzzle piece


		_createClass(Puzzly, [{
			key: 'drawPiece',
			value: function drawPiece(sourceImg, sourceImgCoords, jigsawSprite, piece, pieceSize, canvasCoords) {
				// Get scale of intended piece size compared to sprite
				var scale = pieceSize / this.config.jigsawSquareSize;
				var pieceW = null;
				var pieceH = null;

				var lrRegex = new RegExp('[lr]', 'g');
				var tbRegex = new RegExp('[tb]', 'g');

				if (piece.connectors.plugs.length === 1) {
					if (piece.connectors.plugs === 'l' || piece.connectors.plugs === 'r') {
						pieceW = pieceSize + this.config.jigsawPlugSize * scale;
						pieceH = pieceSize;
					}
					if (piece.connectors.plugs === 't' || piece.connectors.plugs === 'b') {
						pieceH = pieceSize + this.config.jigsawPlugSize * scale;
						pieceW = pieceSize;
					}
				} else {
					pieceW = pieceSize;
					pieceH = pieceSize;
					if (piece.connectors.plugs.indexOf('l') > -1) {
						pieceW += this.config.jigsawPlugSize * scale;
					}
					if (piece.connectors.plugs.indexOf('r') > -1) {
						pieceW += this.config.jigsawPlugSize * scale;
					}
					if (piece.connectors.plugs.indexOf('t') > -1) {
						pieceH += this.config.jigsawPlugSize * scale;
					}
					if (piece.connectors.plugs.indexOf('b') > -1) {
						pieceH += this.config.jigsawPlugSize * scale;
					}
				}

				this.tmpCtx.save();
				this.tmpCtx.drawImage(sourceImg, sourceImgCoords.x, sourceImgCoords.y, pieceSize, pieceSize, canvasCoords.x, canvasCoords.y, pieceSize, pieceSize);
				this.tmpCtx.globalCompositeOperation = 'destination-atop';
				this.tmpCtx.drawImage(jigsawSprite, piece.coords.x, piece.coords.y, piece.width, piece.height, canvasCoords.x, canvasCoords.y, pieceW, pieceH);
				this.ctx.drawImage(this.tmpCanvas, canvasCoords.x, canvasCoords.y);
				this.tmpCtx.restore();
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

				ctx = canvas.getContext('2d');

				var boardLeft = canvas.offsetLeft + boardBoundary;
				var boardTop = canvas.offsetTop + boardBoundary;

				// prepare draw options
				var curImgX = 0;
				var curImgY = 0;
				var curCanvasX = boardLeft;
				var curCanvasY = boardTop;

				for (var i = 0; i < numPieces; i++) {
					// do draw

					var initialPieceData = assignInitialPieceData(curImgX, curImgY, curCanvasX, curCanvasY, pieceSize, i);

					ctx.strokeStyle = '#000';
					ctx.strokeRect(curCanvasX, curCanvasY, pieceSize, pieceSize);

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
				pieces.push(data);
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
			width: 124,
			height: 161,
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
			height: 161,
			connectors: {
				sockets: 't',
				plugs: 'rb'
			},
			coords: {
				x: 287,
				y: 246
			}
		} };

/***/ }
/******/ ]);