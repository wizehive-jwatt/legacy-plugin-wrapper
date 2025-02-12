# Migrating a Zengine Plugin to Version 2

## Requirements
NodeJS: version 10.10+

## Quick and Dirty

If you just want a snapshot of the steps, try walking through this first, and consult the expanded docs below if you get stuck.

**If you're using Mayan, and you haven't created a maya.json with a default environment, do that first!**

1. cd into your plugin's frontend code directory (in mayan projects: `cd ./plugins/name-of-plugin`)
2. `npm i -g ZengineHQ/zengine-migrator` to install the migrator tool globally
3. `zmig && npm install && npm start` to migrate and spin up a local dev server for testing
4. configure your plugin's Live Mode to point to https://localhost:1234 and approve the SSL in your browser
5. Do any acceptance testing to verify your plugin works and fix any issues
6. `npm run build` to create zip file
7. Use Zengine Developer UI to post a draft and/or publish the fully migrated plugin

## Process Details

1. Ensure your structure is correct

    mayan users:

        ├── backend/**/*.*
        ├── plugins
        │   └── name-of-plugin
        │       ├── node_modules
        │       ├── src
        │       │   ├── example-main.css
        │       │   ├── example-main.html
        │       │   └── example-main.controller.js
        │       ├── package.json
        │       ├── package-lock.json
        │       └── plugin-register.js
        ├── maya_build/**/*.*
        ├── maya.json   # If you don't have this, you need it!
        ├── maya.example.json
        ├── node_modules
        ├── README.md
        ├── package.json
        ├── package-lock.json
        └── .gitignore

2. Install the migration cli tool

    `npm i -g ZengineHQ/zengine-migrator`

