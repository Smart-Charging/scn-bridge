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
import { Router } from "express"
import { IModules } from "../../../models/bridgeConfigurationOptions"
import { ScpiResponse } from "../../../models/scpi/common"
import { IPluggableAPI } from "../../../models/pluggableAPI"
import { formatPaginationParams, wrapApiMethod } from "../../../tools/tools"
import { CustomisableController } from "../advice/customisable"

export class SessionsController extends CustomisableController {

    public static getRoutes(pluggableAPI: IPluggableAPI, modules: IModules): Router {
        const router = Router()

        /**
         * RECEIVER interface
         */
        if (this.isIncluded("sessions", "RECEIVER", modules, pluggableAPI)) {

            /**
             * PUT session
             */
            router.put("/receiver/2.2/sessions/:country_code/:party_id/:session_id", async (req, res) => {
                pluggableAPI.sessions!.receiver!.update(req.body)
                res.send(ScpiResponse.basicSuccess())
            })

        }

        if (this.isIncluded("sessions", "SENDER", modules, pluggableAPI)) {
            /**
             * GET cdrs list
             */
            router.get("/sender/2.2/sessions", async (req, res) => {
                await wrapApiMethod(async () => {
                    const params = formatPaginationParams(req.query)
                    if (!params.date_from) {
                        return res.send(ScpiResponse.withMessage(2001, "Missing date_from parameter"))
                    }
                    const cdrs = await pluggableAPI.sessions!.sender!.getList(params)
                    return res.send(ScpiResponse.withData(cdrs))
                }, res)
            })
        }

        return router;
    }
}
