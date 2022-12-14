const Utils = {
	hasCollision(source, target, sourceEl, targetEl){
		if([source.left, source.right, source.bottom, source.top, target.left, target.top, target.right, target.bottom].includes(NaN)) return false;

		// console.log("source before", source)
		// console.log("target before", target)

		// const sourceBB = {
		// 	top: source.top * this.zoomLevel,
		// 	right: source.right * this.zoomLevel,
		// 	bottom: source.bottom * this.zoomLevel,
		// 	left: source.left * this.zoomLevel,
		// }

		// const targetBB = {
		// 	top: target.top * this.zoomLevel,
		// 	right: target.right * this.zoomLevel,
		// 	bottom: target.bottom * this.zoomLevel,
		// 	left: target.left * this.zoomLevel,
		// }
		
		// console.log("has collision?", sourceBB)
		// console.log("has collision?", targetBB)

		const sourceBB = source;
		const targetBB = target;
		return !(sourceBB.left >= targetBB.right || sourceBB.top >= targetBB.bottom || 
		sourceBB.right <= targetBB.left || sourceBB.bottom <= targetBB.top);
	},

	/**
	* Returns a random integer between min (inclusive) and max (inclusive).
	* The value is no lower than min (or the next integer greater than min
	* if min isn't an integer) and no greater than max (or the next integer
	* lower than max if max isn't an integer).
	* Using Math.round() will give you a non-uniform distribution!
	*/
	getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	getQueryStringValue (key) { 
		return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
	},

	isTopSide(piece) {
		return piece && piece.type[0] === 0 && piece.type[1] !== 0 && piece.type[3] !== 0;
	},

	isTopRightCorner(piece) {
		return piece && piece.type[0] === 0 && piece.type[1] === 0;
	},

	isTopLeftCorner(piece) {
		return piece && piece.type[0] === 0 && piece.type[3] === 0;
	},

	isLeftSide(piece) {
		return piece && piece.type[0] !== 0 && piece.type[2] !== 0 && piece.type[3] === 0;
	},

	isInnerPiece(piece) {
		return piece && piece.type[0] !== 0 && piece.type[1] !== 0 && piece.type[2] !== 0 && piece.type[3] !== 0;
	},

	isRightSide(piece) {
		return piece && piece.type[0] !== 0 && piece.type[1] === 0 && piece.type[2] !== 0;
	},

	isTopEdgePiece(piece) {
		return piece && piece.type[0] === 0;
	},

	isRightEdgePiece(piece) {
		return piece && piece.type[1] === 0;
	},

	isBottomEdgePiece(piece) {
		return piece && piece.type[2] === 0;
	},

	isLeftEdgePiece(piece) {
		return piece && piece.type[3] === 0;
	},

	isBottomLeftCorner(piece) {
		return piece && piece.type[2] === 0 && piece.type[3] === 0;
	},

	isBottomSide(piece) {
		return piece && piece.type[1] !== 0 && piece.type[2] === 0 && piece.type[3] !== 0;
	},

	isSidePiece(piece) {
		return piece && piece.type.filter(t => t === 0).length === 1;
	},

	isBottomRightCorner(piece) {
		return piece && piece.type[1] === 0 && piece.type[2] === 0;
	},

	isCornerPiece(piece){
		return this.isTopLeftCorner(piece) || this.isTopRightCorner(piece) || this.isBottomRightCorner(piece) || this.isBottomLeftCorner(piece);
	},

	isCornerConnection(str){
		return str === 'top-left' || str === 'top-right' || str === 'bottom-right' || str === 'bottom-left';
	},

	isEdgePiece(piece){
		return this.isSidePiece(piece) || this.isCornerPiece(piece);
	},

	has(type, connector, side){
		if(!connector || !side) return false;
		const c = connector === "plug" ? 1 : connector === "socket" ? -1 : null;
		const s = side === "top" ? 0 : side === "right" ? 1 : side === "bottom" ? 2 : side === "left" ? 3 : null;
		return type[s] === c;
	},	

	isAdjacent(pieceAId, pieceBId, numPiecesHorizontal){
		const pieceToRightId = pieceAId + 1;
		const pieceToBottomRightId = pieceAId + numPiecesHorizontal + 1;
		const pieceToBottomLefttId = pieceAId + numPiecesHorizontal - 1;
		const pieceToLeftId = pieceAId - 1;
		const pieceToTopId = pieceAId - numPiecesHorizontal;
		const pieceToTopRightId = pieceAId - numPiecesHorizontal + 1;
		const pieceToTopLeftId = pieceAId - numPiecesHorizontal - 1;
		const pieceToBottomId = pieceAId + numPiecesHorizontal;
		return pieceToRightId === pieceBId || pieceToLeftId === pieceBId || pieceToTopId === pieceBId || pieceToBottomId === pieceBId || pieceToBottomLefttId === pieceBId || pieceToBottomRightId === pieceBId || pieceToTopLeftId === pieceBId || pieceToTopRightId === pieceBId;
	},

	hasGroup(piece){
		return piece.group !== undefined && piece.group !== null && !Number.isNaN(piece.group) && piece.group !== 1111;
	},

	querySelectorFrom(selector, elements) {
		return [].filter.call(elements, function(element) {
			return element.matches(selector);
		});
	},

	isNumber(val){
		return !Number.isNaN(val);
	},

	adjustForZoomLevel(obj, zoomLevel){
		return {
			top: obj.top && obj.top * zoomLevel,
			right: obj.right && obj.right * zoomLevel,
			bottom: obj.bottom && obj.bottom * zoomLevel,
			left: obj.left && obj.left * zoomLevel,
		}
	},

	isMobile() {
		let check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	},

	drawBackground(){
		const path = './bg-wood.jpg';
		const BgImage = new Image();
		const BackgroundCanvas = document.getElementById('canvas');
		BackgroundCanvas.style.position = "absolute";
		BackgroundCanvas.style.top = 0;
		BackgroundCanvas.style.left = 0;
		BackgroundCanvas.style.width = "100%";
		BackgroundCanvas.style.height = "100%";
		BgImage.addEventListener('load', () => {
			BackgroundCanvas.style.backgroundImage = `url(${path})`;
		})
		BgImage.src = path;
	},

	insertUrlParam(key, value) {
    if (history.pushState) {
        let searchParams = new URLSearchParams(window.location.search);
        searchParams.set(key, value);
        let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
        window.history.pushState({path: newurl}, '', newurl);
    }
	},

	getElementByPieceId(id){
		return document.querySelectorAll(`[data-piece-id='${id}']`)[0];
	},

	isOutOfBounds(sourceBox){
		const cnvBox = document.querySelector("#canvas").getBoundingClientRect();
		const pocketsBox = document.querySelector("#side-groups").getBoundingClientRect();

		return !Utils.hasCollision(sourceBox, cnvBox) && !Utils.hasCollision(sourceBox, pocketsBox);
	},

	drawBox(box, borderColor = null){
		const div = document.createElement("div");
		div.style.position = "absolute";
		div.style.top = (box.top || box.y) + "px";
		div.style.left = (box.left || box.x) + "px";
		div.style.width = box.width + "px";
		div.style.height = box.height + "px";
		div.style.border = `2px solid ${borderColor || 'green'}`;
		div.style.pointerEvents = "none";
		document.body.appendChild(div);
	},

	getPositionRelativeToCanvas(element, zoomLevel){
		const cnv = document.querySelector("#canvas");
		const cnvRect = cnv.getBoundingClientRect();
		const elBox = element.getBoundingClientRect();

		const pieceOffsetWithCanvasX = elBox.left - cnvRect.left;
		const pieceOffsetWithCanvasY = elBox.top - cnvRect.top;

		const piecePercX = pieceOffsetWithCanvasX / cnvRect.width * 100;
		const piecePercY = pieceOffsetWithCanvasY / cnvRect.height * 100;

		const x = cnvRect.left === 0 ? elBox.left - cnvRect.left : cnvRect.width / 100 * piecePercX;
		const y = cnvRect.top === 0 ? elBox.top - cnvRect.top : cnvRect.height / 100 * piecePercY;

		return {
			y: y / zoomLevel,
			x: x / zoomLevel,
		};
	}
}

export default Utils;