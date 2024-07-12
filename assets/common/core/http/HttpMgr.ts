import Log from "../log/Log";

type RequestMethod = "GET" | "POST";
type Header = { name: string; value: string };
type CallbackFunction = (error: Error | null, data?: any) => void;

export default class HttpMgr {
    private static _instance: HttpMgr;
    public static get instance(): HttpMgr {
        if (!this._instance) {
            this._instance = new HttpMgr();
        }
        return this._instance;
    }

    private constructor() { }

    doGet(url: string, data?: any, complete?: CallbackFunction, error?: CallbackFunction, headers?: Header[]): void {
        const queryString = this.convertData(data);
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        this.doRequest(fullUrl, "GET", complete, error, headers);
    }

    doPost(url: string, data?: FormData | object | string, complete?: CallbackFunction, error?: CallbackFunction, headers?: Header[]): void {
        let body: any = data; // 默认为原始数据
        if (!(data instanceof FormData)) {
            body = typeof data === 'string' ? data : JSON.stringify(data);
            const contentTypeHeader = {
                name: 'Content-Type',
                value: typeof data === 'string' ? 'text/plain' : 'application/json'
            };
            headers = headers ? [contentTypeHeader, ...headers] : [contentTypeHeader];
        }
        this.doRequest(url, "POST", complete, error, headers, body);
    }

    async asyncGet(url: string, data?: any, headers?: Header[]): Promise<any> {
        const queryString = this.convertData(data);
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        return this.asyncRequest(fullUrl, "GET", null, headers);
    }

    async asyncPost(url: string, data?: FormData | object | string, headers?: Header[]): Promise<any> {
        let body: any = data; // 默认为原始数据
        if (!(data instanceof FormData)) {
            body = typeof data === 'string' ? data : JSON.stringify(data);
            const contentTypeHeader = {
                name: 'Content-Type',
                value: typeof data === 'string' ? 'text/plain' : 'application/json'
            };
            headers = headers ? [contentTypeHeader, ...headers] : [contentTypeHeader];
        }
        return this.asyncRequest(url, "POST", body, headers);
    }

    private doRequest(url: string, method: RequestMethod, complete?: CallbackFunction, error?: CallbackFunction, headers?: Header[], body?: Document | XMLHttpRequestBodyInit | null): void {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);

        headers?.forEach(hdr => xhr.setRequestHeader(hdr.name, hdr.value));

        xhr.onreadystatechange = (): void => this.handleResponse(xhr, complete, error);
        xhr.onerror = (): void => this.handleError(xhr, error);
        xhr.send(body);
    }

    private async asyncRequest(url: string, method: RequestMethod, body?: Document | XMLHttpRequestBodyInit | null, headers?: Header[]): Promise<any> {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url, true);

            headers?.forEach(hdr => xhr.setRequestHeader(hdr.name, hdr.value));

            xhr.onreadystatechange = (): void => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        try {
                            resolve(this.parseResponse(xhr));
                        } catch (e) {
                            resolve(e as Error);
                        }
                    } else {
                        resolve(new Error(`Request failed with status ${xhr.status}: ${xhr.statusText}`));
                    }
                }
            };

            xhr.onerror = (): void => {
                resolve(new Error(`HTTP error, status ${xhr.status}: ${xhr.statusText}`));
            };

            xhr.send(body);
        });
    }

    private handleResponse(xhr: XMLHttpRequest, complete?: CallbackFunction, error?: CallbackFunction): void {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 400) {
                try {
                    const response = this.parseResponse(xhr);
                    complete?.(null, response);
                } catch (e) {
                    error?.(e as Error);
                }
            } else {
                error?.(new Error(`Request failed with status ${xhr.status}: ${xhr.statusText}`));
            }
        }
    }

    private handleError(xhr: XMLHttpRequest, error?: CallbackFunction): void {
        error?.(new Error(`HTTP error, status ${xhr.status}: ${xhr.statusText}`));
    }

    private parseResponse(xhr: XMLHttpRequest): any {
        const contentType = xhr.getResponseHeader('Content-Type');
        try {
            if (contentType?.includes('application/json')) {
                return JSON.parse(xhr.responseText);
            } else {
                // 对于非JSON内容, 原样返回字符串
                return xhr.responseText;
            }
        } catch (e) {
            Log.error("Failed to parse response");
        }
    }

    private convertData(data: any): string {
        if (!data) {
            return ''; // 如果没有数据，返回空字符串
        }
        return Object.keys(data)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
            .join('&');
    }
}
