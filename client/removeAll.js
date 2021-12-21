class RemoveAll {
    constructor(){
        this.load()
    }
    load(){
        fetch('/api/puzzle/removeAll', {
            method: 'GET',
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