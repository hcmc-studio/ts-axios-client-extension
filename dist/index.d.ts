import { Axios, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
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
export type StringValue = {
    name: string;
    value: string;
};
export type RequestStatementConfig<D = any> = {
    path: string;
    method: HttpMethod;
    config?: AxiosRequestConfig<D>;
};
export declare class RequestStatement {
    private axios;
    private config;
    constructor(axios: Axios, config: RequestStatementConfig);
    bodyAsEmpty(): Promise<Response.Empty>;
    bodyAsObject<T>(ctor: (o: any) => T): Promise<Response.Object<T>>;
    bodyAsArray<T>(ctor: (o: any) => T): Promise<Response.Array<T>>;
    private call;
    private raiseError;
}
export declare namespace AxiosInterceptors {
    function convertBigIntToString<D>(request: InternalAxiosRequestConfig<D>): InternalAxiosRequestConfig<D>;
}
declare module "axios" {
    interface Axios {
        prepare(config: RequestStatementConfig): RequestStatement;
    }
}
