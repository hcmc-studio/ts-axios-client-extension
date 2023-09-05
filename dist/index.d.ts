import { Axios, AxiosRequestConfig } from "axios";
import { Response } from "ts-protocol-extension";
/**
 * org.springframework.http.HttpMethod
 */
export declare enum HttpMethod {
    GET = "GET",
    HEAD = "HEAD",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS",
    TRACE = "TRACE"
}
export type RequestStatementConfig<D = any> = {
    path: string;
    method: HttpMethod;
    config: AxiosRequestConfig<D>;
};
export declare class RequestStatement {
    private axios;
    private config;
    constructor(axios: Axios, config: RequestStatementConfig);
    bodyAsEmpty(): Promise<Response.Empty>;
    bodyAsObject<T>(ctor: (o: any) => T): Promise<Response.Object<T>>;
    bodyAsArray<T>(ctor: (o: any) => T): Promise<Response.Array<T>>;
    private method;
    private call;
    private raiseError;
}
declare module "axios" {
    interface Axios {
        prepare(config: RequestStatementConfig): RequestStatement;
    }
}
