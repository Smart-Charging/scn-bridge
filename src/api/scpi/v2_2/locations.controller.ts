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

/**
 * SCPI 2.2 commands module controller
 */
export class LocationsController extends CustomisableController {

    /**
     * Establish routes for the commands controller
     * @param pluggableAPI inject a pluggable API object to use in request handling
     */
    public static getRoutes(pluggableAPI: IPluggableAPI, modules: IModules): Router {
        const router = Router()

        /**
         * SENDER interface
         */
        if (this.isIncluded("locations", "SENDER", modules, pluggableAPI)) {

            /**
             * GET location list
             */
            router.get("/sender/2.2/locations", async (req, res) => {
                const params = formatPaginationParams(req.query)
                const locations = await pluggableAPI.locations!.sender!.getList(params)
                res.send(ScpiResponse.withData(locations))
            })

            /**
             * Get location
             */
            router.get("/sender/2.2/locations/:id", async (req, res) => {
                const location = await pluggableAPI.locations!.sender!.getObject(req.params.id)
                if (location) {
                    res.send(ScpiResponse.withData(location))
                } else {
                    res.send(ScpiResponse.withMessage(2003, "Unknown location"))
                }
            })

            /**
             * Get EVSE
             */
            router.get("/sender/2.2/locations/:id/:evse", async (req, res) => {
                const evse = await pluggableAPI.locations!.sender!.getEvse(req.params.id, req.params.evse)
                if (evse) {
                    res.send(ScpiResponse.withData(evse))
                } else {
                    res.send(ScpiResponse.withMessage(2003, "Unknown EVSE"))
                }
            })

            /**
             * Get Connector
             */
            router.get("/sender/2.2/locations/:id/:evse/:connector", async (req, res) => {
                const connector = await pluggableAPI.locations!.sender!.getConnector(
                    req.params.id,
                    req.params.evse,
                    req.params.connector
                )
                if (connector) {
                    res.send(ScpiResponse.withData(connector))
                } else {
                    res.send(ScpiResponse.withMessage(2003, "Unknown connector"))
                }
            })

        }

        return router
    }

}
