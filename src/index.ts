import {Axios, AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";
import {Response} from "ts-protocol-extension";

type AxiosRequestMethod = {
    <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>
}

/**
 * org.springframework.http.HttpMethod
 */
export enum HttpMethod {
    GET = 'GET',
    HEAD = 'HEAD',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
    OPTIONS = 'OPTIONS',
    TRACE = 'TRACE'
}

export type StringValue = {
    name: string
    value: string
}

export type RequestStatementConfig<D = any> = {
    path: string
    method: HttpMethod
    config?: AxiosRequestConfig<D>
}

export class RequestStatement {
    private axios: Axios
    private config: RequestStatementConfig
    private axiosResponse?: AxiosResponse<any, any>

    constructor(axios: Axios, config: RequestStatementConfig) {
        this.axios = axios
        this.config = config
    }

    async bodyAsEmpty(): Promise<Response.Empty> {
        const axiosResponse = await this.call()
        if (axiosResponse.status >= 200 && axiosResponse.status < 300) {
            return {
                type: Response.Type.Empty,
                metadata: {
                    acceptedAt: new Date(axiosResponse.data.acceptedAt),
                    respondedAt: new Date(axiosResponse.data.respondedAt)
                },
                result: (() => void {})()
            }
        } else {
            this.raiseError(axiosResponse)
        }
    }

    async bodyAsObject<T>(ctor: (o: any) => T): Promise<Response.Object<T>> {
        const axiosResponse = await this.call()
        if (axiosResponse.status >= 200 && axiosResponse.status < 300) {
            return {
                type: Response.Type.Object,
                metadata: {
                    acceptedAt: new Date(axiosResponse.data.metadata.acceptedAt),
                    respondedAt: new Date(axiosResponse.data.metadata.respondedAt)
                },
                result: ctor(axiosResponse.data.result)
            }
        } else {
            this.raiseError(axiosResponse)
        }
    }

    async bodyAsArray<T>(ctor: (o: any) => T): Promise<Response.Array<T>> {
        const axiosResponse = await this.call()
        if (axiosResponse.status >= 200 && axiosResponse.status < 300) {
            return {
                type: Response.Type.Array,
                metadata: {
                    acceptedAt: new Date(axiosResponse.data.metadata.acceptedAt),
                    respondedAt: new Date(axiosResponse.data.metadata.respondedAt)
                },
                result: axiosResponse.data.result.map(ctor)
            }
        } else {
            this.raiseError(axiosResponse)
        }
    }

    private method(): AxiosRequestMethod {
        switch (this.config.method) {
            case HttpMethod.GET: return this.axios.get
            case HttpMethod.HEAD: return this.axios.head
            case HttpMethod.POST: return this.axios.post
            case HttpMethod.PUT: return this.axios.put
            case HttpMethod.PATCH: return this.axios.patch
            case HttpMethod.DELETE: return this.axios.delete
            case HttpMethod.OPTIONS: return this.axios.options
            case HttpMethod.TRACE: throw new Error('Unsupported method: TRACE')
        }
    }

    private async call(): Promise<AxiosResponse<any, any>> {
        try {
            return await this.method()(this.config.path, this.config.config)
        } catch (e: any) {
            if (e instanceof AxiosError && e.response !== undefined) {
                this.raiseError(e.response)
            } else {
                throw e
            }
        }
    }

    private raiseError(axiosResponse: AxiosResponse<any, any>): never {
        // noinspection UnnecessaryLocalVariableJS
        const error: Response.Error = {
            type: Response.Type.Error,
            metadata: {
                acceptedAt: new Date(axiosResponse.data.metadata.acceptedAt),
                respondedAt: new Date(axiosResponse.data.metadata.respondedAt)
            },
            result: String(axiosResponse.data.result),
            className: String(axiosResponse.data.className),
            status: Number(axiosResponse.data.status)
        }

        throw error
    }
}

declare module "axios" {
    interface Axios {
        prepare(config: RequestStatementConfig): RequestStatement
    }
}

Axios.prototype.prepare = function (config: RequestStatementConfig): RequestStatement {
    return new RequestStatement(this, config)
}