import { assert } from "chai"
import { Server } from "http"
import "mocha"
import request from "supertest"
import { startServer, stopServer } from "../../../src/api/index"
import { ModuleImplementation } from "../../../src/models/bridgeConfigurationOptions"
import { testRoles } from "../../data/test-data"
import { PluggableAPIStub } from "../../stubs/pluggableAPI.stub"
import { PluggableDBStub } from "../../stubs/pluggableDB.stub"
import { PluggableRegistryStub } from "../../stubs/pluggableRegistry.stub"

describe("SCPI Versions Controller", () => {

    let app: Server

    beforeEach(async () => {
        const db = new PluggableDBStub()
        db.setTokenB("token-b")
        db.setTokenC("token-c")

        app = await startServer({
            publicBridgeURL: "http://localhost:3000/",
            scnNodeURL: "http::/localhost:3001",
            roles: testRoles,
            modules: { implementation: ModuleImplementation.ALL },
            pluggableAPI: new PluggableAPIStub(),
            pluggableDB: db,
            pluggableRegistry: new PluggableRegistryStub(),
            dryRun: true
        })
    })

    afterEach(async () => {
        await stopServer(app)
    })

    it("should return list of versions", (done) => {
        request(app)
            .get("/scpi/versions")
            .set("Authorization", "Token token-b")
            .expect(200)
            .end((err, result) => {
                if (err) {
                    done(err)
                }

                assert.equal(result.body.status_code, 1000)
                assert.deepEqual(result.body.data, [
                    {
                        version: "2.2",
                        url: "http://localhost:3000/scpi/versions/2.2"
                    }
                ])

                done()
            })
    })

    it("should return 2.2 endpoints", (done) => {
        request(app)
            .get("/scpi/versions/2.2")
            .set("Authorization", "Token token-b")
            .expect(200)
            .end((err, result) => {
                if (err) {
                    done(err)
                }

                assert.equal(result.body.status_code, 1000)
                assert.deepEqual(result.body.data, {
                    version: "2.2",
                    endpoints: [
                        {
                            identifier: "commands",
                            role: "SENDER",
                            url: "http://localhost:3000/scpi/sender/2.2/commands"
                        },
                        {
                            identifier: "locations",
                            role: "SENDER",
                            url: "http://localhost:3000/scpi/sender/2.2/locations"
                        },
                        {
                            identifier: "tariffs",
                            role: "SENDER",
                            url: "http://localhost:3000/scpi/sender/2.2/tariffs"
                        },
                        {
                            identifier: "cdrs",
                            role: "SENDER",
                            url: "http://localhost:3000/scpi/sender/2.2/cdrs"
                        },
                        {
                            identifier: "sessions",
                            role: "SENDER",
                            url: "http://localhost:3000/scpi/sender/2.2/sessions"
                        },
                        {
                            identifier: "commands",
                            role: "RECEIVER",
                            url: "http://localhost:3000/scpi/receiver/2.2/commands"
                        },
                        {
                            identifier: "sessions",
                            role: "RECEIVER",
                            url: "http://localhost:3000/scpi/receiver/2.2/sessions"
                        },
                        {
                            identifier: "cdrs",
                            role: "RECEIVER",
                            url: "http://localhost:3000/scpi/receiver/2.2/cdrs"
                        }
                    ]
                })

                done()
            })
    })

})
