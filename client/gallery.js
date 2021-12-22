function Gallery (){
    const container = document.querySelector('#gallery')
    load();

    function load(){
        fetch('/api/puzzle/fetchAll', {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            }
        })
        .then( response => response.json() )
        .then(onLoadSuccess)
        .catch( function(err){
            console.log(err);
        });
    }

    function onLoadSuccess(data){
        makeGallery(data);
    }

    function makePuzzleItem(puzzle){
        const percentSolved = Math.round(puzzle.numberOfSolvedPieces / puzzle.selectedNumPieces * 100);
        const time = puzzle.elapsedTime;

        console.log(new Date(time).toISOString().substr(8))
        const tpl = `
            <div data-puzzle-id="${puzzle._id}" class="puzzle-list-item">
                <a href="/?puzzleId=${puzzle._id}" title="">
                    <img src="${puzzle.sourceImage.path}" class="puzzle-list-item__image" />
                </a>
                <p>${percentSolved}% solved</p>
            </div>
        `;
        container.insertAdjacentHTML("beforeend", tpl);
    }

    function makeGallery(puzzles){
        console.log(puzzles)
        puzzles.forEach(makePuzzleItem)
    }
}

new Gallery();