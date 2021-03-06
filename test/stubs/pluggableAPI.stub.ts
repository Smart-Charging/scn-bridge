import { IChargeDetailRecord } from "../../src/models/scpi/cdrs";
import { CommandResponseType, CommandResultType, IAsyncCommand, ICommandResult } from "../../src/models/scpi/commands";
import { IConnector, IEvse, ILocation } from "../../src/models/scpi/locations";
import { ISession } from "../../src/models/scpi/session";
import { ITariff } from "../../src/models/scpi/tariffs";
import { IPluggableAPI } from "../../src/models/pluggableAPI";
import { testCdr, testCdrList, testLocations, testSessionList, testTariffs} from "../data/test-data";

const asyncCommandNotSupported = {
    commandResponse: {
        result: CommandResponseType.NOT_SUPPORTED,
        timeout: 0
    }
}

const asyncCommandAccepted = {
    commandResponse: {
        result: CommandResponseType.ACCEPTED,
        timeout: 10
    },
    commandResult: (): Promise<ICommandResult> => {
        return new Promise((resolve, _reject) => {
            setTimeout(() => {
                resolve({
                    result: CommandResultType.ACCEPTED
                })
            }, 20)
        })
    }
}

/**
 * Stub PluggableAPI class for testing the SCN Bridge
 */
export class PluggableAPIStub implements IPluggableAPI {
    public commands = {
        sender: {
            asyncResult(): void {
                return
            }
        },
        receiver: {
            async cancelReservation(): Promise<IAsyncCommand> {
                return asyncCommandNotSupported
            },
            async reserveNow(): Promise<IAsyncCommand> {
                return asyncCommandNotSupported
            },
            async startSession(): Promise<IAsyncCommand> {
                return asyncCommandAccepted
            },
            async stopSession(): Promise<IAsyncCommand> {
                return asyncCommandAccepted
            },
            async unlockConnector(): Promise<IAsyncCommand> {
                return asyncCommandNotSupported
            }
        }
    }
    public locations = {
        sender: {
            async getList(): Promise<ILocation[]> {
                return testLocations
            },
            async getObject(): Promise<ILocation | undefined> {
                return testLocations[0]
            },
            async getEvse(): Promise<IEvse | undefined> {
                return testLocations[0].evses && testLocations[0].evses[0]
            },
            async getConnector(): Promise<IConnector | undefined> {
                if (testLocations[0].evses && testLocations[0].evses[0]) {
                    return testLocations[0].evses[0].connectors[0]
                }
                return
            }
        }
    }
    public tariffs = {
        sender: {
            async getList(): Promise<ITariff[]> {
                return testTariffs
            }
        }
    }
    public sessions = {
        receiver: {
            update(): void {
                return
            }
        },
        sender: {
            async getList(): Promise<ISession[]> {
                return testSessionList
            }
        }
    }
    public cdrs = {
        receiver: {
            async get(): Promise<IChargeDetailRecord> {
                return testCdr
            },
            create(): void {
                return
            }
        },
        sender: {
            async getList(): Promise<IChargeDetailRecord[]> {
                return testCdrList
            }
        }
    }
}
