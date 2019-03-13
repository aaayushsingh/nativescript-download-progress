import * as fs from "tns-core-modules/file-system";

export declare class DownloadProgress {
  constructor();
  addProgressCallback(callback: any);
  downloadFile(
    url: string,
    options: any,
    destinationFilePath?: string
  ): Promise<fs.File>;
}
