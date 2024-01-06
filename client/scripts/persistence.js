import {
  LOCAL_STORAGE_PUZZLY_PROGRESS_KEY,
  LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY,
  EVENT_TYPES,
} from "./constants.js";
import Events from "./events.js";
import GroupMovable from "./GroupMovable.js";
import SingleMovable from "./SingleMovable.js";
import Utils from "./utils.js";

const PIECES_ENDPOINT = "/api/pieces";
const GROUPS_ENDPOINT = "/api/groups";

export default class PersistenceOperations {
  puzzleId;
  localStorageStringReplaceKey = "{}";

  saveQueue = [];
  pendingRequests = [];

  pollingInterval = 2000;
  currentTime = Date.now();

  constructor(config) {
    this.puzzleId = config.puzzleId;

    this.LOCAL_STORAGE_PUZZLY_PROGRESS_KEY = `Puzzly_ID${this.localStorageStringReplaceKey}_progress`;
    this.LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY = `Puzzly_ID${this.localStorageStringReplaceKey}_lastSave`;

    window.addEventListener(EVENT_TYPES.SAVE, (event) => {
      PersistenceOperations.save.call(this, event.detail);
    });
  }

  getPersistence(piecesFromServer, groupsFromServer, lastSaveTimeFromServer) {
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

    if (piecesFromServer && piecesFromServer.length) {
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
        storage.pieces = piecesFromServer;
        storage.groups - groupsFromServer;
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

  getApplicablePersistence(piecesFromServer, lastSaveTimeFromServer) {
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

    if (piecesFromServer && piecesFromServer.length) {
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
        storage.pieces = piecesFromServer;
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

  addToSaveQueue(piece) {
    this.saveQueue.push(piece);
    console.info("Added to save queue", piece, this.saveQueue);
  }

  async processSaveQueue() {
    try {
      if (this.saveQueue.length === 0) return;

      // Take a cutting of the save queue by emptying it.
      // Anything that gets added tot he queue after this
      // will go in the next batch.
      const queuedSaves = this.saveQueue.splice(0, this.saveQueue.length);

      console.info("Processing queued saves", queuedSaves);
      Events.notify(EVENT_TYPES.SAVE_IN_PROGRESS, true);

      // Execute a new request for this save and add it to the pendingRequests array
      const request = await this.save(queuedSaves);
      this.pendingRequests.push(request);

      Events.notify(EVENT_TYPES.SAVE_IN_PROGRESS, false);
    } catch (error) {
      console.warn(error);
    }
  }

  static async save(data) {
    console.log("saving", data);
    const useLocalStorage = false;

    let endpoint;
    let requestMethod;

    if (data.instanceType === "SingleMovable") {
      requestMethod = data._id ? "PUT" : "POST";
      endpoint = PIECES_ENDPOINT;
    } else if (data.instanceType === "GroupMovable") {
      requestMethod = data.remove ? "DELETE" : data._id ? "PUT" : "POST";
      endpoint = GROUPS_ENDPOINT;
    } else if (Array.isArray(data)) {
      requestMethod = "PUT";
      endpoint = PIECES_ENDPOINT;
    } else {
      return;
    }

    if (useLocalStorage) {
    } else {
      // const isFirstSave = !payload[0]?._id;
      return fetch(endpoint, {
        method: requestMethod,
        headers: {
          "Content-Type": "Application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((response) => {
          Events.notify(EVENT_TYPES.SAVE_SUCCESSFUL, response);
        })
        .catch((error) => {
          console.error(error);
          this.saveToLocalStorage();
        });
    }
  }
}
