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
import { sendCdrFunc, sendSessionFunc } from "../services/push.service";
import { IChargeDetailRecord } from "./scpi/cdrs";
import { IAsyncCommand, ICommandResult } from "./scpi/commands";
import { IPaginationParams } from "./scpi/common";
import { IConnector, IEvse, ILocation } from "./scpi/locations";
import { ISession } from "./scpi/session";
import { ITariff } from "./scpi/tariffs";
import { IToken } from "./scpi/tokens";

export interface IReserveNow {
    token: IToken
    expiry_date: string
    reservation_id: string
    location_id: string
    evse_uid?: string
    connector_id?: string
}

export interface IStartSession {
    token: IToken
    location_id: string
    evse_uid?: string
    connector_id?: string
}

export interface IPluggableAPI {
    commands?: {
        sender?: {
            asyncResult(command: string, uid: string, result: ICommandResult): void
        },
        receiver?: {
            cancelReservation(reservationID: string): Promise<IAsyncCommand>
            reserveNow(request: IReserveNow): Promise<IAsyncCommand>
            startSession(request: IStartSession, sendSession: sendSessionFunc, sendCdr: sendCdrFunc): Promise<IAsyncCommand>
            stopSession(sessionID: string): Promise<IAsyncCommand>
            unlockConnector(locationID: string, evseUID: string, connectorID: string): Promise<IAsyncCommand>
        }
    }
    locations?: {
        sender?: {
            getList(pagination?: IPaginationParams): Promise<ILocation[]>
            getObject(id: string): Promise<ILocation | undefined>
            getEvse(locationID: string, evseUID: string): Promise<IEvse | undefined>
            getConnector(locationID: string, evseUID: string, connectorID: string): Promise<IConnector | undefined>
        }
    }
    tariffs?: {
        sender?: {
            getList(IPaginationParams?: IPaginationParams): Promise<ITariff[]>
        }
    }
    sessions?: {
        receiver?: {
            update(session: ISession): void
        }
        sender?: {
            getList(IPaginationParams?: IPaginationParams): Promise<ISession[]>
        }
    }
    cdrs?: {
        receiver?: {
            get(id: string): Promise<IChargeDetailRecord | undefined>
            create(cdr: IChargeDetailRecord): void
        }
        sender?: {
            getList(IPaginationParams?: IPaginationParams): Promise<IChargeDetailRecord[]>
        }
    }
}
