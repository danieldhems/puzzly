declare global {
  interface Window {
    Puzzly: any;
    Zoom: any;
  }
}

export enum InstanceTypes {
  SingleMovable = "SingleMovable",
  GroupMovable = "GroupMovable",
  PocketMovable = "PocketMovable",
  DragAndSelectMovable = "DragAndSelectMovable",
  PlayBoundaryMovable = "PlayBoundaryMovable",
}

export interface Connection {
  type: string;
  sourceElement: HTMLDivElement;
  targetElement: HTMLDivElement;
  isSolving: boolean;
}
