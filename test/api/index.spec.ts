import { assert } from "chai"
import { Server } from "http"
import "mocha"
import fetch from "node-fetch"
import { startServer, stopServer } from "../../src/api/index"
import { ModuleImplementation } from "../../src/models/bridgeConfigurationOptions"
import { testRoles } from "../data/test-data"
import { PluggableAPIStub } from "../stubs/pluggableAPI.stub"
import { PluggableDBStub } from "../stubs/pluggableDB.stub"
import { PluggableRegistryStub } from "../stubs/pluggableRegistry.stub"

describe("API context", () => {

    let app: Server

    beforeEach(async () => {
        app = await startServer({
            publicBridgeURL: "http://localhost:3000",
            scnNodeURL: "http://localhost:3001",
            roles: testRoles,
            modules: {
                implementation: ModuleImplementation.ALL
            },
            pluggableAPI: new PluggableAPIStub(),
            pluggableDB: new PluggableDBStub(),
            pluggableRegistry: new PluggableRegistryStub(),
            dryRun: true
        })
    })

    afterEach(async () => {
        await stopServer(app)
    })

    it("should load", async () => {
        const result = await fetch("http://localhost:3000")

        const got = await result.text()
        const want = "SCN Bridge v0.1.0"

        assert.equal(got, want)
    })

})
