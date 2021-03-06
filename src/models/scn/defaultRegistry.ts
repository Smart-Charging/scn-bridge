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

import { Registry } from "@smartcharging/scn-registry"
import { Role } from "@smartcharging/scn-registry/dist/types";
import { IPluggableRegistry } from "./pluggableRegistry";

export class DefaultRegistry implements IPluggableRegistry {

    private signer: string
    private spender?: string
    private registry: Registry

    constructor(environment: string) {
        if (!process.env.SIGNER_KEY) {
            throw Error("No SIGNER_KEY environment variable provided.")
        }
        this.signer = process.env.SIGNER_KEY
        this.spender = process.env.SPENDER_KEY
        this.registry = new Registry(environment, this.spender || this.signer)
    }

    public async getNode(countryCode: string, partyID: string): Promise<{ operator: string; url: string; }> {
        const party = await this.registry.getPartyByScpi(countryCode, partyID)
        return party ? party.node : { operator: "0x0000000000000000000000000000000000000000", url: "" }

    }

    public async setParty(countryCode: string, partyID: string, roles: Role[], operator: string): Promise<boolean> {
        if (this.spender) {
            await this.registry.setPartyRaw(countryCode, partyID, roles, operator, this.signer)
        } else {
            await this.registry.setParty(countryCode, partyID, roles, operator)
        }
        return true
    }

}
