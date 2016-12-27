# MemeBot v2
The newest most amazing MemeBot now written in TypeScript for Azure Functions.

### Setting up launch.json
For easy debugging in VSCode, you can setup a nice launch.json file to make everything easy.  But the launch.json file is in the .gitignore you cry, how do I quickly set it up so I can use it?  Well, for the curious, here's an example:

```javascript
{
    // Use IntelliSense to learn about possible Node.js debug attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [

        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "program": "${workspaceRoot}/index.ts",
            "outFiles": ["${workspaceRoot}/js/*.js", "${workspaceRoot}/js/services/*.js", "${workspaceRoot}/js/dialogs/*.js"],
            "sourceMaps": true,
            "env": {
                "NODE_ENV": "development",
                "LuisAPIKey": "USE_YOUR_OWN_KEY",
                "LuisAppId": "IM_NOT_MADE_OF_MONEY"
            }
        },
        {
            "type": "node",
            "request": "attach",
            "name": "Attach to Process",
            "port": 5858,
            "outFiles": [],
            "sourceMaps": true
        }
    ]
}
```