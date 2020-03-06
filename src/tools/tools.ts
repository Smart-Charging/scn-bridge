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
import { Response } from "express"
import { IncomingHttpHeaders } from "http"
import * as uuid from "uuid"
import { IHeaders, IPaginationParams, ScpiResponse } from "../models/scpi/common"

export const stripVersions = (url: string): string => {
    if (url.endsWith("/scpi/versions")) {
        return url.replace("/scpi/versions", "")
    }
    return url
}

/**
 * Creates SCPI headers with new request/correlation IDs and reversed SCPI-From/To values
 * @param req express request object
 * @returns IHeaders object
 */
export const setResponseHeaders = (requestHeaders: IncomingHttpHeaders): IHeaders => {
    return {
        "X-Request-ID": uuid.v4(),
        "X-Correlation-ID": uuid.v4(),
        "SCPI-From-Country-Code": requestHeaders["scpi-to-country-code"] as string,
        "SCPI-From-Party-Id": requestHeaders["scpi-to-party-id"] as string,
        "SCPI-To-Country-Code": requestHeaders["scpi-from-country-code"] as string,
        "SCPI-To-Party-Id": requestHeaders["scpi-from-party-id"] as string
    }
}

/**
 * Format pagination url encoded params
 */
export const formatPaginationParams = (params: any): IPaginationParams => {
    const pagination: { [key: string]: any } = {}
    if (params.date_from) {
        pagination.date_from = params.date_from
    }
    if (params.date_to) {
        pagination.date_to = params.date_to
    }
    if (params.offset) {
        pagination.offset = parseInt(params.offset, 10)
    }
    if (params.limit) {
        pagination.limit = parseInt(params.limit, 10)
    }
    return pagination
}

export const wrapApiMethod = async (instructions: () => Promise<Response>, res: Response): Promise<Response> => {
    try {
        return instructions()
    } catch (err) {
        if (err.status_code) {
            return res.send(ScpiResponse.withMessage(err.status_code, err.status_message))
        }
        return res.send(ScpiResponse.withMessage(3000, err.message))
    }
}
