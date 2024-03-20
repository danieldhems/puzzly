export default class Sounds {
    soundsBtn: HTMLElement | null;
    soundsBtnOnLabel: HTMLSpanElement | null;
    soundsBtnOffLabel: HTMLSpanElement | null;
    soundsEnabled: boolean;
    pieceConnectionSound: HTMLAudioElement;
    constructor();
    attachEvents(): void;
    toggleSounds(): void;
    playPieceConnectionSound(): void;
}
