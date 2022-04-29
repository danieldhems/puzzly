export default {
	getQueryStringValue (key) { 
		return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
	},

    isTopLeftCorner(piece) {
		return piece && piece.type[0] === 0 && piece.type[3] === 0;
	},

	isTopSide(piece) {
		return piece && piece.type[0] === 0 && piece.type[1] !== 0 && piece.type[3] !== 0;
	},

	isTopRightCorner(piece) {
		return piece && piece.type[0] === 0 && piece.type[1] === 0;
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
		return piece.group !== undefined && piece.group !== null && !Number.isNaN(piece.group);
	},

	querySelectorFrom(selector, elements) {
		return [].filter.call(elements, function(element) {
			return element.matches(selector);
		});
	},

	isNumber(val){
		return !Number.isNaN(val);
	}
}