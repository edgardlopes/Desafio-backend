export enum FileStatus {
  WAITING_FOR_PROCESS = 1,
  PROCESSING = 2,
  PROCESSED = 3,
  ERROR_ON_PROCESS = 4,
}

export type File = {
  id?: number;
  fileName: string;
  status: FileStatus;
};
