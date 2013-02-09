({
    mainConfigFile: "src/js/main.js",
    //name: "main",
    baseUrl: "./js",
    appDir: "./src",
    dir: "./build",
    optimize: "uglify2",
    preserveLicenseComments: false,
    //removeCombined: true,
    //findNestedDependencies: true,
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
            include: ["views/list_info"]
        }
    ]
})
