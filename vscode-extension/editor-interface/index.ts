export interface Message {
  type: MessageType;
  payload: any;
}

export enum MessageType {
  INIT_EDITOR,
  UPDATE_DOCUMENT,
  UPDATE_EDITOR,
}
