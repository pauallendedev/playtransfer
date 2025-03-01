export type PlaylistProgress = {
  progress: number;
  status: string;
  missingTracks?: string[];
};

const transferStatus: Record<string, PlaylistProgress> = {};

export function setTransferStatus(playlistId: string, data: PlaylistProgress) {
  transferStatus[playlistId] = data;
}

export function getTransferStatus() {
  return transferStatus;
}

export function resetTransferStatus() {
  for (const key in transferStatus) {
    delete transferStatus[key];
  }
}
