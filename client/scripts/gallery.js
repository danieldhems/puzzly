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
        const time = new Date(puzzle.elapsedTime).toISOString().substr(8);
        const hms = time.split('T')[1].split(':');
        const hourStr = hms[0] !== '00' ? hms[0].substring(1, 2) + 'hours,' : '';
        const minuteStr = (hms[1].charAt(0) === '0' ? hms[1].charAt(1) : hms[1]) + ' minutes';
        const secondsStr = (hms[2].charAt(0) === '0' ? hms[2].substring(1, 2) : hms[2].substring(0, 2)) + ', seconds';

        const tpl = `
            <div data-puzzle-id="${puzzle._id}" class="puzzle-list-item">
                <a href="/?puzzleId=${puzzle._id}" title="">
                    <img src="${puzzle.previewPath}" class="puzzle-list-item__image" />
                </a>
                <p>
                ${Math.round(puzzle.percentSolved)}% solved.<br />
                Time spent: ${hourStr} ${minuteStr}.
                </p>
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