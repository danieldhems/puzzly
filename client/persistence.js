saveToLocalStorage(){
  const payload = [];
  let time = Date.now();

  [...this.allPieces()].forEach(p => {
    delete p._id;
    payload.push(this.getPieceFromElement(p, this.DATA_ATTR_KEYS));
  });

  const progressKey = this.getUniqueLocalStorageKeyForPuzzle("LOCAL_STORAGE_PUZZLY_PROGRESS_KEY");
  const lastSaveKey = this.getUniqueLocalStorageKeyForPuzzle("LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY");

  console.info(`[Puzzly] Saving to local storage, key ${progressKey}:`, payload)
  localStorage.setItem(progressKey, JSON.stringify(payload));
  console.info(`[Puzzly] Saving to local storage, key ${lastSaveKey}:`, time)
  localStorage.setItem(lastSaveKey, time);
}

async function saveInnerPieceVisibility(visible){
  fetch(`/api/toggleVisibility/${this.puzzleId}`, {
    method: 'put',
    headers: {
      'Content-Type': 'Application/json'
    },
    body: JSON.stringify({piecesVisible: visible})
  });
}

setElementIdsFromPersistence(pieces){
  const allPieces = this.allPieces();
  pieces.map(p => {
    let { imgX, imgY, _id } = p;
    imgX = "" + imgX;
    imgY = "" + imgY;
    const el = Utils.querySelectorFrom(`[data-imgx='${imgX}'][data-imgy='${imgY}']`, allPieces)[0];
    this.setElementAttribute(el, 'data-piece-id-in-persistence', _id)
  })
}

getUniqueLocalStorageKeyForPuzzle(key){
  return this[key].replace(this.localStorageStringReplaceKey, this.puzzleId)
}

async function save(pieces){
  const payload = [];
  const useLocalStorage = false;

  if(useLocalStorage){
    
  } else {
    pieces.forEach( p => {
      delete p._id;
      payload.push(this.getPieceFromElement(p, this.DATA_ATTR_KEYS));
    });
    
    const isFirstSave = !payload[0]?._id;
    fetch(`/api/pieces/${this.puzzleId}`, {
      method: isFirstSave ? 'post' : 'put',
      headers: {
        'Content-Type': 'Application/json'
      },
      body: JSON.stringify(payload)
    })
    .then( res => {
      if(!res.ok){
        this.saveToLocalStorage();
        return;
      }
      return res.json() 
    })
    .then( res => {
      if(isFirstSave){
        this.setElementIdsFromPersistence(res.data)
      }

      if(res.status === "failure"){
        console.info('[Puzzly] Save to DB failed, saving to Local Storage instead.');
        localStorage.setItem('puzzly', {
          lastSaveDate: Date.now(),
          progress: payload
        })
      }
    })
  }
}