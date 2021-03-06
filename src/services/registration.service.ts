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

import { Role } from "@smartcharging/scn-registry/dist/types";
import { utils } from "ethers";
import fetch from "node-fetch";
import * as url from "url";
import * as uuid from "uuid";
import { IPluggableRegistry } from "../models/scn/pluggableRegistry";
import { INodeInfo, registryListing } from "../models/scn/registry";
import { IResponse } from "../models/scpi/common";
import { ICredentials, IRole } from "../models/scpi/credentials";
import { IVersionDetail, IVersions } from "../models/scpi/versions";
import { IPluggableDB } from "../models/pluggableDB";

export class RegistrationService {

    constructor(private registry: IPluggableRegistry, private db: IPluggableDB) { }

    public async register(publicIP: string, nodeURL: string, roles: IRole[]): Promise<void> {
        const nodeInfo = await this.getNodeInfo(nodeURL)
        for (const role of roles) {
            const listing = await this.isListedInRegistry(role.country_code, role.party_id, nodeInfo)
            if (listing !== registryListing.OK) {
                await this.registry.setParty(role.country_code, role.party_id, [this.toRole(role.role)], nodeInfo.address)
            }
        }
        const isConnected = await this.isConnectedToNode()
        if (isConnected) {
            return
        }
        if (!process.env.TOKEN_A) {
            throw Error("need TOKEN_A to complete registration process with SCN node")
        }
        await this.getNodeEndpoints(url.resolve(nodeURL, "/scpi/versions"), process.env.TOKEN_A)
        await this.connectToNode({
            token: uuid.v4(),
            url: url.resolve(publicIP, "/scpi/versions"),
            roles
        }, process.env.TOKEN_A)
    }

    public async getNodeInfo(nodeURL: string): Promise<INodeInfo> {
        const res = await fetch(url.resolve(nodeURL, "/scn/registry/node-info"))
        return res.json()
    }

    public async isListedInRegistry(countryCode: string, partyID: string, expectedNodeInfo: INodeInfo): Promise<registryListing> {
        const node = await this.registry.getNode(countryCode, partyID)

        if ((node.url === expectedNodeInfo.url) && (utils.getAddress(node.operator) === utils.getAddress(expectedNodeInfo.address))) {
            return registryListing.OK
        } else if ((node.url === "") && (node.operator === "0x0000000000000000000000000000000000000000")) {
            return registryListing.REGISTER_REQUIRED
        } else {
            return registryListing.UPDATE_REQUIRED
        }
    }

    public async isConnectedToNode(): Promise<boolean> {
        const tokenC = await this.db.getTokenC()
        if (tokenC === "") {
            return false
        }
        const credentialsEndpoint = await this.db.getEndpoint("credentials", "SENDER")
        const res = await fetch(credentialsEndpoint, {
            headers: {
                "Authorization": `Token ${tokenC}`
            }
        })
        const resBody: IResponse<any> = await res.json()
        return resBody.status_code === 1000
    }

    public async getNodeEndpoints(nodeVersionsURL: string, tokenA: string) {
        const headers = {
            "Authorization": `Token ${tokenA}`
        }
        const availableVersionsRes = await fetch(nodeVersionsURL, { headers })
        const availableVersions: IResponse<IVersions> = await availableVersionsRes.json()
        if (availableVersions.data) {
            const foundVersion = availableVersions.data.find((v) => v.version === "2.2")
            if (!foundVersion) {
                throw Error("Could not find 2.2 in SCN node's available SCPI versions")
            }
            const versionDetailRes = await fetch(foundVersion.url, { headers })
            const versionDetail: IResponse<IVersionDetail> = await versionDetailRes.json()
            if (!versionDetail.data) {
                throw Error("Unable to request SCN node's 2.2 version details")
            }
            await this.db.saveEndpoints(versionDetail.data)
        } else {
            throw Error("Unable to request SCN node's SCPI versions")
        }
    }

    public async connectToNode(credentials: ICredentials, tokenA: string) {
        await this.db.setTokenB(credentials.token)
        const credentialsEndpoint = await this.db.getEndpoint("credentials", "SENDER")
        const credentialsRes = await fetch(credentialsEndpoint, {
            method: "POST",
            headers: {
                "Authorization": `Token ${tokenA}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(credentials)
        })
        const nodeCredentials: IResponse<ICredentials> = await credentialsRes.json()
        if (!nodeCredentials.data) {
            throw Error("Did not receive CREDENTIALS_TOKEN_C from SCN node")
        }
        await this.db.setTokenC(nodeCredentials.data.token)
    }

    private toRole(str: string): Role {
        const roles: {[key: string]: number} = {
            "CPO": 0,
            "EMSP": 1,
            "HUB": 2,
            "NAP": 3,
            "NSP": 4,
            "OTHER": 5,
            "SCSP": 6
        }
        return roles[str] || 5
    }

}
