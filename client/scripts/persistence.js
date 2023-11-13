import {
  LOCAL_STORAGE_PUZZLY_PROGRESS_KEY,
  LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY,
  EVENT_TYPES,
} from "./constants.js";
import Utils from "./utils.js";

export default class PersistenceOperations {
  puzzleId;
  localStorageStringReplaceKey = "{}";

  constructor(config) {
    console.log(config);
    this.puzzleId = config.puzzleId;

    this.LOCAL_STORAGE_PUZZLY_PROGRESS_KEY = `Puzzly_ID${this.localStorageStringReplaceKey}_progress`;
    this.LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY = `Puzzly_ID${this.localStorageStringReplaceKey}_lastSave`;

    window.addEventListener(EVENT_TYPES.SAVE, (event) => {
      this.save.call(this, event.detail);
    });
  }

  getPersistence(progressFromServer, lastSaveTimeFromServer) {
    const progressKey = this.getUniqueLocalStorageKeyForPuzzle(
      "LOCAL_STORAGE_PUZZLY_PROGRESS_KEY"
    );
    const lastSaveKey = this.getUniqueLocalStorageKeyForPuzzle(
      "LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY"
    );
    const hasLocalStorageSupport = window.localStorage;
    const progressInLocalStorage =
      hasLocalStorageSupport && localStorage.getItem(progressKey);
    const lastSaveInLocalStorage =
      hasLocalStorageSupport && localStorage.getItem(lastSaveKey);

    let availableStorage;
    const storage = {};

    if (!lastSaveTimeFromServer && !lastSaveInLocalStorage) {
      console.info("Puzzly: No saved data found");
      return;
    }

    if (progressFromServer && progressFromServer.length) {
      if (
        lastSaveInLocalStorage &&
        lastSaveInLocalStorage > lastSaveTimeFromServer
      ) {
        availableStorage = "local";
      } else {
        availableStorage = "server";
      }
    } else if (lastSaveInLocalStorage && progressInLocalStorage.length) {
      availableStorage = "local";
    }

    switch (availableStorage) {
      case "server":
        console.info(`[Puzzly] Restoring from server-side storage`);
        storage.pieces = progressFromServer;
        storage.latestSave = parseInt(lastSaveTimeFromServer);
        break;
      case "local":
        console.info(`[Puzzly] Restoring from local storage`);
        storage.pieces = JSON.parse(progressInLocalStorage);
        storage.latestSave = parseInt(lastSaveInLocalStorage);
        break;
    }

    return storage;
  }

  getUniqueLocalStorageKeyForPuzzle(key) {
    return this[key].replace(this.localStorageStringReplaceKey, this.puzzleId);
  }

  getApplicablePersistence(progressFromServer, lastSaveTimeFromServer) {
    const progressKey = this.getUniqueLocalStorageKeyForPuzzle(
      LOCAL_STORAGE_PUZZLY_PROGRESS_KEY
    );
    const lastSaveKey = this.getUniqueLocalStorageKeyForPuzzle(
      LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY
    );
    const hasLocalStorageSupport = window.localStorage;
    const progressInLocalStorage =
      hasLocalStorageSupport && localStorage.getItem(progressKey);
    const lastSaveInLocalStorage =
      hasLocalStorageSupport && localStorage.getItem(lastSaveKey);

    let availableStorage;
    const storage = {};

    if (!lastSaveTimeFromServer && !lastSaveInLocalStorage) {
      console.info("Puzzly: No saved data found");
      return;
    }

    if (progressFromServer && progressFromServer.length) {
      if (
        lastSaveInLocalStorage &&
        lastSaveInLocalStorage > lastSaveTimeFromServer
      ) {
        availableStorage = "local";
      } else {
        availableStorage = "server";
      }
    } else if (lastSaveInLocalStorage && progressInLocalStorage.length) {
      availableStorage = "local";
    }

    switch (availableStorage) {
      case "server":
        console.info(`[Puzzly] Restoring from server-side storage`);
        storage.pieces = progressFromServer;
        storage.latestSave = parseInt(lastSaveTimeFromServer);
        break;
      case "local":
        console.info(`[Puzzly] Restoring from local storage`);
        storage.pieces = JSON.parse(progressInLocalStorage);
        storage.latestSave = parseInt(lastSaveInLocalStorage);
        break;
    }

    return storage;
  }

  saveToLocalStorage(pieces) {
    const payload = [];
    let time = Date.now();

    pieces.forEach((p) => {
      delete p._id;
      payload.push(Utils.getPieceFromElement(p));
    });

    const progressKey = this.getUniqueLocalStorageKeyForPuzzle(
      "LOCAL_STORAGE_PUZZLY_PROGRESS_KEY"
    );
    const lastSaveKey = this.getUniqueLocalStorageKeyForPuzzle(
      "LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY"
    );

    console.info(
      `[Puzzly] Saving to local storage, key ${progressKey}:`,
      payload
    );
    localStorage.setItem(progressKey, JSON.stringify(payload));
    console.info(`[Puzzly] Saving to local storage, key ${lastSaveKey}:`, time);
    localStorage.setItem(lastSaveKey, time);
  }

  async saveInnerPieceVisibility(visible) {
    fetch(`/api/toggleVisibility/${this.puzzleId}`, {
      method: "put",
      headers: {
        "Content-Type": "Application/json",
      },
      body: JSON.stringify({ piecesVisible: visible }),
    });
  }

  setElementIdsFromPersistence(pieces) {
    pieces.forEach((p) => {
      let { imgX, imgY, _id } = p;
      imgX = "" + imgX;
      imgY = "" + imgY;
      const el = Utils.querySelectorFrom(
        `[data-imgx='${imgX}'][data-imgy='${imgY}']`,
        allPieces
      )[0];
      el.dataset.pieceIdInPersistence._id;
    });
  }

  getUniqueLocalStorageKeyForPuzzle(key) {
    return this[key].replace(this.localStorageStringReplaceKey, this.puzzleId);
  }

  async save(data) {
    console.log("saving", data);
    const payload = [];
    const useLocalStorage = false;

    if (useLocalStorage) {
    } else {
      data.forEach((p) => {
        payload.push(Utils.getPieceFromElement(p));
      });
      console.log(payload);
      // const isFirstSave = !payload[0]?._id;
      fetch(`/api/pieces`, {
        method: "PUT",
        headers: {
          "Content-Type": "Application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((response) => {
          console.log(response);
          // ...successful
        })
        .catch((error) => {
          console.error(error);
          this.saveToLocalStorage();
        });
    }
  }
}
