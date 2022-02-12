class RemoveAll {
    constructor(){
        this.load()
    }
    load(){
        fetch('/api/puzzle/removeAll/pieces', {
            method: 'delete',
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

new RemoveAll();