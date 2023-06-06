
/**
 * dkal-app-utils v1.0.1
 * (c) 1990-2023 anliu-space
 * Released under the MIT License.
 */

import { b_ as SimpleWorkerServer, bm as EditorSimpleWorker } from '../../../../editorSimpleWorker-bc140aa4.es.js';

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
let initialized = false;
function initialize(foreignModule) {
    if (initialized) {
        return;
    }
    initialized = true;
    const simpleWorker = new SimpleWorkerServer((msg) => {
        self.postMessage(msg);
    }, (host) => new EditorSimpleWorker(host, foreignModule));
    self.onmessage = (e) => {
        simpleWorker.onmessage(e.data);
    };
}
self.onmessage = (e) => {
    // Ignore first message in this case and initialize if not yet initialized
    if (!initialized) {
        initialize(null);
    }
};

export { initialize };
//# sourceMappingURL=editor.worker.js.map
