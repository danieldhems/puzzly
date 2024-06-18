import { EVENT_TYPES } from "./constants";
import Puzzly from "./Puzzly";
import {
  GroupData,
  GroupMovableSaveState,
  InstanceTypes,
  JigsawPieceData,
  LocalStorageKeys,
  SavedProgress,
  SaveStates,
} from "./types";

const PIECES_ENDPOINT = "/api/pieces";
const GROUPS_ENDPOINT = "/api/groups";

export default class PersistenceOperations {
  puzzleId;
  localStorageStringReplaceKey = "{}";

  LOCAL_STORAGE_PUZZLY_PROGRESS_KEY: string;
  LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY: string;

  saveQueue = [];
  pendingRequests = [];

  pollingInterval = 2000;
  currentTime = Date.now();

  constructor({ puzzleId }: { puzzleId: Puzzly["puzzleId"] }) {
    this.puzzleId = puzzleId;

    this.LOCAL_STORAGE_PUZZLY_PROGRESS_KEY = `Puzzly_ID${this.localStorageStringReplaceKey}_progress`;
    this.LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY = `Puzzly_ID${this.localStorageStringReplaceKey}_lastSave`;

    window.addEventListener(EVENT_TYPES.SAVE, (event: CustomEvent) => {
      this.save(event.detail);
    });
  }

  getPersistence(
    piecesFromServer: JigsawPieceData[],
    groupsFromServer: GroupData[],
    lastSaveTimeFromServer: number
  ) {
    const progressKey = this.getUniqueLocalStorageKeyForPuzzle(
      LocalStorageKeys.Progress
    );
    const lastSaveKey = this.getUniqueLocalStorageKeyForPuzzle(
      LocalStorageKeys.LastSave
    );
    const hasLocalStorageSupport = window.localStorage;
    const progressInLocalStorage =
      hasLocalStorageSupport && localStorage.getItem(progressKey);
    const lastSaveInLocalStorage =
      hasLocalStorageSupport && localStorage.getItem(lastSaveKey);

    let availableStorage;
    const storage = {
      pieces: [],
      groups: [],
      latestSave: 0,
    } as SavedProgress;

    if (!lastSaveTimeFromServer && !lastSaveInLocalStorage) {
      console.info("Puzzly: No saved data found");
      return;
    }

    if (piecesFromServer && piecesFromServer.length) {
      if (
        lastSaveInLocalStorage &&
        parseInt(lastSaveInLocalStorage) > lastSaveTimeFromServer
      ) {
        availableStorage = "local";
      } else {
        availableStorage = "server";
      }
    } else if (lastSaveInLocalStorage && progressInLocalStorage?.length) {
      availableStorage = "local";
    }

    switch (availableStorage) {
      case "server":
        console.info(`[Puzzly] Restoring from server-side storage`);
        storage.pieces = piecesFromServer;
        storage.groups = groupsFromServer;
        storage.latestSave = lastSaveTimeFromServer;
        break;
      case "local":
        if (progressInLocalStorage && lastSaveInLocalStorage) {
          console.info(`[Puzzly] Restoring from local storage`);
          storage.pieces = JSON.parse(progressInLocalStorage);
          storage.latestSave = parseInt(lastSaveInLocalStorage);
        }
        break;
    }

    return storage;
  }

  getUniqueLocalStorageKeyForPuzzle(key: LocalStorageKeys) {
    return this[key].replace(this.localStorageStringReplaceKey, this.puzzleId);
  }

  saveToLocalStorage(data: SaveStates) {
    let time = Date.now();

    const progressKey = this.getUniqueLocalStorageKeyForPuzzle(
      LocalStorageKeys.Progress
    );
    const lastSaveKey = this.getUniqueLocalStorageKeyForPuzzle(
      LocalStorageKeys.LastSave
    );

    console.info(`[Puzzly] Saving to local storage, key ${progressKey}:`, data);
    localStorage.setItem(progressKey, JSON.stringify(data));
    console.info(`[Puzzly] Saving to local storage, key ${lastSaveKey}:`, time);
    localStorage.setItem(lastSaveKey, time.toString());
  }

  async saveInnerPieceVisibility(visible: boolean) {
    fetch(`/api/toggleVisibility/${this.puzzleId}`, {
      method: "put",
      headers: {
        "Content-Type": "Application/json",
      },
      body: JSON.stringify({ piecesVisible: visible }),
    });
  }

  isIntegration() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("integration") === "true";
  }

  async save(data: SaveStates) {
    console.log("saving", data);
    const useLocalStorage = false;

    let endpoint;
    let requestMethod;

    if (data.instanceType === InstanceTypes.SingleMovable) {
      requestMethod = data._id ? "PUT" : "POST";
      endpoint = PIECES_ENDPOINT;
    } else if (data.instanceType === InstanceTypes.GroupMovable) {
      requestMethod = (data as GroupMovableSaveState).remove
        ? "DELETE"
        : data._id
          ? "PUT"
          : "POST";
      endpoint = GROUPS_ENDPOINT;
    } else if (Array.isArray(data)) {
      requestMethod = "PUT";
      endpoint = PIECES_ENDPOINT;
    } else {
      return;
    }

    data.integration = this.isIntegration();

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
          window.dispatchEvent(
            new CustomEvent(EVENT_TYPES.SAVE_SUCCESSFUL, { detail: response })
          );
        })
        .catch((error) => {
          console.error(error);
          this.saveToLocalStorage(data);
        });
    }
  }
}
