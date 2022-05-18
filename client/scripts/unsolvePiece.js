class UnsolvePiece {
    constructor(){
        this.pieceId = window.location.search.substring(1);
        this.load()
    }
    load(){
        fetch(`/api/puzzle/unsolvePiece/${this.pieceId}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            }
        })
        .then( function(response){
            console.log(response)
        }).catch( function(err){
            console.log(err);
        });
    }
}

new UnsolvePiece();