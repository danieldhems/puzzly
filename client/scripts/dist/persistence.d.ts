import Puzzly from "./Puzzly";
import { GroupData, JigsawPieceData, LocalStorageKeys, SavedProgress, SaveStates } from "./types";
export default class PersistenceOperations {
    puzzleId: string;
    localStorageStringReplaceKey: string;
    LOCAL_STORAGE_PUZZLY_PROGRESS_KEY: string;
    LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY: string;
    saveQueue: never[];
    pendingRequests: never[];
    pollingInterval: number;
    currentTime: number;
    constructor({ puzzleId }: {
        puzzleId: Puzzly["puzzleId"];
    });
    getPersistence(piecesFromServer: JigsawPieceData[], groupsFromServer: GroupData[], lastSaveTimeFromServer: number): SavedProgress | undefined;
    getUniqueLocalStorageKeyForPuzzle(key: LocalStorageKeys): string;
    saveToLocalStorage(data: SaveStates): void;
    saveInnerPieceVisibility(visible: boolean): Promise<void>;
    isIntegration(): boolean;
    save(data: SaveStates): Promise<void>;
}
