export function getApplicablePersistence(progressFromServer, lastSaveTimeFromServer){
  const progressKey = this.getUniqueLocalStorageKeyForPuzzle("LOCAL_STORAGE_PUZZLY_PROGRESS_KEY");
  const lastSaveKey = this.getUniqueLocalStorageKeyForPuzzle("LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY");
  const hasLocalStorageSupport = window.localStorage;
  const progressInLocalStorage = hasLocalStorageSupport && localStorage.getItem(progressKey);
  const lastSaveInLocalStorage = hasLocalStorageSupport && localStorage.getItem(lastSaveKey);

  let availableStorage;
  const storage = {};

  if(!lastSaveTimeFromServer && !lastSaveInLocalStorage){
    console.info('Puzzly: No saved data found')
    return;
  }

  if(progressFromServer && progressFromServer.length){
    if(lastSaveInLocalStorage && lastSaveInLocalStorage > lastSaveTimeFromServer){
      availableStorage = 'local';
    } else {
      availableStorage = 'server';
    }
  } else if(lastSaveInLocalStorage && progressInLocalStorage.length){
    availableStorage = 'local';
  }

  switch(availableStorage){
    case 'server':
      console.info(`[Puzzly] Restoring from server-side storage`);
      storage.pieces = progressFromServer;
      storage.latestSave = parseInt(lastSaveTimeFromServer);
      break;
    case 'local':
      console.info(`[Puzzly] Restoring from local storage`);
      storage.pieces = JSON.parse(progressInLocalStorage);
      storage.latestSave = parseInt(lastSaveInLocalStorage);
      break;
  }

  return storage;
}

export function saveToLocalStorage(){
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

export async function saveInnerPieceVisibility(visible){
  fetch(`/api/toggleVisibility/${this.puzzleId}`, {
    method: 'put',
    headers: {
      'Content-Type': 'Application/json'
    },
    body: JSON.stringify({piecesVisible: visible})
  });
}

export function setElementIdsFromPersistence(pieces){
  const allPieces = this.allPieces();
  pieces.forEach(p => {
    let { imgX, imgY, _id } = p;
    imgX = "" + imgX;
    imgY = "" + imgY;
    const el = Utils.querySelectorFrom(`[data-imgx='${imgX}'][data-imgy='${imgY}']`, allPieces)[0];
    this.setElementAttribute(el, 'data-piece-id-in-persistence', _id)
  })
}

export function getUniqueLocalStorageKeyForPuzzle(key){
  return this[key].replace(this.localStorageStringReplaceKey, this.puzzleId)
}

export async function save(pieces){
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