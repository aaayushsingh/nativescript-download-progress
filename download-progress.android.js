"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("tns-core-modules/file-system");
var DownloadProgress = /** @class */ (function () {
    function DownloadProgress() {
    }
    DownloadProgress.prototype.addProgressCallback = function (callback) {
        this.progressCallback = callback;
    };
    DownloadProgress.prototype.downloadFile = function (url, options, destinationFilePath) {
        var _this = this;
        var worker;
        if (global["TNS_WEBPACK"]) {
            var WorkerScript = require("nativescript-worker-loader!./android-worker.js");
            worker = new WorkerScript();
        }
        else {
            worker = new Worker("./android-worker.js");
        }
        return new Promise(function (resolve, reject) {
            _this.promiseResolve = resolve;
            _this.promiseReject = reject;
            worker.postMessage({
                url: url,
                options: options,
                destinationFilePath: destinationFilePath
            });
            worker.onmessage = function (msg) {
                if (msg.data.progress) {
                    if (_this.progressCallback) {
                        _this.progressCallback(msg.data.progress);
                    }
                }
                else if (msg.data.filePath) {
                    worker.terminate();
                    _this.promiseResolve(fs.File.fromPath(msg.data.filePath));
                }
                else {
                    worker.terminate();
                    _this.promiseReject(msg.data.error);
                }
            };
            worker.onerror = function (err) {
                console.log("An unhandled error occurred in worker: " + err.filename + ", line: " + err.lineno + " :");
                _this.promiseReject(err.message);
            };
        });
    };
    return DownloadProgress;
}());
exports.DownloadProgress = DownloadProgress;
