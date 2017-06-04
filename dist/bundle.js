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

	/*
	var form = document.forms[0];
	form.addEventListener('submit', function(e){
		e.preventDefault();
		upload(form);
	});
	*/

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

	new _puzzly2.default('canvas', './halflife-3-2.jpg', 1);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _puzzlePiece = __webpack_require__(2);

	var _puzzlePiece2 = _interopRequireDefault(_puzzlePiece);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Puzzly = function () {
		function Puzzly(canvasId, imageUrl, numPieces) {
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

			// console.log('Initiating puzzly: ', imageUrl, numPieces);

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

			var imgs = [this.SourceImage, this.BgImage, this.JigsawSprite];

			this.preloadImages(imgs);
		}

		_createClass(Puzzly, [{
			key: 'init',
			value: function init() {
				this.canvas.width = this.SourceImage.width + this.config.boardBoundary * 2;
				this.canvas.height = this.SourceImage.height + this.config.boardBoundary * 2;
				this.tmpCanvas.style.width = this.canvas.width;
				this.tmpCanvas.style.height = this.canvas.height;
				this.bgCanvas.width = this.SourceImage.width + this.config.boardBoundary * 2;
				this.bgCanvas.height = this.SourceImage.height + this.config.boardBoundary * 2;

				var p = new _puzzlePiece2.default(this.ctx, { debug: true });
				// this.drawBackground();
				p.plugTRBL();

				this.ctx.clip();

				// this.makePieces(this.SourceImage, 500, this.config.pieceSize['500']);

				window.addEventListener('mousedown', function (e) {
					// this.onMouseDown(e);
				});
				window.addEventListener('mouseup', function (e) {
					// this.onMouseUp();
				});
				window.addEventListener('mousemove', function (e) {
					// this.onMouseMove(e);
				});
			}
		}, {
			key: 'draw',
			value: function draw(mouseX, mouseY) {
				this.drawBackground();
				this.drawPiece(this.movingPiece.imgX, this.movingPiece.imgY, mouseX, mouseY, this.movingPiece, this.config.pieceSize['500']);
			}
		}, {
			key: 'onMouseDown',
			value: function onMouseDown(e) {
				this.movingPiece = this.getClickTarget(e);
				this.isMouseDown = true;
			}
		}, {
			key: 'onMouseUp',
			value: function onMouseUp() {
				this.movingPiece = null;
				this.isMouseDown = false;
			}
		}, {
			key: 'onMouseMove',
			value: function onMouseMove(e) {
				if (this.isMouseDown) {
					this.draw(e.clientX, e.clientY);
					this.movingPiece.currentX = e.clientX;
					this.movingPiece.currentY = e.clientY;
				}
			}
		}, {
			key: 'preloadImages',
			value: function preloadImages(imgs, cb) {
				var _this = this;

				var promises = [];
				for (var i = 0, l = imgs.length; i < l; i++) {
					promises.push(this.loadImage(imgs[i]));
				}
				Promise.all(promises).then(function () {
					_this.init();
				});
			}
		}, {
			key: 'loadImage',
			value: function loadImage(img) {
				return new Promise(function (resolve, reject) {
					img.onload = function () {
						resolve(img);
					};
					img.onerror = function () {
						reject(img);
					};
				});
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
				var curImgX = 300;
				var curImgY = 300;
				var curCanvasX = boardLeft;
				var curCanvasY = boardTop;

				var done = false;
				var i = 0;

				var adjacentPieceBehind = null;
				var adjacentPieceAbove = null;
				var endOfRow = false;
				var lastPiece = null;
				var rowCount = 1;
				var finalRow = false;

				while (i < 1) {

					// console.log(this.pieces)
					// All pieces not on top row
					if (this.pieces.length > this.config.numPiecesOnHorizontalSides - 1) {
						adjacentPieceAbove = this.pieces[this.pieces.length - this.config.numPiecesOnHorizontalSides];
					}

					// Last piece in row, next piece should be a corner or right side
					if (this.pieces.length > 1 && this.pieces.length % (this.config.numPiecesOnHorizontalSides - 1) === 0) {
						endOfRow = true;
					} else {
						endOfRow = false;
					}

					if (rowCount === this.config.numPiecesOnVerticalSides - 1) {
						finalRow = true;
					}

					if (this.pieces.length > 0) {
						adjacentPieceBehind = this.pieces[i - 1];
					}

					var candidatePieces = this.getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow);
					var currentPiece = candidatePieces[Math.floor(Math.random() * candidatePieces.length)];
					this.drawPiece(curImgX, curImgY, curCanvasX, curCanvasY, currentPiece, pieceSize);
					this.assignInitialPieceData(curImgX, curImgY, curCanvasX, curCanvasY, currentPiece, i);

					// reached last piece, start next row
					if (this.pieces.length % this.config.numPiecesOnHorizontalSides === 0) {
						curImgX = 0;
						curImgY += pieceSize;
						curCanvasX = boardLeft;
						curCanvasY += pieceSize;
						rowCount++;
					} else {
						curImgX += pieceSize;
						curCanvasX += pieceSize;
					}

					i++;

					if (currentPiece.type.indexOf('corner-br') > -1) done = true;
				}
			}
		}, {
			key: 'getCanvasCoordsAndDimensionsForPiece',
			value: function getCanvasCoordsAndDimensionsForPiece(x, y, piece, pieceSize) {
				var scale = pieceSize / this.config.jigsawSquareSize;
				var w = void 0,
				    h = pieceSize;
				if (piece.connectors.plugs.length === 1) {
					if (piece.connectors.plugs === 'l' || piece.connectors.plugs === 'r') {
						w = pieceSize + this.config.jigsawPlugSize * scale;
						h = pieceSize;
					}
					if (piece.connectors.plugs === 't' || piece.connectors.plugs === 'b') {
						h = pieceSize + this.config.jigsawPlugSize * scale;
						w = pieceSize;
					}
				} else {
					if (piece.connectors.plugs.indexOf('l') > -1) {
						w += this.config.jigsawPlugSize * scale;
						x -= plugSizeToScale;
					}
					if (piece.connectors.plugs.indexOf('r') > -1) {
						w += this.config.jigsawPlugSize * scale;
					}
					if (piece.connectors.plugs.indexOf('t') > -1) {
						h += this.config.jigsawPlugSize * scale;
						y -= plugSizeToScale;
					}
					if (piece.connectors.plugs.indexOf('b') > -1) {
						h += this.config.jigsawPlugSize * scale;
					}
				}

				return {
					x: x, y: y, w: w, h: h
				};
			}
		}, {
			key: 'getImageCoordsAndDimensionsForPiece',
			value: function getImageCoordsAndDimensionsForPiece(iX, iY, pieceSize, piece) {
				var plugSizeToScale = pieceSize / this.config.jigsawSquareSize * this.config.jigsawPlugSize;
				var iW = void 0,
				    iH = pieceSize;
				if (piece.connectors.plugs.indexOf('l') > -1) {
					iX -= plugSizeToScale;
					iW += plugSizeToScale;
				}

				if (piece.connectors.plugs.indexOf('t') > -1) {
					iY -= plugSizeToScale;
					iH += plugSizeToScale;
				}

				if (piece.connectors.plugs.indexOf('r') > -1) {
					iW += plugSizeToScale;
				}

				if (piece.connectors.plugs.indexOf('b') > -1) {
					iH += plugSizeToScale;
				}
				return {
					x: iX,
					y: iY,
					w: iW,
					h: iH
				};
			}
		}, {
			key: 'getImgData',
			value: function getImgData(sourceImgData, pieceData) {
				this.tmpCtx.save();
				this.tmpCtx.drawImage(this.SourceImage, sourceImgData.x, sourceImgData.y, sourceImgData.w, sourceImgData.h, 0, 0, sourceImgData.w, sourceImgData.h);
				this.tmpCtx.globalCompositeOperation = 'destination-atop';
				this.tmpCtx.drawImage(this.JigsawSprite, pieceData.x, pieceData.y, pieceData.width, pieceData.height, 0, 0, sourceImgData.w, sourceImgData.h);
				return this.tmpCtx.getImageData(0, 0, pieceData.width, pieceData.height);
			}

			// Draw puzzle piece

		}, {
			key: 'drawPiece',
			value: function drawPiece(sourceImgX, sourceImgY, canvasX, canvasY, piece, pieceSize) {
				var plugSizeToScale = pieceSize / this.config.jigsawSquareSize * this.config.jigsawPlugSize;

				var pieceData = this.getCanvasCoordsAndDimensionsForPiece(canvasX, canvasY, piece, pieceSize);
				var imgData = this.getImageCoordsAndDimensionsForPiece(sourceImgX, sourceImgY, pieceSize, piece);

				this.tmpCtx.drawImage(this.JigsawSprite, pieceData.x, pieceData.y, pieceData.width, pieceData.height, 0, 0, sourceImgData.w, sourceImgData.h);

				this.tmpCtx.beginPath();
				this.tmpCtx.moveTo(200, 200);
				this.tmpCtx.lineTo(275, 200);
				this.tmpCtx.quadraticCurveTo(250, 150, 300, 150);
				this.tmpCtx.quadraticCurveTo(350, 150, 325, 200);
				this.tmpCtx.lineTo(400, 200);
				this.tmpCtx.lineTo(400, 275);
				this.tmpCtx.quadraticCurveTo(450, 250, 450, 300);
				this.tmpCtx.quadraticCurveTo(450, 350, 400, 325);
				this.tmpCtx.lineTo(400, 400);
				this.tmpCtx.lineTo(325, 400);
				this.tmpCtx.quadraticCurveTo(350, 450, 300, 450);
				this.tmpCtx.quadraticCurveTo(250, 450, 275, 400);
				this.tmpCtx.lineTo(200, 400);
				this.tmpCtx.lineTo(200, 325);
				this.tmpCtx.quadraticCurveTo(150, 350, 150, 300);
				this.tmpCtx.quadraticCurveTo(150, 250, 200, 275);
				this.tmpCtx.lineTo(200, 200);
				this.tmpCtx.closePath();
				this.tmpCtx.stroke();

				this.tmpCtx.clip();

				this.ctx.drawImage(this.tmpCanvas, canvasX, canvasY);
				this.tmpCtx.restore();
			}
		}, {
			key: 'drawBackground',
			value: function drawBackground() {
				this.bgCtx.save();
				// this.bgCtx.globalCompositeOperation = 'destination-over';
				this.bgCtx.drawImage(this.BgImage, 0, 0, this.BgImage.width, this.BgImage.height);
				this.ctx.drawImage(this.bgCanvas, 0, 0, this.BgImage.width, this.BgImage.height, 0, 0, this.canvas.width, this.canvas.height);
				this.bgCtx.restore();
			}
		}, {
			key: 'getCandidatePieces',
			value: function getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow) {
				var candidatePieces = [];
				var pieces = null;

				// Top left corner piece
				if (!adjacentPieceBehind && !adjacentPieceAbove) {
					return SpriteMap.filter(function (o) {
						return o.type.indexOf('corner-tl') > -1;
					});
				}

				// First row pieces
				if (!adjacentPieceAbove) {
					var pieceType = adjacentPieceBehind.type;

					// Does lastPiece have a plug on its right side?
					var lastPieceHasRightPlug = adjacentPieceBehind.connectors.plugs.indexOf('r') > -1;
					// Does lastPiece have a socket on its right side?
					var lastPieceHasRightSocket = adjacentPieceBehind.connectors.sockets.indexOf('r') > -1;
					var iterateeIsCorrectType = void 0;

					pieces = SpriteMap.filter(function (o) {
						if (endOfRow) {
							return o.type.indexOf('corner-tr') > -1;
						} else {
							return o.type.indexOf('side-t') > -1;
						}
					});

					for (var i = 0, l = pieces.length; i < l; i++) {
						var iterateeHasLeftSocket = pieces[i].connectors.sockets.indexOf('l') > -1;
						var iterateeHasLeftPlug = pieces[i].connectors.plugs.indexOf('l') > -1;
						if (lastPieceHasRightPlug && iterateeHasLeftSocket) {
							candidatePieces.push(pieces[i]);
						} else if (lastPieceHasRightSocket && iterateeHasLeftPlug) {
							candidatePieces.push(pieces[i]);
						}
					}
				}
				// All piece after top row
				else {

						// Last piece of each row, should be right side
						if (adjacentPieceAbove.type.indexOf('corner-tr') > -1 || adjacentPieceAbove.type.indexOf('side-r') > -1) {
							pieces = SpriteMap.filter(function (o) {
								return o.type.indexOf('side-r') > -1;
							});
						}

						// Very last piece, should be corner bottom right
						if (adjacentPieceAbove.type.indexOf('side-r') > -1 && adjacentPieceBehind.type.indexOf('side-b') > -1) {
							pieces = SpriteMap.filter(function (o) {
								return o.type.indexOf('corner-br') > -1;
							});
						}

						// First piece of each row, should be left side
						if (!finalRow && (adjacentPieceBehind.type.indexOf('corner-tr') > -1 || adjacentPieceBehind.type.indexOf('side-r') > -1)) {

							pieces = SpriteMap.filter(function (o) {
								return o.type.indexOf('side-l') > -1;
							});

							var _pieceAboveHasSocket = adjacentPieceAbove.connectors.sockets.indexOf('b') > -1;
							var _pieceAboveHasPlug = adjacentPieceAbove.connectors.plugs.indexOf('b') > -1;

							for (var _i = 0, _l = pieces.length; _i < _l; _i++) {
								var iterateeHasTopSocket = pieces[_i].connectors.sockets.indexOf('t') > -1;
								var iterateeHasTopPlug = pieces[_i].connectors.plugs.indexOf('t') > -1;
								if (_pieceAboveHasSocket && iterateeHasTopPlug) {
									candidatePieces.push(pieces[_i]);
								} else if (_pieceAboveHasPlug && iterateeHasTopSocket) {
									candidatePieces.push(pieces[_i]);
								}
							}

							return candidatePieces;
						}

						// All middle pieces
						if (adjacentPieceAbove.type.indexOf('middle') > -1 || adjacentPieceAbove.type.indexOf('side-t') > -1) {
							pieces = SpriteMap.filter(function (o) {
								return o.type.indexOf('middle') > -1;
							});
						}

						// ALl pieces on bottom row
						if (finalRow) {
							// if(adjacentPieceAbove) console.log('adjacentPieceAbove', adjacentPieceAbove.type, adjacentPieceAbove.id);
							// if(adjacentPieceBehind) console.log('adjacentPieceBehind', adjacentPieceBehind.type, adjacentPieceBehind.id);

							if (adjacentPieceAbove.type.indexOf('side-l') > -1) {
								pieces = SpriteMap.filter(function (o) {
									return o.type.indexOf('corner-bl') > -1;
								});

								var _pieceAboveHasSocket2 = adjacentPieceAbove.connectors.sockets.indexOf('b') > -1;
								var _pieceAboveHasPlug2 = adjacentPieceAbove.connectors.plugs.indexOf('b') > -1;

								for (var _i2 = 0, _l2 = pieces.length; _i2 < _l2; _i2++) {
									var _iterateeHasTopSocket = pieces[_i2].connectors.sockets.indexOf('t') > -1;
									var _iterateeHasTopPlug = pieces[_i2].connectors.plugs.indexOf('t') > -1;
									if (_pieceAboveHasSocket2 && _iterateeHasTopPlug) {
										candidatePieces.push(pieces[_i2]);
									} else if (_pieceAboveHasPlug2 && _iterateeHasTopSocket) {
										candidatePieces.push(pieces[_i2]);
									}
								}

								return candidatePieces;
							}

							if (adjacentPieceAbove.type.indexOf('middle') > -1) {
								pieces = SpriteMap.filter(function (o) {
									return o.type.indexOf('side-b') > -1;
								});
							}

							if (adjacentPieceAbove.type.indexOf('side-r') > -1 && adjacentPieceBehind.type.indexOf('side-b') > -1) {
								pieces = SpriteMap.filter(function (o) {
									return o.type.indexOf('corner-br') > -1;
								});
							}
						}

						var pieceAboveHasSocket = adjacentPieceAbove.connectors.sockets.indexOf('b') > -1;
						var pieceAboveHasPlug = adjacentPieceAbove.connectors.plugs.indexOf('b') > -1;
						var pieceBehindHasSocket = adjacentPieceBehind.connectors.sockets.indexOf('r') > -1;
						var pieceBehindHasPlug = adjacentPieceBehind.connectors.plugs.indexOf('r') > -1;

						for (var _i3 = 0, _l3 = pieces.length; _i3 < _l3; _i3++) {
							var _iterateeHasTopSocket2 = pieces[_i3].connectors.sockets.indexOf('t') > -1;
							var _iterateeHasTopPlug2 = pieces[_i3].connectors.plugs.indexOf('t') > -1;
							var _iterateeHasLeftSocket = pieces[_i3].connectors.sockets.indexOf('l') > -1;
							var _iterateeHasLeftPlug = pieces[_i3].connectors.plugs.indexOf('l') > -1;

							if (pieceAboveHasSocket && _iterateeHasTopPlug2 && pieceBehindHasSocket && _iterateeHasLeftPlug) {
								candidatePieces.push(pieces[_i3]);
							} else if (pieceAboveHasPlug && _iterateeHasTopSocket2 && pieceBehindHasPlug && _iterateeHasLeftSocket) {
								candidatePieces.push(pieces[_i3]);
							} else if (pieceAboveHasSocket && _iterateeHasTopPlug2 && pieceBehindHasPlug && _iterateeHasLeftSocket) {
								candidatePieces.push(pieces[_i3]);
							} else if (pieceAboveHasPlug && _iterateeHasTopSocket2 && pieceBehindHasSocket && _iterateeHasLeftPlug) {
								candidatePieces.push(pieces[_i3]);
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
					boundingBox: {
						top: canvY,
						right: canvX + this.config.pieceSize['500'],
						bottom: canvY + this.config.pieceSize['500'],
						left: canvX
					},
					solvedX: canvX,
					solvedY: canvY,
					isSolved: false
				}, piece);
				this.pieces.push(data);
				return data;
			}
		}, {
			key: 'hasCollision',
			value: function hasCollision(source, target) {
				return source.x > target.boundingBox.left && source.x < target.boundingBox.right && source.y < target.boundingBox.bottom && source.y > target.boundingBox.top;
			}
		}, {
			key: 'getCellByCoords',
			value: function getCellByCoords(coords) {
				for (var i = this.pieces.length - 1; i > -1; i--) {
					var piece = this.pieces[i];
					if (this.hasCollision(coords, piece)) {
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
				return this.getCellByCoords(coords);
			}
		}]);

		return Puzzly;
	}();

	exports.default = Puzzly;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var puzzlePiece = function () {
	  function puzzlePiece(ctx) {
	    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
	      debug: false

	    };

	    _classCallCheck(this, puzzlePiece);

	    console.log(opts);
	    this.debug = opts.debug;
	    this.ctx = ctx;
	  }

	  _createClass(puzzlePiece, [{
	    key: "plugTRBL",
	    value: function plugTRBL(startAt) {
	      this.ctx.beginPath();
	      this.ctx.moveTo(200, 200);
	      this.ctx.lineTo(275, 200);
	      // top plug geometry
	      // values are relative to current x,y position
	      // first curve
	      // control point is {x: -25, y: -50}
	      // end point is {x: +25, y: -50}
	      this.ctx.quadraticCurveTo(250, 150, 300, 150);
	      // second curve
	      // control point is {x: +75, y: -50}
	      // end point is {x: +50, y: ==}
	      this.ctx.quadraticCurveTo(350, 150, 325, 200);
	      if (this.debug) {
	        this.ctx.fillRect(250, 150, 5, 5);
	        this.ctx.fillRect(350, 150, 5, 5);
	      }
	      this.ctx.lineTo(400, 200);
	      this.ctx.lineTo(400, 275);
	      // right plug geometry
	      // values are relative to current x,y position
	      // control point is {x: +50, y: -25}
	      // end point is {x: +50, y: +25}
	      this.ctx.quadraticCurveTo(450, 250, 450, 300);
	      // second curve
	      // control point is {x: +50, y: +25}
	      // end point is {x: ==, y: +50}
	      this.ctx.quadraticCurveTo(450, 350, 400, 325);
	      if (this.debug) {
	        this.ctx.fillRect(450, 250, 5, 5);
	        this.ctx.fillRect(450, 350, 5, 5);
	      }
	      this.ctx.lineTo(400, 400);
	      this.ctx.lineTo(325, 400);
	      // bottom plug geometry
	      // first curve
	      // control point is {x: +25, y: +50}
	      // end point is {x: -25, y: +50}
	      this.ctx.quadraticCurveTo(350, 450, 300, 450);
	      // second curve
	      // control point is {x: -75, y: +50}
	      // end point is {x: -50, y: ==}
	      this.ctx.quadraticCurveTo(250, 450, 275, 400);
	      if (this.debug) {
	        this.ctx.fillRect(350, 450, 5, 5);
	        this.ctx.fillRect(250, 450, 5, 5);
	      }
	      this.ctx.lineTo(200, 400);
	      this.ctx.lineTo(200, 325);
	      // left plug geometry
	      // first curve
	      // control point is {x: -50, y: -25}
	      // end point is {x: -50, y: -25}
	      this.ctx.quadraticCurveTo(150, 350, 150, 300);
	      // second curve
	      // control point is {x: -50, y: -75}
	      // end point is {x: ==, y: -50}
	      this.ctx.quadraticCurveTo(150, 250, 200, 275);
	      if (this.debug) {
	        this.ctx.fillRect(150, 350, 5, 5);
	        this.ctx.fillRect(150, 250, 5, 5);
	      }
	      this.ctx.lineTo(200, 200);
	      this.ctx.closePath();
	      this.ctx.stroke();
	    }
	  }, {
	    key: "plugTBsocketRL",
	    value: function plugTBsocketRL() {
	      this.ctx.beginPath();
	      this.ctx.moveTo(200, 200);
	      this.ctx.lineTo(275, 200);
	      this.ctx.quadraticCurveTo(250, 150, 300, 150);
	      this.ctx.quadraticCurveTo(350, 150, 325, 200);
	      if (this.debug) {
	        this.ctx.fillRect(250, 150, 5, 5);
	        this.ctx.fillRect(350, 150, 5, 5);
	      }
	      this.ctx.lineTo(400, 200);
	      this.ctx.lineTo(400, 275);
	      this.ctx.quadraticCurveTo(350, 250, 350, 300);
	      this.ctx.quadraticCurveTo(350, 350, 400, 325);
	      if (this.debug) {
	        this.ctx.fillRect(350, 250, 5, 5);
	        this.ctx.fillRect(350, 350, 5, 5);
	      }
	      this.ctx.lineTo(400, 400);
	      this.ctx.lineTo(325, 400);
	      this.ctx.quadraticCurveTo(350, 450, 300, 450);
	      this.ctx.quadraticCurveTo(250, 450, 275, 400);
	      if (this.debug) {
	        this.ctx.fillRect(350, 450, 5, 5);
	        this.ctx.fillRect(250, 450, 5, 5);
	      }
	      this.ctx.lineTo(200, 400);
	      this.ctx.lineTo(200, 325);
	      this.ctx.quadraticCurveTo(150, 350, 150, 300);
	      this.ctx.quadraticCurveTo(150, 250, 200, 275);
	      if (this.debug) {
	        this.ctx.fillRect(150, 350, 5, 5);
	        this.ctx.fillRect(150, 250, 5, 5);
	      }
	      this.ctx.lineTo(200, 200);
	      this.ctx.closePath();
	      this.ctx.stroke();
	    }
	  }, {
	    key: "plugRBLsocketT",
	    value: function plugRBLsocketT() {
	      this.ctx.beginPath();
	      this.ctx.moveTo(200, 200);
	      this.ctx.lineTo(275, 200);
	      this.ctx.quadraticCurveTo(250, 250, 300, 250);
	      this.ctx.quadraticCurveTo(350, 250, 325, 200);
	      this.ctx.lineTo(400, 200);
	      this.ctx.lineTo(400, 275);
	      this.ctx.quadraticCurveTo(450, 250, 450, 300);
	      this.ctx.quadraticCurveTo(450, 350, 400, 325);
	      this.ctx.lineTo(400, 400);
	      this.ctx.lineTo(325, 400);
	      this.ctx.quadraticCurveTo(350, 450, 300, 450);
	      this.ctx.quadraticCurveTo(250, 450, 275, 400);
	      this.ctx.lineTo(200, 400);
	      this.ctx.lineTo(200, 325);
	      this.ctx.quadraticCurveTo(150, 350, 150, 300);
	      this.ctx.quadraticCurveTo(150, 250, 200, 275);
	      this.ctx.lineTo(200, 200);
	      this.ctx.closePath();
	      this.ctx.stroke();
	    }
	  }, {
	    key: "plugBLsocketTR",
	    value: function plugBLsocketTR() {
	      this.ctx.beginPath();
	      this.ctx.moveTo(200, 200);
	      this.ctx.lineTo(275, 200);
	      this.ctx.quadraticCurveTo(250, 250, 300, 250);
	      this.ctx.quadraticCurveTo(350, 250, 325, 200);
	      this.ctx.lineTo(400, 200);
	      this.ctx.lineTo(400, 275);
	      this.ctx.quadraticCurveTo(350, 250, 350, 300);
	      this.ctx.quadraticCurveTo(350, 350, 400, 325);
	      this.ctx.lineTo(400, 400);
	      this.ctx.lineTo(325, 400);
	      this.ctx.quadraticCurveTo(350, 450, 300, 450);
	      this.ctx.quadraticCurveTo(250, 450, 275, 400);
	      this.ctx.lineTo(200, 400);
	      this.ctx.lineTo(200, 325);
	      this.ctx.quadraticCurveTo(150, 350, 150, 300);
	      this.ctx.quadraticCurveTo(150, 250, 200, 275);
	      this.ctx.lineTo(200, 200);
	      this.ctx.closePath();
	      this.ctx.stroke();
	    }
	  }]);

	  return puzzlePiece;
	}();

	exports.default = puzzlePiece;

/***/ }
/******/ ]);