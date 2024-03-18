export type UIDPayload = {
  UID: string;
};

export type LogRequestBody = UIDPayload & {
  log: Record<string, any>;
};
