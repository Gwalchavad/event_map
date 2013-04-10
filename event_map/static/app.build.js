({
    mainConfigFile: "src/js/main.js",
    //name: "main",
    baseUrl: "./js",
    appDir: "./src",
    dir: "./dist",
    optimize: "uglify2",
    preserveLicenseComments: false,
    optimizeCss: "standard",
    //removeCombined: true,
    //findNestedDependencies: true,
    pragmasOnSave: {
        excludeJade : true
    },
    pragmas: {
        debug: false
    },
    modules: [
        {
            name: "main",
            include: ["buildUrl","../../components/require/require"]
        },
        {
            name: "views/list",
            include: ["views/list_info"],
            exclude: ["main"]
        },
        {
            name: "views/event_add",
            exclude: ["main"]
        },
        {
            name: "views/event",
            exclude: ["main"]
        }
    ]
})