3. Run the migration commands in the proper frontend directory

    Change directory to `/plugins/name-of-plugin` and run:

    ```sh
    zmig # this will scaffold the legacy wrapper around your project
    npm install
    npm start # spins up development server at localhost:1234
    ```

    New structure of your project:

        ├── backend/**/*.*
        ├── plugins
        │   └── name-of-plugin <-- this folder is where all of the changes take place
        │       ├── .legacy-output (this is a cached version of the collated and modified source files)
        │       ├── dist (this has the final deliverable files after running a dev or build command)
        │       ├── docs
        │       │   └── README.md (the one you're reading right now)
        │       ├── node_modules (after you npm install, at least)
        │       ├── src
        │       │   ├── example-main.css
        │       │   ├── example-main.html
        │       │   └── example-main.controller.js
        │       ├── vendor
        │       │   ├── bootstrap.js
        │       │   ├── import-jquery.js
        │       │   └── validators.js
        │       ├── wrapper
        │       │   ├── css
        │       │   ├── fonts
        │       │   ├── images
        │       │   ├── imgs
        │       │   ├── lib
        │       │   │   ├── directives.js
        │       │   │   ├── filters.js
        │       │   │   ├── services.js
        │       │   │   ├── wrapper.js
        │       │   │   ├── zn-data.js
        │       │   │   └── zn-form.js
        │       │   ├── index.html
        │       │   ├── plugin.js
        │       │   ├── plugin.scss
        │       │   └── zn-form.js
        │       ├── .eslint-legacy.json
        │       ├── .eslint-src.json
        │       ├── .eslint-wrapper.json
        │       ├── .gitignore
        │       ├── package.json
        │       ├── package-lock.json
        │       └── plugin-register.js
        ├── maya_build/**/*.*
        ├── maya.json   # If you don't have this, you need it!
        ├── maya.example.json
        ├── node_modules
        ├── README.md
        ├── package.json
        ├── package-lock.json
        └── .gitignore

    Please Note:

    - The migrator automatically updates your source code (your original files in `./src/`) in a few specific ways. See List of [Migration Code Mods](#migration-code-mods) for more details.

    - There are some [build time nuances](#build-process-nuances) you should read about

    - You'll definitely want to read about [Namespaces and Environments](#environments) to understand how to execute your dev and build commands.

4. Configure your plugin's live mode to point to `https://localhost:1234` in the Zengine UI

    ![Zengine UI Live Mode Screenshot](https://i.ibb.co/ZNtT4GP/Screen-Shot-2019-11-01-at-16-32-53.png)

    You will also need to visit your dev server (https://localhost:1234) in a separate tab in whatever browser you're using to test, so you can approve the self-signed SSL certificate generated by Parcel.

5. Acceptance test your plugin (and fix anything that broke)

    In the case of "simpler" plugins, the migration should be sufficient to convert the plugin to a working version 2 plugin. However, acceptance testing is strongly recommended to ensure the plugin's behavior has not changed or broken. Below are some known issues that may arise and how to fix them if they do. You can also run `npm run lint-legacy` to get immediate feedback on some of these issues.

    - Using native `Promise`s in your source code will create unexpected behavior. Refactor those Promises to use $q from angular instead

        Example:

        ```js
        plugin.controller('myController', ['$scope', 'asyncService', function ($scope, asyncService) {
          function myAsyncMethod(arg) {
            return new Promise((resolve, reject) => {
              asyncService.method(arg, (err, result) => {
                if (err) return reject(err)

                resolve(result)
              })
            })
          }
        }])
        ```

        Fix:

        ```js
        plugin.controller('myController', ['$scope', 'asyncService', '$q', function ($scope, asyncService, $q) {
          function myAsyncMethod(arg) {
            var deferred = $q.defer()

            asyncService.method(arg, (err, result) => {
              if (err) return deferred.reject(err)
              deferred.resolve(result)
            })

            return deferred.promise
          }
        }])
        ```

    - Uninitialized variables will often break the build or throw strange runtime errors

        Example:

        ```js
        plugin.controller('myController', ['$scope', function ($scope) {
          variable = 42
        }])
        ```

        Fix:

        ```js
        plugin.controller('myController', ['$scope', '$q', function ($scope, $q) {
          var variable = 42
        }])
        ```

    - `znModal` or custom modals

    - **Patterns that don't work in Version 2 and are only fixable by non-trivial refactoring:**

        - Setting global variables to communicate between individual interfaces of same plugin

        - `$scope.$parent`: any attempt to access `$scope` outside of the plugin context is restricted now, so you'll just have to figure out a more creative (and secure) means of acquiring/storing/passing that information.

          NB: obviously using `$scope.$parent` to access properties _within_ your plugin context is a perfectly safe and legitimate use of this strange angularJS feature.


6. Push up a draft version to test in a "production" environment

    - `npm run build` produces a `dist.zip` file in your frontend directory (`/plugins/name-of/plugin/dist.zip`)
    - In the Zengine UI, click on the Upload Code button to upload it as a draft, and change the mode to "Draft."

        ![Zengine UI Upload Screenshot](https://i.ibb.co/tLzJTgj/Screen-Shot-2019-11-01-at-16-46-52.png)

    - Do any acceptance testing deemed necessary, as the assets are now being served via the same mechanisms and services that your published code will be served through. This gives you the chance to vet your plugin as thoroughly as possible before making it public.

7. Publish

    In the Zengine UI, you can observe the status of your uploaded frontend plugin code. If you have any changes in draft that have not been published or made public yet, the status will be "unpublished."

    ![Unpublished Code](https://i.ibb.co/L1c7NFV/Screen-Shot-2019-11-01-at-16-56-13.png)

    To publish, visit the publish page and click "Save & Publish"

    ![Publish Page Button](https://i.ibb.co/yYR4TPv/Screen-Shot-2019-11-01-at-17-05-24.png)

    ![Publish Page](https://i.ibb.co/S5gC4gQ/Screen-Shot-2019-11-01-at-17-06-50.png)

    Your plugin is now fully migrated and ready for public use!

    ![Published Code Screenshot](https://i.ibb.co/qRyCDBT/Screen-Shot-2019-11-01-at-17-07-35.png)

## Build Process Nuances

The Zengine Legacy Wrapper uses Parcel (version 1.12.3) to transpile, serve, and build plugin source code. See the [parcel documentation](https://parceljs.org/) for a closer look into the various options available to you through this tool. A special [parcel plugin](https://github.com/ZengineHQ/parcel-plugin-zengine-migrator) was built to do the Zengine-specific heavy lifting behind the scenes.

With that in mind, here are a few nuances to be aware of during the build process

- When building a plugin with Handlebars imported (true by default), ignore the build error that shows up regarding the fs library. It’s a red herring and won’t affect your plugin from running successfully. _On occasion, the build will appear to hang_, **simply wait** (usually no more than 10s) and it often will kick in again and fix itself. Otherwise, just restart the server (`npm start`), and possibly delete `.cache/`. If you are not using Handlebars in your plugin, feel free to [remove it](#removing-dependencies).

## Environments

Just like Mayan could take a specific environment from the maya.json, the `ZENGINE_ENV` shell variable is used to determine that environment.

To help you take advantage of this variable easily, a list of build and dev scripts are automatically created based on the current maya.json environments. Whichever environment is designated as default is used to augment the `start` and `build` script, so you can run `npm start` for your default environment, or specify an environment with `npm run dev-env-name` to serve locally and `npm run build-env-name` to build for deployment.

Consult your package.json to see what commands are currently available or to adjust them to your needs after the same patterns.

## Managing Dependencies

### Adding Dependencies

A typical `npm install package-name` with `import object from 'package-name'` development flow should work great in most cases. In some rare cases (maybe trying to import a very old library?), relying on `<script src="http://url.com/package"></script>` may be a better move. Either way, you are in full control of all the source code to handle dependencies the way you see fit.

### Dependencies with Dynamic Imports

Some libraries do some fancy things with dynamic importing, like tiny-mce and ace editor. These libraries were available for use in version 1, and as such we wanted to make sure they were available "out of the box" in this migration process. However, because of the size and complexity of these libraries, they are not included by default. Rather, you will find commented imports are available in the `./wrapper/plugin.js` file, for your reference. To use any theme, mode, or plugin with those libraries, the respective files from those directories need to be specifically imported.

### Removing Dependencies

To remove a library, you can simply find the import statement for that library in `./wrapper/plugin.js` and delete it, and optionally also `npm uninstall` it to remove it entirely. If the library is an angularjs module, you will also need to remove it from the module declarations in `./wrapper/lib/wrapper.js`, as well.

## Migration Code Mods

During the migration process (running `zmig` in your frontend code directory), some code modifications are directly applied to your source code:

### Plugin Namespace

Access to the plugin's namespace in frontend code was previously possible via `$scope.pluginName` or `$scope.$parent.pluginName`. This is no longer true, but the namespace _is_ available via `plugin.namespace`, so your source code is automatically modified accordingly.

Example: `var namespace = $scope.pluginName` => `var namespace => plugin.namespace`

### $window

`$window` from Angular made some assumptions about the plugin's runtime context that couldn't be supported properly in Version 2, so this modification changes all references to `$window` to point to a custom service in the legacy wrapper: `znWindow`. Behavior is expected to be consistent after this change.
