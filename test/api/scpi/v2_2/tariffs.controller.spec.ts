import { assert } from "chai"
import { Server } from "http"
import "mocha"
import request from "supertest"
import { startServer, stopServer } from "../../../../src/api/index"
import { ModuleImplementation } from "../../../../src/models/bridgeConfigurationOptions"
import { testRoles, testTariffs } from "../../../data/test-data"
import { startNode } from "../../../mock/scn-node"
import { PluggableAPIStub } from "../../../stubs/pluggableAPI.stub"
import { PluggableDBStub } from "../../../stubs/pluggableDB.stub"
import { PluggableRegistryStub } from "../../../stubs/pluggableRegistry.stub"

describe("SCPI Tariffs Controller", () => {

    let app: Server

    let scnNode: Server

    beforeEach(async () => {
        const db = new PluggableDBStub()
        db.setTokenB("token-b")
        db.setTokenC("token-c")

        app = await startServer({
            publicBridgeURL: "http://localhost:3000",
            scnNodeURL: "http://localhost:3001",
            roles: testRoles,
            modules: {
                implementation: ModuleImplementation.CUSTOM,
                sender: ["tariffs"],
                receiver: []
            },
            pluggableAPI: new PluggableAPIStub(),
            pluggableDB: db,
            pluggableRegistry: new PluggableRegistryStub(),
            dryRun: true
        })

        scnNode = await startNode(3001)
    })

    afterEach(async () => {
        await stopServer(app)
        await stopServer(scnNode)
    })

    context("Sender interface", () => {

        it("should return list of tariffs", (done) => {

            request(app)
                .get("/scpi/sender/2.2/tariffs")
                .set("Authorization", "Token token-b")
                .set("X-Request-ID", "123")
                .set("X-Correlation-ID", "456")
                .set("SCPI-From-Country-Code", "DE")
                .set("SCPI-From-Party-Id", "MSP")
                .set("SCPI-To-Country-Code", "DE")
                .set("SCPI-To-Party-Id", "CPO")
                .send()
                .expect(200)
                .end((err, result) => {
                    if (err) {
                        return done(err)
                    }

                    assert.equal(result.body.status_code, 1000)
                    assert.deepEqual(result.body.data, testTariffs)
                    done()
                })
        })
    })
})
