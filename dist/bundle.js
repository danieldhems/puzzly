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
				jigsawPlugSize: 41,
				boardBoundary: 200,
				numPieces: 1000
			};

			this.Pieces = [];

			console.log('Initiating puzzly: ', imageUrl, numPieces);

			this.canvas = document.getElementById(canvasId);
			this.ctx = canvas.getContext('2d');

			this.SourceImage = new Image();
			this.SourceImage.src = imageUrl;

			this.JigsawSprite = new Image();
			this.JigsawSprite.src = './jigsaw-sprite.png';

			this.SourceImage.onload = function () {
				canvas.width = _this.SourceImage.width + _this.config.boardBoundary * 2;
				canvas.height = _this.SourceImage.height + _this.config.boardBoundary * 2;
				// drawImage(canvas, this.ctx, img, config.boardBoundary);

				_this.drawPiece(_this.SourceImage, { x: 50, y: 50 }, _this.JigsawSprite, _spriteMap2.default, 'side-l-stb-pr', 50);
				// makePieces(canvas, img, 1000, config.pieceSize['1000'], config.boardBoundary);
			};

			window.addEventListener('click', this.onWindowClick);
		}

		// Draw puzzle piece


		_createClass(Puzzly, [{
			key: 'drawPiece',
			value: function drawPiece(sourceImg, sourceImgCoords, jigsawSprite, SpriteMap, pieceType, pieceSize) {
				// Get jigsaw piece sprite data
				var piece = SpriteMap[pieceType];

				// Get scale of intended piece size compared to sprite
				var scale = pieceSize / this.config.jigsawSquareSize;

				// Implement logic to add scaled overlap width / height of plug size for jigsaw pieces,
				// depending on which sides the plugs are on e.g. top, right, bottom, left
				var pieceW = pieceSize + this.config.jigsawPlugSize * scale;
				var pieceH = pieceSize;

				this.ctx.drawImage(sourceImg, sourceImgCoords.x, sourceImgCoords.y, pieceSize, pieceSize, 50, 50, pieceSize, pieceSize);
				this.ctx.globalCompositeOperation = 'destination-atop';
				this.ctx.drawImage(jigsawSprite, piece.coords.x, piece.coords.y, piece.width, piece.height, 50, 50, pieceW, pieceH);
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
			width: 65,
			height: 86,
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
			width: 65,
			height: 86,
			connectors: {
				sockets: 'r',
				plugs: 'b'
			},
			coords: {
				x: 150,
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
			height: 120,
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
			width: 86,
			height: 86,
			connectors: {
				sockets: 'tb',
				plugs: 'r'
			},
			coords: {
				x: 21,
				y: 128
			}
		} };

/***/ }
/******/ ]);