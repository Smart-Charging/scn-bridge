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
import { formatPaginationParams } from "../../../tools/tools"
import { CustomisableController } from "../advice/customisable"

export class TariffsController extends CustomisableController {

    public static getRoutes(pluggableAPI: IPluggableAPI, modules: IModules): Router {
        const router = Router()

        /**
         * SENDER interface
         */
        if (this.isIncluded("tariffs", "SENDER", modules, pluggableAPI)) {

            /**
             * GET tariffs list
             */
            router.get("/sender/2.2/tariffs", async (req, res) => {
                const params = formatPaginationParams(req.query)
                const tariffs = await pluggableAPI.tariffs!.sender!.getList(params)
                res.send(ScpiResponse.withData(tariffs))
            })

        }

        return router;
    }
}
