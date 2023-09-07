import { Axios, AxiosError } from "axios";
import { Response } from "ts-protocol-extension";
/**
 * org.springframework.http.HttpMethod
 */
export var HttpMethod;
(function (HttpMethod) {
    HttpMethod["GET"] = "GET";
    HttpMethod["HEAD"] = "HEAD";
    HttpMethod["POST"] = "POST";
    HttpMethod["PUT"] = "PUT";
    HttpMethod["PATCH"] = "PATCH";
    HttpMethod["DELETE"] = "DELETE";
    HttpMethod["OPTIONS"] = "OPTIONS";
    HttpMethod["TRACE"] = "TRACE";
})(HttpMethod || (HttpMethod = {}));
export class RequestStatement {
    axios;
    config;
    axiosResponse;
    constructor(axios, config) {
        this.axios = axios;
        this.config = config;
    }
    async bodyAsEmpty() {
        const axiosResponse = await this.call();
        if (axiosResponse.status >= 200 && axiosResponse.status < 300) {
            return {
                type: Response.Type.Empty,
                metadata: {
                    acceptedAt: new Date(axiosResponse.data.acceptedAt),
                    respondedAt: new Date(axiosResponse.data.respondedAt)
                },
                result: (() => void {})()
            };
        }
        else {
            this.raiseError(axiosResponse);
        }
    }
    async bodyAsObject(ctor) {
        const axiosResponse = await this.call();
        if (axiosResponse.status >= 200 && axiosResponse.status < 300) {
            return {
                type: Response.Type.Object,
                metadata: {
                    acceptedAt: new Date(axiosResponse.data.metadata.acceptedAt),
                    respondedAt: new Date(axiosResponse.data.metadata.respondedAt)
                },
                result: ctor(axiosResponse.data.result)
            };
        }
        else {
            this.raiseError(axiosResponse);
        }
    }
    async bodyAsArray(ctor) {
        const axiosResponse = await this.call();
        if (axiosResponse.status >= 200 && axiosResponse.status < 300) {
            return {
                type: Response.Type.Array,
                metadata: {
                    acceptedAt: new Date(axiosResponse.data.metadata.acceptedAt),
                    respondedAt: new Date(axiosResponse.data.metadata.respondedAt)
                },
                result: axiosResponse.data.result.map(ctor)
            };
        }
        else {
            this.raiseError(axiosResponse);
        }
    }
    method() {
        switch (this.config.method) {
            case HttpMethod.GET: return this.axios.get;
            case HttpMethod.HEAD: return this.axios.head;
            case HttpMethod.POST: return this.axios.post;
            case HttpMethod.PUT: return this.axios.put;
            case HttpMethod.PATCH: return this.axios.patch;
            case HttpMethod.DELETE: return this.axios.delete;
            case HttpMethod.OPTIONS: return this.axios.options;
            case HttpMethod.TRACE: throw new Error('Unsupported method: TRACE');
        }
    }
    async call() {
        try {
            return await this.method()(this.config.path, this.config.config);
        }
        catch (e) {
            if (e instanceof AxiosError && e.response !== undefined) {
                this.raiseError(e.response);
            }
            else {
                throw e;
            }
        }
    }
    raiseError(axiosResponse) {
        // noinspection UnnecessaryLocalVariableJS
        const error = {
            type: Response.Type.Error,
            metadata: {
                acceptedAt: new Date(axiosResponse.data.metadata.acceptedAt),
                respondedAt: new Date(axiosResponse.data.metadata.respondedAt)
            },
            result: String(axiosResponse.data.result),
            className: String(axiosResponse.data.className),
            status: Number(axiosResponse.data.status)
        };
        throw error;
    }
}
export var AxiosInterceptors;
(function (AxiosInterceptors) {
    function convertBigIntToString(request) {
        _convertBigIntToString(request.data);
        return request;
    }
    AxiosInterceptors.convertBigIntToString = convertBigIntToString;
})(AxiosInterceptors || (AxiosInterceptors = {}));
Axios.prototype.prepare = function (config) {
    return new RequestStatement(this, config);
};
function _convertBigIntToString(o) {
    if (o === undefined || o === null) {
        return;
    }
    if (Array.isArray(o)) {
        for (const element of o) {
            _convertBigIntToString(element);
        }
    }
    else if (typeof o === 'object') {
        for (const key of Object.keys(o)) {
            const value = o[key];
            if (typeof value === 'bigint') {
                o[key] = value.toString();
            }
            else if (typeof value === 'object') {
                _convertBigIntToString(value);
            }
        }
    }
}
