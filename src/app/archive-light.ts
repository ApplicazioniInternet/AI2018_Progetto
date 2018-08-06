export class ArchiveLight {
  archiveId: String = undefined;
  bought: boolean = undefined;

  constructor(archiveId: String, bought: boolean) {
    this.archiveId = archiveId;
    this.bought = bought;
  }
}
