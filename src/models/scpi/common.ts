/*
    Copyright 2020 Smart Charging Solutions

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
export type identifier = "commands" | "locations" | "tariffs" | "sessions" | "cdrs"
export type role = "SENDER" | "RECEIVER"

export interface IEndpoint {
    identifier: string
    role: string
    url: string
}

export interface IHeaders {
    "X-Request-ID": string
    "X-Correlation-ID": string
    "SCPI-From-Country-Code": string
    "SCPI-From-Party-Id": string
    "SCPI-To-Country-Code": string
    "SCPI-To-Party-Id": string
}

export interface IPaginationParams {
    date_from?: string
    date_to?: string
    offset?: number
    limit?: number
}

export interface IResponse<T> {
    status_code: number
    status_message?: string
    data?: T
}

export class ScpiResponse implements IResponse<any> {

    public static basicSuccess(): ScpiResponse {
        return new ScpiResponse({status_code: 1000})
    }

    public static withData(data: any): ScpiResponse {
        return new ScpiResponse({status_code: 1000, data})
    }

    public static withMessage(status_code: number, status_message: string): ScpiResponse {
        return new ScpiResponse({status_code, status_message})
    }

    public status_code: number
    public status_message?: string
    public data?: any
    public timestamp: Date

    constructor(options: IResponse<any>) {
        this.status_code = options.status_code
        this.status_message = options.status_message
        this.data = options.data
        this.timestamp = new Date()

    }

}

export class ScpiError extends Error {
    constructor(public status_code: number, public status_message: string) {
        super()
    }
}

export interface IDisplayText {
    language: string
    text: string
}

export interface IBusinessDetails {
    name: string
    website?: string
    logo?: IImage
}

export interface IImage {
    url: string
    thumbnail: string
    category: string
    type: string
    width?: number
    height?: number
}
