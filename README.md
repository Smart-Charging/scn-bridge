# Smart Charging Bridge

The Smart Charging Network Bridge is an SCPI interface designed to be used with pluggable back office APIs.

Right now the focus is on providing Charge Point Operator interfaces, but this could be extended to Mobility Service Providers and others in the future.

## Usage:

The bridge can be used in the following way:

```
npm install https://github.com/Smart-Charging/scn-bridge.git
```

Then can be included in a project in several ways:

In TypeScript, the `startBridge` bootstrap function can be imported directly (or alternatively with `*` syntax):

```ts
import { startBridge, stopBridge } from "scn-bridge"
```

Using JavaScript, the module can be imported as follows:

```js
const scnBridge = require("scn-bridge")
```

To start the bridge, call the `startBridge` function with a configuration object that implements `IBridgeConfigurationOptions`:

```ts
startBridge({

    // publicly avialable URL of the Bridge 
    // note the bridge binds to localhost; use a reverse proxy like Nginx with SSL
    publicBridgeURL: "http://bridge.cpo.net",

    // publicly available URL of the SCN node to connect to                               
    scnNodeURL: "http://node.scn.net",          
    
    // set the bridge to use SCPI credentials roles
    roles: [                                  
        {
            role: "CPO",
            business_details: {
                name: "Super CPO Ltd."
            },
            country_code: "GB",
            party_id: "SUP"
        }
    ],

    // specify the desired SCPI modules to be shared (must match pluggableAPI below)
    // must implement IModules
    modules: {
        implementation: ModuleImplementation.CUSTOM,
        // sender and receiver only needed if implmentation is CUSTOM
        sender: ["locations"],
        receiver: []
    }
    
    // EMSP or CPO Backoffice API plug-in to use; must implement IPluggableAPI
    pluggableAPI: new PluggableAPI(),          
    
    // Interface providing getting/setting of important SCPI variables (token auth, endpoints, etc.)
    // must implement IPluggableDB
    pluggableDB: new PluggableDB(),
    
    // Interface providing writing/reading from an SCN Registry
    // must implement IPluggableRegistry (a DefaultRegistry class is provided in this case)
    pluggableRegistry: new DefaultRegistry("local")      

    // [optional, default=false] set to true for morgan to log to stdout
    logger: true,        
    
    // [optional, default=3000] set the internal port to listen on
    port: 3001,      
    
    // [optional, default=false] start the bridge without trying to register
    dryRun: true

}).then((bridge: http.Server) => {

    /* continue */

}).catch((err: Error) => {

/* handle error */

})
```

A bridge can then be cleanly stopped using the `stopBridge` function:

```ts
await stopBridge(bridge)
```

### Registering an SCPI Party

The registration process is two-fold and will be triggered automatically as long as the configuration option
`dryRun` is not set to `true`. Parties are taken from the `roles` attribute used in starting the bridge. 

Firstly, the SCN Bridge will check the status of the SCPI party in the SCN Registry. If they are unlisted, or 
they are listed under a different SCN node as the one provided in the configuration, the SCN Bridge will
attempt to register them. To do this, it is necessary to at least set the environment variable, `SIGNER_KEY`, 
describing the private key to use as the signer. If the signer is to be different from the _spender_ (the 
wallet paying for the transaction), then it is possible to also set a `SPENDER_KEY`, otherwise the two will 
be the same. For example:

Secondly, the SCN Bridge will check whether there is already a connection to an SCN node. If not, a POST
`credentials` request will be sent to the desired SCN node. To do this, another environment variable is
needed. The `TOKEN_A` environment variable is obtained from the SCN node and is needed to complete the
SCPI connection with it. Ask the administrator of the SCN node for it if this is missing.

In full, a project that depends on the SCN Bridge can therefore be started like so:

```
SIGNER_KEY=0xacbe153d15380ed52f7fab357dae7f7398bf099fcf8e79d06f758aa245b5ea64 TOKEN_A=e8b658a4-f2f9-47b6-b17e-3c672042a231 node /path/to/project.js
```

On second run, these values are no longer necessary:

```
node /path/to/project.js
```
