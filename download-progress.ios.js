"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("tns-core-modules/file-system");
var utils = require("tns-core-modules/utils/utils");
var common = require("tns-core-modules/http/http-request/http-request-common");
var getter = utils.ios.getter;
var currentDevice = utils.ios.getter(UIDevice, UIDevice.currentDevice);
var device = currentDevice.userInterfaceIdiom === 0 /* Phone */
    ? "Phone"
    : "Pad";
var osVersion = currentDevice.systemVersion;
var USER_AGENT_HEADER = "User-Agent";
var USER_AGENT = "Mozilla/5.0 (i" + device + "; CPU OS " + osVersion.replace(".", "_") + " like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/" + osVersion + " Mobile/10A5355d Safari/8536.25";
var sessionConfig = getter(NSURLSessionConfiguration, NSURLSessionConfiguration.defaultSessionConfiguration);
var queue = getter(NSOperationQueue, NSOperationQueue.mainQueue);
var DownloadProgress = /** @class */ (function (_super) {
    __extends(DownloadProgress, _super);
    function DownloadProgress() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DownloadProgress.prototype.addProgressCallback = function (callback) {
        this.progressCallback = callback;
    };
    DownloadProgress.prototype.downloadFile = function (url, options, destinationFilePath) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.promiseResolve = resolve;
            _this.promiseReject = reject;
            try {
                if (destinationFilePath) {
                    _this.destinationFile = fs.File.fromPath(destinationFilePath);
                }
                else {
                    _this.destinationFile = fs.File.fromPath(common.getFilenameFromUrl(url));
                }
                _this.destinationFile.writeTextSync("", function (e) {
                    throw e;
                });
                var urlRequest = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url));
                urlRequest.setValueForHTTPHeaderField(USER_AGENT, USER_AGENT_HEADER);
                if (options) {
                    var method = options.method, headers = options.headers;
                    if (method) {
                        urlRequest.HTTPMethod = method;
                    }
                    if (headers) {
                        for (var key in headers) {
                            urlRequest.setValueForHTTPHeaderField(headers[key], key);
                        }
                    }
                }
                else {
                    urlRequest.HTTPMethod = "GET";
                }
                var session = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(sessionConfig, _this, queue);
                var dataTask = session.dataTaskWithRequest(urlRequest);
                dataTask.resume();
            }
            catch (ex) {
                reject(ex);
            }
        });
    };
    DownloadProgress.prototype.URLSessionDataTaskDidReceiveResponseCompletionHandler = function (session, dataTask, response, completionHandler) {
        completionHandler(1 /* Allow */);
        this.urlResponse = response;
    };
    DownloadProgress.prototype.URLSessionDataTaskDidReceiveData = function (session, dataTask, data) {
        var fileHandle = NSFileHandle.fileHandleForWritingAtPath(this.destinationFile.path);
        fileHandle.seekToEndOfFile();
        fileHandle.writeData(data);
        var progress = ((100.0 / this.urlResponse.expectedContentLength) *
            fileHandle.seekToEndOfFile()) /
            100;
        if (this.progressCallback) {
            this.progressCallback(progress);
        }
        fileHandle.closeFile();
    };
    DownloadProgress.prototype.URLSessionTaskDidCompleteWithError = function (session, task, error) {
        if (error) {
            this.promiseReject(error);
        }
        else {
            this.promiseResolve(this.destinationFile);
        }
    };
    DownloadProgress.ObjCProtocols = [NSURLSessionDataDelegate];
    return DownloadProgress;
}(NSObject));
exports.DownloadProgress = DownloadProgress;
