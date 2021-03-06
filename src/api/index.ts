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
import * as bodyParser from "body-parser"
import express, { Router } from "express"
import { Server } from "http"
import morgan from "morgan"
import { IBridgeConfigurationOptions } from "../models/bridgeConfigurationOptions"
import { PushService } from "../services/push.service"
import { RegistrationService } from "../services/registration.service"
import { stripVersions } from "../tools/tools"
import { isAuthorized } from "./scpi/middleware/middleware"
// import controllers
import { CdrsController } from "./scpi/v2_2/cdrs.controller"
import { CommandsController } from "./scpi/v2_2/commands.controller"
import { LocationsController } from "./scpi/v2_2/locations.controller"
import { SessionsController } from "./scpi/v2_2/sessions.controller"
import { TariffsController } from "./scpi/v2_2/tariffs.controller"
import { VersionsController } from "./scpi/versions.controller"

// set basic home route
const homeController = Router()
homeController.get("/", async (_, res) => {
    res.send("SCN Bridge v0.1.0")
})

/**
 * Bootstrap a new SCN Bridge server with SCPI interface. Will attempt to register on start.
 * @param options an object of configuration options (must implement IBridgeConfigurationOptions)
 * @returns a promise resolving with the newly created http.Server
 */
export const startServer = async (options: IBridgeConfigurationOptions): Promise<Server> => {

    const app = express()
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())

    if (options.logger) {
        app.use(morgan("dev"))
    }

    app.use(homeController)

    const pushService = new PushService(options.pluggableDB)

    app.use(
        "/scpi/",
        isAuthorized(options.pluggableDB),
        VersionsController.getRoutes(options.publicBridgeURL, options.modules),
        CommandsController.getRoutes(options.pluggableAPI, options.pluggableDB, options.modules, pushService),
        LocationsController.getRoutes(options.pluggableAPI, options.modules),
        TariffsController.getRoutes(options.pluggableAPI, options.modules),
        SessionsController.getRoutes(options.pluggableAPI, options.modules),
        CdrsController.getRoutes(options.publicBridgeURL, options.pluggableAPI, options.modules)
    )

    return new Promise(async (resolve, reject) => {
        const server = app.listen(options.port || 3000, async (err?: Error) => {

            if (!options.dryRun) {
                const registrationService = new RegistrationService(options.pluggableRegistry, options.pluggableDB)

                await registrationService.register(
                    options.publicBridgeURL,
                    stripVersions(options.scnNodeURL),
                    options.roles
                )
            }

            err ? reject(err) : resolve(server)
        })
    })
}

/**
 * Stop a http.Server
 * @param app the http.Server created during bootstrapping
 */
export const stopServer = async (app: Server) => {
    return new Promise((resolve, reject) => {
        app.close((err?: Error) => {
            err ? reject(err) : resolve()
        })
    })
}
