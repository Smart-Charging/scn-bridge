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
import { IncomingHttpHeaders } from "http";
import fetch from "node-fetch";
import { IChargeDetailRecord } from "../models/scpi/cdrs";
import { IResponse } from "../models/scpi/common";
import { ISession } from "../models/scpi/session";
import { IPluggableDB } from "../models/pluggableDB";
import { setResponseHeaders } from "../tools/tools";

export type sendSessionFunc = (session: ISession) => Promise<IResponse<any>>
export type sendCdrFunc = (cdr: IChargeDetailRecord) => Promise<IResponse<any>>

export class PushService {

    constructor(private db: IPluggableDB) {}

    /**
     * Prepare push updates for a particular session
     * @param headers incoming request headers used for response routing
     * @returns anonymous function which sends the session to the request's sender
     */
    public prepareSessionUpdate(headers: IncomingHttpHeaders): sendSessionFunc {
        return async (session) => {
            const endpoint = await this.db.getEndpoint("sessions", "RECEIVER")
            const path = `/${headers["scpi-to-country-code"]}/${headers["scpi-to-party-id"]}/${session.id}`
            const token = await this.db.getTokenC()

            const response = await fetch(endpoint + path, {
                method: "PUT",
                headers: Object.assign({
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                }, setResponseHeaders(headers)),
                body: JSON.stringify(session)
            })
            return response.json()
        }
    }

    /**
     * Prepare a push charge detail record request for a particular session
     * @param headers incoming request headers used for response routing
     * @returns anonymous function which sends the cdr to the request's sender
     */
    public prepareCDR(headers: IncomingHttpHeaders): sendCdrFunc {
        return async (cdr) => {
            const endpoint = await this.db.getEndpoint("cdrs", "RECEIVER")
            const token = await this.db.getTokenC()
            const response = await fetch(endpoint, {
                method: "POST",
                headers: Object.assign({
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                }, setResponseHeaders(headers)),
                body: JSON.stringify(cdr)
            })
            return response.json()
        }
    }
}
