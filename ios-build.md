Running with gitlab-runner 14.10.1/1.6.1 (029651c8)
  on ANKA_RUNNER 161fa1c3
Preparing the "anka" executor
Opening a connection to the Anka Cloud Controller: https://controller.green.us-west-2.apple-orchard.net:443
Starting Anka VM using:
  - VM Template UUID: a2cafd4d-8237-47b3-83dc-47fdd53d37aa
  - VM Template Tag Name: v1
Please be patient...
You can check the status of starting your Instance on the Anka Cloud Controller: https://controller.green.us-west-2.apple-orchard.net:443/#/instances
Verifying connectivity to the VM: build_stack_2026.01_arm64-1775058419623817000 (5ed16db4-82d0-461a-a337-c063d54703af) | Controller Instance ID: 3f6e9570-49db-416d-44bc-0386b0e21833 | Host: 10.2.146.68 | Port: 10000 
VM "build_stack_2026.01_arm64-1775058419623817000" (5ed16db4-82d0-461a-a337-c063d54703af) / Controller Instance ID 3f6e9570-49db-416d-44bc-0386b0e21833 running on Node ip-10-2-146-68.us-west-2.compute.internal (10.2.146.68), is ready for work (10.2.146.68:10000)
Preparing environment
Running on ip-192-168-64-23.us-west-2.compute.internal via ip-10-2-129-215.us-west-2.compute.internal...
Getting source from Git repository
$ pre-clone
[15:47:50]: Cloning repository...
Fetching changes...
Initialized empty Git repository in /Users/ionic-cloud-team/builds/sandroallada-png/mcf/.git/
Created fresh repository.
failed to store: -25308
Checking out e95668ff as main...
Updating/initializing submodules...
$ post-clone
[15:47:52]: Cloning complete...
Executing "step_script" stage of the job script
$ pre-build
[15:47:53]: Building project....
$ fetch-updates || true
Checking for build process updates...
$ build-ios
Top level ::CompositeIO is deprecated, require 'multipart/post' and use `Multipart::Post::CompositeReadIO` instead!
Top level ::Parts is deprecated, require 'multipart/post' and use `Multipart::Post::Parts` instead!
[15:48:01]: ---------------------------------
[15:48:01]: --- Step: add_extra_platforms ---
[15:48:01]: ---------------------------------
[15:48:01]: Setting '[:web]' as extra SupportedPlatforms
[15:48:01]: ------------------------------
[15:48:01]: --- Step: default_platform ---
[15:48:01]: ------------------------------
[15:48:01]: Driving the lane 'ios build_capacitor' 🚀
[15:48:01]: ---------------------------------
[15:48:01]: --- Step: prepare_environment ---
[15:48:01]: ---------------------------------
[15:48:01]: Setting default environment variables to tidy up logs. These can be overridden by setting them in Appflow.
[15:48:01]: 
[15:48:01]: No changes needed - logs are already tidy! 🧹
[15:48:01]: -------------------------
[15:48:01]: --- Step: sentry_init ---
[15:48:01]: -------------------------
[15:48:01]: ----------------------------
[15:48:01]: --- Step: begin_building ---
[15:48:01]: ----------------------------
[15:48:01]: Began building @ 2026-04-01T15:48:01
[15:48:02]: ---------------------------
[15:48:02]: --- Step: build_summary ---
[15:48:02]: ---------------------------

+---------------------------------------------------+
|                   Build Summary                   |
+---------------------+-----------------------------+
| Runners Revision    | 4926248                     |
| Job ID              | 10840372                    |
| Node.js version     | v22.22.0                    |
| Cordova CLI version | 12.0.0 (cordova-lib@12.0.2) |
| npm version         | 10.9.4                      |
| yarn version        | 1.22.19                     |
| macOS version       | 15.6                        |
| Xcode version       | Xcode 26.2                  |
|                     | Build version 17C52         |
| Fastlane version    | fastlane (2.230.0)          |
+---------------------+-----------------------------+

[15:48:08]: -----------------------------
[15:48:08]: --- Step: create_keychain ---
[15:48:08]: -----------------------------
[15:48:08]: $ security list-keychains -d user
[15:48:08]: ▸ "/Users/ionic-cloud-team/Library/Keychains/login.keychain-db"
[15:48:08]: ------------------------------------------
[15:48:08]: --- Step: get_ios_credentials_from_api ---
[15:48:08]: ------------------------------------------
[15:48:08]: Fetching certificate and profile(s) from Ionic Appflow
[15:48:08]: ---------------------------------
[15:48:08]: --- Step: set_ios_credentials ---
[15:48:08]: ---------------------------------
[15:48:09]: Installing provisioning profile...
[15:48:10]: /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ca5009a3-c2f6-4a05-b7f1-1b719a43c05e.mobileprovision

+----------------------------------------------------------------------------+
|                           Installed Certificate                            |
+-------------------+--------------------------------------------------------+
| User ID           | KV825CMDG7                                             |
| Common Name       | iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) |
| Organization Unit | KV825CMDG7                                             |
| Organization      | Setondji Maxy Djisso                                   |
| Country           | FR                                                     |
+-------------------+--------------------------------------------------------+

[15:48:10]: --------------------------------
[15:48:10]: --- Step: import_certificate ---
[15:48:10]: --------------------------------
[15:48:10]: Setting key partition list... (this can take a minute if there are a lot of keys installed)
[15:48:10]: ---------------------------
[15:48:10]: --- Step: set_ionic_cli ---
[15:48:10]: ---------------------------
[15:48:13]: Preinstalled @ionic/cli compatible with project `custom`
[15:48:13]: ------------------------------------
[15:48:13]: --- Step: detect_package_manager ---
[15:48:13]: ------------------------------------
[15:48:13]: Detecting package manager
[15:48:13]: Defaulting to npm
[15:48:13]: ---------------------------------
[15:48:13]: --- Step: add_git_credentials ---
[15:48:13]: ---------------------------------
[15:48:13]: Writing git-credentials files
[15:48:13]: git-credentials successfully added to project
[15:48:13]: --------------------------------
[15:48:13]: --- Step: get_appflow_config ---
[15:48:13]: --------------------------------
[15:48:13]: Checking for appflow.config.json
[15:48:13]: Appflow config not detected
[15:48:13]: --------------------------------
[15:48:13]: --- Step: dependency_install ---
[15:48:13]: --------------------------------
[15:48:13]: Installing Dependencies (in /Users/ionic-cloud-team/builds/sandroallada-png/mcf)
[15:48:13]: $ npm ci --quiet 
[15:48:15]: ▸ npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
[15:48:15]: ▸ npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
[15:48:16]: ▸ npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[15:48:16]: ▸ npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
[15:48:16]: ▸ npm warn deprecated q@1.5.1: You or someone you depend on is using Q, the JavaScript Promise library that gave JavaScript developers strong feelings about promises. They can almost certainly migrate to the native JavaScript promise now. Thank you literally everyone for joining me in this bet against the odds. Be excellent to each other.
[15:48:16]: ▸ npm warn deprecated
[15:48:16]: ▸ npm warn deprecated (For a CapTP with native promises, see @endo/eventual-send and @endo/captp)
[15:48:17]: ▸ npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
[15:48:18]: ▸ npm warn deprecated @types/xlsx@0.0.36: This is a stub types definition for xlsx (https://github.com/sheetjs/js-xlsx). xlsx provides its own type definitions, so you don't need @types/xlsx installed!
[15:48:19]: ▸ npm warn deprecated tar@6.2.1: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
[15:48:20]: ▸ npm warn deprecated @xmldom/xmldom@0.7.13: this version is no longer supported, please update to at least 0.8.*
[15:48:20]: ▸ npm warn deprecated @xmldom/xmldom@0.7.13: this version is no longer supported, please update to at least 0.8.*
[15:48:22]: ▸ npm warn deprecated glob@9.3.5: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
[15:48:55]: ▸ > my-cook-flex@0.1.0 postinstall
[15:48:55]: ▸ > bash scripts/fix-ios-signing.sh
[15:48:55]: ▸ --- MCF CUSTOM SIGNING FIX (from postinstall) START ---
[15:48:55]: ▸ Setting Team ID to KV825CMDG7...
[15:48:55]: ▸ Setting Manual Sign Style...
[15:48:55]: ▸ Disabling signing for dependencies...
[15:48:55]: ▸ --- MCF CUSTOM SIGNING FIX END ---
[15:48:55]: ▸ added 982 packages, and audited 983 packages in 42s
[15:48:55]: ▸ 186 packages are looking for funding
[15:48:55]: ▸ run `npm fund` for details
[15:48:55]: ▸ 22 vulnerabilities (2 low, 5 moderate, 14 high, 1 critical)
[15:48:55]: ▸ To address issues that do not require attention, run:
[15:48:55]: ▸ npm audit fix
[15:48:55]: ▸ To address all issues possible (including breaking changes), run:
[15:48:55]: ▸ npm audit fix --force
[15:48:55]: ▸ Some issues need review, and may require choosing
[15:48:55]: ▸ a different dependency.
[15:48:55]: ▸ Run `npm audit` for details.
[15:48:55]: -------------------------------------
[15:48:55]: --- Step: create_capacitor_config ---
[15:48:55]: -------------------------------------
[15:48:58]: Created capacitor.config.json from capacitor.config.ts/js
[15:48:58]: ----------------------------------------
[15:48:58]: --- Step: detect_ios_package_manager ---
[15:48:58]: ----------------------------------------
[15:48:58]: Detected SPM project (found /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/CapApp-SPM)
[15:48:58]: Detected iOS package manager: spm
[15:48:58]: -------------------------
[15:48:58]: --- Step: get_web_dir ---
[15:48:58]: -------------------------
[15:48:58]: webDir is `dist`
[15:48:58]: -----------------------------------
[15:48:58]: --- Step: modify_cap_web_config ---
[15:48:58]: -----------------------------------
[15:48:58]: No custom native config detected.
[15:48:58]: ---------------------------
[15:48:58]: --- Step: build_pro_app ---
[15:48:58]: ---------------------------
[15:48:58]: Building app from /Users/ionic-cloud-team/builds/sandroallada-png/mcf
[15:48:58]: Build script detected...
[15:48:58]: $ npm run build
[15:48:58]: ▸ > my-cook-flex@0.1.0 build
[15:48:58]: ▸ > next build
[15:49:00]: ▸ ⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
[15:49:00]: ▸ Attention: Next.js now collects completely anonymous telemetry regarding usage.
[15:49:00]: ▸ This information is used to shape Next.js' roadmap and prioritize features.
[15:49:00]: ▸ You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[15:49:00]: ▸ https://nextjs.org/telemetry
[15:49:00]: ▸ ▲ Next.js 15.3.8
[15:49:00]: ▸ - Environments: .env
[15:49:00]: ▸   Creating an optimized production build ...
[15:49:27]: ▸ warn - The class `duration-[2s]` is ambiguous and matches multiple utilities.
[15:49:27]: ▸ warn - If this is content and not a class, replace it with `duration-&lsqb;2s&rsqb;` to silence this warning.
[15:49:38]: ▸ ✓ Compiled successfully in 37.0s
[15:49:38]: ▸   Skipping validation of types
[15:49:38]: ▸   Skipping linting
[15:49:38]: ▸   Collecting page data ...
[15:49:44]: ▸   Generating static pages (0/57) ...
[15:49:45]: ▸ 🌐 i18next is made possible by our own product, Locize — consider powering your project with managed localization (AI, CDN, integrations): https://locize.com 💙
[15:49:45]: ▸ 🌐 i18next is made possible by our own product, Locize — consider powering your project with managed localization (AI, CDN, integrations): https://locize.com 💙
[15:49:45]: ▸ 🌐 i18next is made possible by our own product, Locize — consider powering your project with managed localization (AI, CDN, integrations): https://locize.com 💙
[15:49:45]: ▸   Generating static pages (14/57)
[15:49:45]: ▸   Generating static pages (28/57)
[15:49:45]: ▸   Generating static pages (42/57)
[15:49:46]: ▸ ✓ Generating static pages (57/57)
[15:49:46]: ▸   Finalizing page optimization ...
[15:49:46]: ▸   Collecting build traces ...
[15:49:53]: ▸ Route (app)                                  Size  First Load JS    
[15:49:53]: ▸ ┌ ○ /                                     3.15 kB         280 kB
[15:49:53]: ▸ ├ ○ /_not-found                             990 B         103 kB
[15:49:53]: ▸ ├ ○ /admin                                3.02 kB         372 kB
[15:49:53]: ▸ ├ ○ /admin/atelier                          12 kB         426 kB
[15:49:53]: ▸ ├ ○ /admin/carousel                       8.44 kB         415 kB
[15:49:53]: ▸ ├ ○ /admin/deleted-members                4.68 kB         378 kB
[15:49:53]: ▸ ├ ○ /admin/dishes                         16.8 kB         434 kB
[15:49:53]: ▸ ├ ○ /admin/feedbacks                      4.01 kB         373 kB
[15:49:53]: ▸ ├ ○ /admin/follow-up                       113 kB         493 kB
[15:49:53]: ▸ ├ ○ /admin/messages                       1.48 kB         371 kB
[15:49:53]: ▸ ├ ○ /admin/notifications                  2.91 kB         372 kB
[15:49:53]: ▸ ├ ○ /admin/promotions                     9.98 kB         417 kB
[15:49:53]: ▸ ├ ○ /admin/publications                   4.08 kB         377 kB
[15:49:53]: ▸ ├ ○ /admin/users                          6.77 kB         397 kB
[15:49:53]: ▸ ├ ƒ /api/ai/chat                            194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/estimate-calories               194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/explain-calorie-goal            194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/generate-meal-plan              194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/generate-recipe                 194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/generate-reminder               194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/generate-shopping-list          194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/generate-title                  194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/get-invite                      194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/get-motivational-message        194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/get-recommended-dishes          194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/provide-dietary-tips            194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/recipes-from-ingredients        194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/suggest-day-plan                194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/suggest-healthy-replacements    194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/suggest-single-meal             194 B         102 kB
[15:49:53]: ▸ ├ ƒ /api/ai/track-interaction               194 B         102 kB
[15:49:53]: ▸ ├ ○ /atelier                              8.59 kB         517 kB
[15:49:53]: ▸ ├ ƒ /atelier/recipe/[id]                   6.9 kB         419 kB
[15:49:53]: ▸ ├ ○ /avatar-selection                     13.4 kB         342 kB
[15:49:53]: ▸ ├ ○ /box                                  11.8 kB         443 kB
[15:49:53]: ▸ ├ ○ /boxe                                 9.75 kB         441 kB
[15:49:53]: ▸ ├ ○ /calendar                             6.31 kB         432 kB
[15:49:53]: ▸ ├ ○ /courses                              4.72 kB         378 kB
[15:49:53]: ▸ ├ ○ /cuisine                              22.3 kB         500 kB
[15:49:53]: ▸ ├ ○ /dashboard                            26.2 kB         535 kB
[15:49:53]: ▸ ├ ○ /denied                               4.58 kB         290 kB
[15:49:53]: ▸ ├ ○ /forgot-password                      3.65 kB         293 kB
[15:49:53]: ▸ ├ ○ /foyer-control                        6.14 kB         386 kB
[15:49:53]: ▸ ├ ƒ /foyer/[id]                           1.27 kB         273 kB
[15:49:53]: ▸ ├ ○ /fridge                               5.86 kB         382 kB
[15:49:53]: ▸ ├ ƒ /join-family/[inviteId]               4.66 kB         285 kB
[15:49:53]: ▸ ├ ○ /login                                5.71 kB         207 kB
[15:49:53]: ▸ ├ ○ /mon-niveau                           5.07 kB         374 kB
[15:49:53]: ▸ ├ ○ /my-flex-ai                             11 kB         462 kB
[15:49:54]: ▸ ├ ○ /notifications                        3.11 kB         415 kB
[15:49:54]: ▸ ├ ○ /personalization                      10.3 kB         366 kB
[15:49:54]: ▸ ├ ○ /preferences                          9.15 kB         331 kB
[15:49:54]: ▸ ├ ○ /pricing                              11.9 kB         307 kB
[15:49:54]: ▸ ├ ○ /register                             6.72 kB         335 kB
[15:49:54]: ▸ ├ ○ /settings                             12.7 kB         431 kB
[15:49:54]: ▸ ├ ○ /settings/privacy                     2.24 kB         371 kB
[15:49:54]: ▸ ├ ○ /settings/terms                       2.35 kB         372 kB
[15:49:54]: ▸ └ ○ /welcome                              10.7 kB         333 kB
[15:49:54]: ▸ + First Load JS shared by all              102 kB
[15:49:54]: ▸ ├ chunks/1684-db3844069279775f.js       46.4 kB
[15:49:54]: ▸ ├ chunks/4bd1b696-0b6a7111c5ee985d.js   53.2 kB
[15:49:54]: ▸ └ other shared chunks (total)            2.2 kB
[15:49:54]: ▸ ○  (Static)   prerendered as static content
[15:49:54]: ▸ ƒ  (Dynamic)  server-rendered on demand
[15:49:54]: $ ionic info
[15:49:57]: ▸ Ionic:
[15:49:57]: ▸ Ionic CLI : 7.2.1 (/Users/ionic-cloud-team/.nvm/versions/node/v22.22.0/lib/node_modules/@ionic/cli)
[15:49:57]: ▸ Capacitor:
[15:49:57]: ▸ Capacitor CLI      : 8.1.0
[15:49:57]: ▸ @capacitor/android : 8.1.0
[15:49:57]: ▸ @capacitor/core    : 8.1.0
[15:49:57]: ▸ @capacitor/ios     : 8.1.0
[15:49:57]: ▸ Utility:
[15:49:57]: ▸ cordova-res : 0.15.4
[15:49:57]: ▸ native-run  : 2.0.3
[15:49:57]: ▸ System:
[15:49:57]: ▸ NodeJS : v22.22.0 (/Users/ionic-cloud-team/.nvm/versions/node/v22.22.0/bin/node)
[15:49:57]: ▸ npm    : 10.9.4
[15:49:57]: ▸ OS     : macOS Unknown
[15:49:58]: Generating app manifest...
[15:49:58]: -------------------------------------
[15:49:58]: --- Step: get_xcode_project_paths ---
[15:49:58]: -------------------------------------
[15:49:58]: -------------------------------
[15:49:58]: --- Step: modify_ios_config ---
[15:49:58]: -------------------------------
[15:49:58]: No custom native config detected.
[15:49:58]: ----------------------
[15:49:58]: --- Step: cap_sync ---
[15:49:58]: ----------------------
[15:49:58]: $ npx cap sync ios
[15:50:01]: ▸ ✔ Copying web assets from dist to ios/App/App/public in 4.16ms
[15:50:01]: ▸ ✔ Creating capacitor.config.json in ios/App/App in 509.71μs
[15:50:01]: ▸ ✔ copy ios in 114.60ms
[15:50:01]: ▸ ✔ Updating iOS plugins in 26.14ms
[15:50:01]: ▸ [info] All plugins have a Package.swift file and will be included in Package.swift
[15:50:01]: ▸ [info] Writing Package.swift
[15:50:01]: ▸ [info] Found 2 Capacitor plugins for ios:
[15:50:01]: ▸ @capacitor-firebase/authentication@8.1.0
[15:50:01]: ▸ @capacitor/app@8.0.1
[15:50:01]: ▸ ✔ update ios in 144.92ms
[15:50:01]: ▸ [info] Sync finished in 0.407s
[15:50:01]: -------------------------------
[15:50:01]: --- Step: cap_custom_deploy ---
[15:50:01]: -------------------------------
[15:50:01]: No custom native config detected.
[15:50:01]: ------------------------------------------
[15:50:01]: --- Step: update_code_signing_settings ---
[15:50:01]: ------------------------------------------

+---------------------------------------------------------------------------------------------------+
|                                 Summary for code signing settings                                 |
+-----------------------+---------------------------------------------------------------------------+
| path                  | /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj |
| use_automatic_signing | false                                                                     |
| team_id               | KV825CMDG7                                                                |
| code_sign_identity    | iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7)                    |
+-----------------------+---------------------------------------------------------------------------+

[15:50:01]: Updating the Automatic Codesigning flag to disabled for the given project '/Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj/project.pbxproj'
[15:50:01]: Set Team id to: KV825CMDG7 for target: App for build configuration: Debug
[15:50:01]: Set Code Sign identity to: iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) for target: App for build configuration: Debug
[15:50:01]: Set Team id to: KV825CMDG7 for target: App for build configuration: Release
[15:50:01]: Set Code Sign identity to: iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) for target: App for build configuration: Release
[15:50:01]: Successfully updated project settings to use Code Sign Style = 'Manual'
[15:50:01]: Modified Targets:
[15:50:01]: 	 * App
[15:50:01]: Modified Build Configurations:
[15:50:01]: 	 * Debug
[15:50:01]: 	 * Release
[15:50:01]: ------------------------------------------
[15:50:01]: --- Step: update_provisioning_profiles ---
[15:50:01]: ------------------------------------------
[15:50:01]: You’re updating provisioning profiles directly in your project, but have you considered easier ways to do code signing?
[15:50:01]: https://docs.fastlane.tools/codesigning/GettingStarted/
[15:50:01]: Downloading root certificate from (https://www.apple.com/appleca/AppleIncRootCertificate.cer) to path '/tmp/AppleIncRootCertificate.cer'
[15:50:01]: Parsing mobile provisioning profile from '/Users/ionic-cloud-team/builds/sandroallada-png/mcf/ca5009a3-c2f6-4a05-b7f1-1b719a43c05e.mobileprovision'
[15:50:01]: Going to update project '/Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj' with UUID
[15:50:01]: Updating target App...
[15:50:01]: Updating configuration Debug...
[15:50:01]: Updating configuration Release...
[15:50:01]: Successfully updated project settings in '/Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj'
[15:50:01]: ---------------------------
[15:50:01]: --- Step: build_ios_app ---
[15:50:01]: ---------------------------
[15:50:02]: Successfully loaded '/Users/ionic-cloud-team/builds/sandroallada-png/mcf/Gymfile' 📄

+------------------------------------------------------------------------------------------------------------------+
|                                         Detected Values from './Gymfile'                                         |
+--------+---------------------------------------------------------------------------------------------------------+
| xcargs | DEVELOPMENT_TEAM=KV825CMDG7 CODE_SIGN_IDENTITY="iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7)" |
+--------+---------------------------------------------------------------------------------------------------------+

[15:50:02]: Resolving Swift Package Manager dependencies...
[15:50:02]: $ xcodebuild -resolvePackageDependencies -scheme App -project /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj
[15:50:05]: ▸ Command line invocation:
[15:50:05]: ▸     /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -resolvePackageDependencies -scheme App -project /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj
[15:50:07]: ▸ Resolve Package Graph
[15:50:17]: ▸ Fetching from https://github.com/google/GoogleSignIn-iOS
[15:50:18]: ▸ Fetching from https://github.com/facebook/facebook-ios-sdk.git
[15:50:26]: ▸ Fetching from https://github.com/ionic-team/capacitor-swift-pm.git
[15:50:26]: ▸ Fetching from https://github.com/firebase/firebase-ios-sdk.git
[15:50:45]: ▸ Fetching from https://github.com/google/app-check.git
[15:50:46]: ▸ Fetching from https://github.com/openid/AppAuth-iOS.git
[15:50:46]: ▸ Fetching from https://github.com/google/gtm-session-fetcher.git
[15:50:46]: ▸ Fetching from https://github.com/google/GTMAppAuth.git
[15:50:49]: ▸ Fetching from https://github.com/google/promises.git
[15:50:50]: ▸ Fetching from https://github.com/google/GoogleUtilities.git
[15:50:55]: ▸ Fetching from https://github.com/google/grpc-binary.git
[15:50:55]: ▸ Fetching from https://github.com/google/interop-ios-for-google-sdks.git
[15:50:55]: ▸ Fetching from https://github.com/firebase/leveldb.git
[15:50:55]: ▸ Fetching from https://github.com/firebase/nanopb.git
[15:50:56]: ▸ Fetching from https://github.com/google/GoogleDataTransport.git
[15:50:56]: ▸ Fetching from https://github.com/google/abseil-cpp-binary.git
[15:50:56]: ▸ Fetching from https://github.com/google/GoogleAppMeasurement.git
[15:50:59]: ▸ Fetching from https://github.com/googleads/google-ads-on-device-conversion-ios-sdk
[15:51:02]: ▸ Creating working copy of package ‘gtm-session-fetcher’
[15:51:02]: ▸ Checking out 3.5.0 of package ‘gtm-session-fetcher’
[15:51:02]: ▸ Creating working copy of package ‘nanopb’
[15:51:02]: ▸ Checking out 2.30910.0 of package ‘nanopb’
[15:51:02]: ▸ Creating working copy of package ‘facebook-ios-sdk’
[15:51:02]: ▸ Checking out 18.0.3 of package ‘facebook-ios-sdk’
[15:51:03]: ▸ Creating working copy of package ‘abseil-cpp-binary’
[15:51:03]: ▸ Checking out 1.2024072200.0 of package ‘abseil-cpp-binary’
[15:51:03]: ▸ Creating working copy of package ‘GoogleDataTransport’
[15:51:03]: ▸ Checking out 10.1.0 of package ‘GoogleDataTransport’
[15:51:03]: ▸ Creating working copy of package ‘app-check’
[15:51:03]: ▸ Checking out 11.2.0 of package ‘app-check’
[15:51:03]: ▸ Creating working copy of package ‘AppAuth-iOS’
[15:51:04]: ▸ Checking out 2.0.0 of package ‘AppAuth-iOS’
[15:51:04]: ▸ Creating working copy of package ‘capacitor-swift-pm’
[15:51:04]: ▸ Checking out 8.1.0 of package ‘capacitor-swift-pm’
[15:51:04]: ▸ Creating working copy of package ‘GTMAppAuth’
[15:51:04]: ▸ Checking out 5.0.0 of package ‘GTMAppAuth’
[15:51:04]: ▸ Creating working copy of package ‘GoogleUtilities’
[15:51:04]: ▸ Checking out 8.1.0 of package ‘GoogleUtilities’
[15:51:04]: ▸ Creating working copy of package ‘firebase-ios-sdk’
[15:51:05]: ▸ Checking out 12.11.0 of package ‘firebase-ios-sdk’
[15:51:07]: ▸ Creating working copy of package ‘GoogleAppMeasurement’
[15:51:07]: ▸ Checking out 12.11.0 of package ‘GoogleAppMeasurement’
[15:51:07]: ▸ Creating working copy of package ‘interop-ios-for-google-sdks’
[15:51:07]: ▸ Checking out 101.0.0 of package ‘interop-ios-for-google-sdks’
[15:51:07]: ▸ Creating working copy of package ‘leveldb’
[15:51:07]: ▸ Checking out 1.22.5 of package ‘leveldb’
[15:51:08]: ▸ Creating working copy of package ‘grpc-binary’
[15:51:08]: ▸ Checking out 1.69.1 of package ‘grpc-binary’
[15:51:08]: ▸ Creating working copy of package ‘GoogleSignIn-iOS’
[15:51:08]: ▸ Checking out 9.1.0 of package ‘GoogleSignIn-iOS’
[15:51:08]: ▸ Creating working copy of package ‘promises’
[15:51:08]: ▸ Checking out 2.4.0 of package ‘promises’
[15:51:08]: ▸ Creating working copy of package ‘google-ads-on-device-conversion-ios-sdk’
[15:51:08]: ▸ Checking out 3.4.0 of package ‘google-ads-on-device-conversion-ios-sdk’
[15:51:48]: ▸ Resolved source packages:
[15:51:48]: ▸   GoogleSignIn: https://github.com/google/GoogleSignIn-iOS @ 9.1.0
[15:51:48]: ▸   AppAuth: https://github.com/openid/AppAuth-iOS.git @ 2.0.0
[15:51:48]: ▸   Promises: https://github.com/google/promises.git @ 2.4.0
[15:51:48]: ▸   nanopb: https://github.com/firebase/nanopb.git @ 2.30910.0
[15:51:48]: ▸   InteropForGoogle: https://github.com/google/interop-ios-for-google-sdks.git @ 101.0.0
[15:51:48]: ▸   GTMAppAuth: https://github.com/google/GTMAppAuth.git @ 5.0.0
[15:51:48]: ▸   CapacitorFirebaseAuthentication: /Users/ionic-cloud-team/builds/sandroallada-png/mcf/node_modules/@capacitor-firebase/authentication @ local
[15:51:48]: ▸   abseil: https://github.com/google/abseil-cpp-binary.git @ 1.2024072200.0
[15:51:48]: ▸   CapApp-SPM: /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/CapApp-SPM @ local
[15:51:48]: ▸   Firebase: https://github.com/firebase/firebase-ios-sdk.git @ 12.11.0
[15:51:48]: ▸   capacitor-swift-pm: https://github.com/ionic-team/capacitor-swift-pm.git @ 8.1.0
[15:51:48]: ▸   GoogleAdsOnDeviceConversion: https://github.com/googleads/google-ads-on-device-conversion-ios-sdk @ 3.4.0
[15:51:48]: ▸   GoogleAppMeasurement: https://github.com/google/GoogleAppMeasurement.git @ 12.11.0
[15:51:48]: ▸   GTMSessionFetcher: https://github.com/google/gtm-session-fetcher.git @ 3.5.0
[15:51:48]: ▸   GoogleUtilities: https://github.com/google/GoogleUtilities.git @ 8.1.0
[15:51:48]: ▸   leveldb: https://github.com/firebase/leveldb.git @ 1.22.5
[15:51:48]: ▸   CapacitorApp: /Users/ionic-cloud-team/builds/sandroallada-png/mcf/node_modules/@capacitor/app @ local
[15:51:48]: ▸   AppCheck: https://github.com/google/app-check.git @ 11.2.0
[15:51:48]: ▸   GoogleDataTransport: https://github.com/google/GoogleDataTransport.git @ 10.1.0
[15:51:48]: ▸   Facebook: https://github.com/facebook/facebook-ios-sdk.git @ 18.0.3
[15:51:48]: ▸   gRPC: https://github.com/google/grpc-binary.git @ 1.69.1
[15:51:48]: ▸ resolved source packages: GoogleSignIn, AppAuth, Promises, nanopb, InteropForGoogle, GTMAppAuth, CapacitorFirebaseAuthentication, abseil, CapApp-SPM, Firebase, capacitor-swift-pm, GoogleAdsOnDeviceConversion, GoogleAppMeasurement, GTMSessionFetcher, GoogleUtilities, leveldb, CapacitorApp, AppCheck, GoogleDataTransport, Facebook, gRPC
[15:51:48]: $ xcodebuild -showBuildSettings -scheme App -project /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj 2>&1
[15:52:18]: Detected provisioning profile mapping: {"my.cook.flex": "mcf-distribution"}

+------------------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                                  Summary for gym 2.230.0                                                                   |
+--------------------------------------------------+---------------------------------------------------------------------------------------------------------+
| project                                          | /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj                               |
| output_directory                                 | /Users/ionic-cloud-team/builds/sandroallada-png/mcf                                                     |
| output_name                                      | 1b28918d-8eaf-42c3-a5a1-5c4525edc905-app-store                                                          |
| archive_path                                     | 1b28918d-8eaf-42c3-a5a1-5c4525edc905-app-store.xcarchive                                                |
| scheme                                           | App                                                                                                     |
| codesigning_identity                             | iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7)                                                  |
| export_team_id                                   | KV825CMDG7                                                                                              |
| catalyst_platform                                | ios                                                                                                     |
| export_options.provisioningProfiles.my.cook.flex | mcf-distribution                                                                                        |
| clean                                            | false                                                                                                   |
| silent                                           | false                                                                                                   |
| skip_package_ipa                                 | false                                                                                                   |
| export_method                                    | app-store                                                                                               |
| build_path                                       | /Users/ionic-cloud-team/Library/Developer/Xcode/Archives/2026-04-01                                     |
| result_bundle                                    | false                                                                                                   |
| buildlog_path                                    | ~/Library/Logs/gym                                                                                      |
| destination                                      | generic/platform=iOS                                                                                    |
| xcargs                                           | DEVELOPMENT_TEAM=KV825CMDG7 CODE_SIGN_IDENTITY="iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7)" |
| xcodebuild_formatter                             | xcbeautify                                                                                              |
| build_timing_summary                             | false                                                                                                   |
| skip_profile_detection                           | false                                                                                                   |
| xcodebuild_command                               | xcodebuild                                                                                              |
| skip_package_dependencies_resolution             | false                                                                                                   |
| disable_package_automatic_updates                | false                                                                                                   |
| use_system_scm                                   | false                                                                                                   |
| generate_appstore_info                           | false                                                                                                   |
| skip_package_pkg                                 | false                                                                                                   |
| xcode_path                                       | /Applications/Xcode.app                                                                                 |
+--------------------------------------------------+---------------------------------------------------------------------------------------------------------+

[15:52:19]: $ set -o pipefail && xcodebuild -scheme App -project /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj -destination 'generic/platform=iOS' -archivePath 1b28918d-8eaf-42c3-a5a1-5c4525edc905-app-store.xcarchive DEVELOPMENT_TEAM=KV825CMDG7 CODE_SIGN_IDENTITY="iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7)" archive CODE_SIGN_IDENTITY=iPhone\ Distribution:\ Setondji\ Maxy\ Djisso\ \(KV825CMDG7\) | tee /Users/ionic-cloud-team/Library/Logs/gym/App-App.log | xcbeautify
[15:52:19]: ▸ ----- xcbeautify -----
[15:52:19]: ▸ Version: 3.1.2
[15:52:19]: ▸ ----------------------
[15:52:26]: ▸ Resolving Package Graph
[15:52:28]: ▸ Resolved source packages
[15:52:28]: ▸ GoogleDataTransport - https://github.com/google/GoogleDataTransport.git @ 10.1.0
[15:52:28]: ▸ abseil - https://github.com/google/abseil-cpp-binary.git @ 1.2024072200.0
[15:52:28]: ▸ gRPC - https://github.com/google/grpc-binary.git @ 1.69.1
[15:52:28]: ▸ AppCheck - https://github.com/google/app-check.git @ 11.2.0
[15:52:28]: ▸ Facebook - https://github.com/facebook/facebook-ios-sdk.git @ 18.0.3
[15:52:28]: ▸ nanopb - https://github.com/firebase/nanopb.git @ 2.30910.0
[15:52:28]: ▸ leveldb - https://github.com/firebase/leveldb.git @ 1.22.5
[15:52:28]: ▸ GoogleUtilities - https://github.com/google/GoogleUtilities.git @ 8.1.0
[15:52:28]: ▸ capacitor-swift-pm - https://github.com/ionic-team/capacitor-swift-pm.git @ 8.1.0
[15:52:28]: ▸ GTMSessionFetcher - https://github.com/google/gtm-session-fetcher.git @ 3.5.0
[15:52:28]: ▸ GoogleAppMeasurement - https://github.com/google/GoogleAppMeasurement.git @ 12.11.0
[15:52:28]: ▸ Firebase - https://github.com/firebase/firebase-ios-sdk.git @ 12.11.0
[15:52:28]: ▸ GoogleSignIn - https://github.com/google/GoogleSignIn-iOS @ 9.1.0
[15:52:28]: ▸ GTMAppAuth - https://github.com/google/GTMAppAuth.git @ 5.0.0
[15:52:28]: ▸ InteropForGoogle - https://github.com/google/interop-ios-for-google-sdks.git @ 101.0.0
[15:52:28]: ▸ Promises - https://github.com/google/promises.git @ 2.4.0
[15:52:28]: ▸ GoogleAdsOnDeviceConversion - https://github.com/googleads/google-ads-on-device-conversion-ios-sdk @ 3.4.0
[15:52:28]: ▸ AppAuth - https://github.com/openid/AppAuth-iOS.git @ 2.0.0
[15:52:28]: ▸ note: Using codesigning identity override: iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7)
[15:52:32]: ▸ note: Building targets in dependency order
[15:52:32]: ▸ note: Target dependency graph (73 targets)
[15:52:41]: ▸ ❌ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: GoogleUtilities_GoogleUtilities-AppDelegateSwizzler has conflicting provisioning settings. GoogleUtilities_GoogleUtilities-AppDelegateSwizzler is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-AppDelegateSwizzler' from project 'GoogleUtilities')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/firebase-ios-sdk/Package.swift: error: Firebase_FirebaseCore has conflicting provisioning settings. Firebase_FirebaseCore is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'Firebase_FirebaseCore' from project 'Firebase')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleSignIn-iOS/Package.swift: error: GoogleSignIn_GoogleSignIn has conflicting provisioning settings. GoogleSignIn_GoogleSignIn is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'GoogleSignIn_GoogleSignIn' from project 'GoogleSignIn')
[15:52:41]: ▸ ❌ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GTMAppAuth/Package.swift: GTMAppAuth_GTMAppAuth has conflicting provisioning settings. GTMAppAuth_GTMAppAuth is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'GTMAppAuth_GTMAppAuth' from project 'GTMAppAuth')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: error: GoogleUtilities_GoogleUtilities-Reachability has conflicting provisioning settings. GoogleUtilities_GoogleUtilities-Reachability is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-Reachability' from project 'GoogleUtilities')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/facebook-ios-sdk/Package.swift: error: Facebook_FacebookAEM has conflicting provisioning settings. Facebook_FacebookAEM is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'Facebook_FacebookAEM' from project 'Facebook')
[15:52:41]: ▸ ❌ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/firebase-ios-sdk/Package.swift: Firebase_FirebaseCoreExtension has conflicting provisioning settings. Firebase_FirebaseCoreExtension is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'Firebase_FirebaseCoreExtension' from project 'Firebase')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: error: GoogleUtilities_GoogleUtilities-Logger has conflicting provisioning settings. GoogleUtilities_GoogleUtilities-Logger is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-Logger' from project 'GoogleUtilities')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/firebase-ios-sdk/Package.swift: error: Firebase_FirebaseAuth has conflicting provisioning settings. Firebase_FirebaseAuth is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'Firebase_FirebaseAuth' from project 'Firebase')
[15:52:41]: ▸ ❌ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/AppAuth-iOS/Package.swift: AppAuth_AppAuthCore has conflicting provisioning settings. AppAuth_AppAuthCore is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'AppAuth_AppAuthCore' from project 'AppAuth')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/promises/Package.swift: error: Promises_FBLPromises has conflicting provisioning settings. Promises_FBLPromises is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'Promises_FBLPromises' from project 'Promises')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: error: GoogleUtilities_GoogleUtilities-Network has conflicting provisioning settings. GoogleUtilities_GoogleUtilities-Network is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-Network' from project 'GoogleUtilities')
[15:52:41]: ▸ ❌ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/firebase-ios-sdk/Package.swift: Firebase_FirebaseCoreInternal has conflicting provisioning settings. Firebase_FirebaseCoreInternal is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'Firebase_FirebaseCoreInternal' from project 'Firebase')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: error: GoogleUtilities_GoogleUtilities-UserDefaults has conflicting provisioning settings. GoogleUtilities_GoogleUtilities-UserDefaults is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-UserDefaults' from project 'GoogleUtilities')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/facebook-ios-sdk/Package.swift: error: Facebook_FacebookLogin has conflicting provisioning settings. Facebook_FacebookLogin is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'Facebook_FacebookLogin' from project 'Facebook')
[15:52:41]: ▸ ❌ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/AppAuth-iOS/Package.swift: AppAuth_AppAuth has conflicting provisioning settings. AppAuth_AppAuth is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'AppAuth_AppAuth' from project 'AppAuth')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: error: GoogleUtilities_GoogleUtilities-NSData has conflicting provisioning settings. GoogleUtilities_GoogleUtilities-NSData is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-NSData' from project 'GoogleUtilities')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/gtm-session-fetcher/Package.swift: error: GTMSessionFetcher_GTMSessionFetcherCore has conflicting provisioning settings. GTMSessionFetcher_GTMSessionFetcherCore is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'GTMSessionFetcher_GTMSessionFetcherCore' from project 'GTMSessionFetcher')
[15:52:41]: ▸ ** ARCHIVE FAILED **
[15:52:41]: ▸ The following build commands failed:
[15:52:41]: ▸ 	Archiving project App with scheme App
[15:52:41]: ▸ (1 failure)
[15:52:41]: ▸ ❌ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: GoogleUtilities_GoogleUtilities-Environment has conflicting provisioning settings. GoogleUtilities_GoogleUtilities-Environment is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-Environment' from project 'GoogleUtilities')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/facebook-ios-sdk/Package.swift: error: Facebook_FacebookCore has conflicting provisioning settings. Facebook_FacebookCore is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'Facebook_FacebookCore' from project 'Facebook')
[15:52:41]: ▸ 
[15:52:41]: Exit status: 65

+-----------------------------------------+
|            Build environment            |
+---------------+-------------------------+
| xcode_path    | /Applications/Xcode.app |
| gym_version   | 2.230.0                 |
| export_method | app-store               |
| sdk           | iPhoneOS26.2.sdk        |
+---------------+-------------------------+

[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/AppAuth-iOS/Package.swift: error: AppAuth_AppAuth has conflicting provisioning settings. AppAuth_AppAuth is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'AppAuth_AppAuth' from project 'AppAuth')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: error: GoogleUtilities_GoogleUtilities-NSData has conflicting provisioning settings. GoogleUtilities_GoogleUtilities-NSData is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-NSData' from project 'GoogleUtilities')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/gtm-session-fetcher/Package.swift: error: GTMSessionFetcher_GTMSessionFetcherCore has conflicting provisioning settings. GTMSessionFetcher_GTMSessionFetcherCore is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'GTMSessionFetcher_GTMSessionFetcherCore' from project 'GTMSessionFetcher')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: error: GoogleUtilities_GoogleUtilities-Environment has conflicting provisioning settings. GoogleUtilities_GoogleUtilities-Environment is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-Environment' from project 'GoogleUtilities')
[15:52:41]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/facebook-ios-sdk/Package.swift: error: Facebook_FacebookCore has conflicting provisioning settings. Facebook_FacebookCore is automatically signed, but code signing identity iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) has been manually specified. Set the code signing identity value to "Apple Development" in the build settings editor, or switch to manual signing in the Signing & Capabilities editor. (in target 'Facebook_FacebookCore' from project 'Facebook')
[15:52:41]: 
[15:52:41]: ⬆️  Check out the few lines of raw `xcodebuild` output above for potential hints on how to solve this error
[15:52:41]: 📋  For the complete and more detailed error log, check the full log at:
[15:52:41]: 📋  /Users/ionic-cloud-team/Library/Logs/gym/App-App.log
[15:52:41]: 
[15:52:41]: Looks like fastlane ran into a build/archive error with your project
[15:52:41]: It's hard to tell what's causing the error, so we wrote some guides on how
[15:52:41]: to troubleshoot build and signing issues: https://docs.fastlane.tools/codesigning/getting-started/
[15:52:41]: Before submitting an issue on GitHub, please follow the guide above and make
[15:52:41]: sure your project is set up correctly.
[15:52:41]: fastlane uses `xcodebuild` commands to generate your binary, you can see the
[15:52:41]: the full commands printed out in yellow in the above log.
[15:52:41]: Make sure to inspect the output above, as usually you'll find more error information there
[15:52:41]: 
[15:52:41]: -------------------------
[15:52:41]: --- Step: upload_logs ---
[15:52:41]: -------------------------
[15:52:54]: --------------------------------------
[15:52:54]: --- Step: sentry_capture_exception ---
[15:52:54]: --------------------------------------
[15:52:58]: ---------------------------
[15:52:58]: --- Step: shell command ---
[15:52:58]: ---------------------------
[15:52:58]: Error building the application - see the log above
+----------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                                    Lane Context                                                                    |
+-------------------------------------+--------------------------------------------------------------------------------------------------------------+
| DEFAULT_PLATFORM                    | ios                                                                                                          |
| PLATFORM_NAME                       | ios                                                                                                          |
| LANE_NAME                           | ios build_capacitor                                                                                          |
| KEYCHAIN_PATH                       | ~/Library/Keychains/IonicKeychain                                                                            |
| DOWNLOAD_CERTS_PROVISION_FILE_UUID  | ca5009a3-c2f6-4a05-b7f1-1b719a43c05e                                                                         |
| DOWNLOAD_CERTS_CODESIGNING_IDENTITY | iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7)                                                       |
| DOWNLOAD_CERTS_TEAM_ID              | KV825CMDG7                                                                                                   |
| DOWNLOAD_CERTS_CERT_PATH            | /Users/ionic-cloud-team/builds/sandroallada-png/mcf/cert_file.p12                                            |
| SIGH_PROFILE_PATHS                  | ["/Users/ionic-cloud-team/builds/sandroallada-png/mcf/ca5009a3-c2f6-4a05-b7f1-1b719a43c05e.mobileprovision"] |
| IONIC_CLI_VERSION                   | 7.2.1                                                                                                        |
| NODE_PACKAGE_MANAGER                | npm                                                                                                          |
| CAP_IOS_PATH                        | /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios                                                      |
| IOS_PACKAGE_MANAGER                 | spm                                                                                                          |
| PROJECT_WEB_DIR                     | dist                                                                                                         |
| XCODE_PROJECT_NAME                  | App                                                                                                          |
| XCODE_PROJECT_PATH                  | /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj                                    |
| XCODE_WORKSPACE_PATH                | /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcworkspace                                  |
+-------------------------------------+--------------------------------------------------------------------------------------------------------------+
[15:52:58]: Error building the application - see the log above

+---------------------------------------------------+
|                 fastlane summary                  |
+------+------------------------------+-------------+
| Step | Action                       | Time (in s) |
+------+------------------------------+-------------+
| 1    | add_extra_platforms          | 0           |
| 2    | default_platform             | 0           |
| 3    | prepare_environment          | 0           |
| 4    | sentry_init                  | 0           |
| 5    | begin_building               | 0           |
| 6    | build_summary                | 5           |
| 7    | create_keychain              | 0           |
| 8    | get_ios_credentials_from_api | 0           |
| 9    | set_ios_credentials          | 1           |
| 10   | import_certificate           | 0           |
| 11   | set_ionic_cli                | 2           |
| 12   | detect_package_manager       | 0           |
| 13   | add_git_credentials          | 0           |
| 14   | get_appflow_config           | 0           |
| 15   | dependency_install           | 42          |
| 16   | create_capacitor_config      | 2           |
| 17   | detect_ios_package_manager   | 0           |
| 18   | get_web_dir                  | 0           |
| 19   | modify_cap_web_config        | 0           |
| 20   | build_pro_app                | 60          |
| 21   | get_xcode_project_paths      | 0           |
| 22   | modify_ios_config            | 0           |
| 23   | cap_sync                     | 2           |
| 24   | cap_custom_deploy            | 0           |
| 25   | update_code_signing_settings | 0           |
| 26   | update_provisioning_profiles | 0           |
| 💥   | build_ios_app                | 160         |
| 28   | upload_logs                  | 12          |
| 29   | sentry_capture_exception     | 3           |
| 30   | shell command                | 0           |
+------+------------------------------+-------------+

[15:52:58]: fastlane finished with errors

[!] Error building the application - see the log above
Running after_script
Running after script...
$ clean-up
Cleaning up project directory and file based variables
Terminating VM: build_stack_2026.01_arm64-1775058419623817000 (5ed16db4-82d0-461a-a337-c063d54703af) | Controller Instance ID: 3f6e9570-49db-416d-44bc-0386b0e21833 | Host: 10.2.146.68
ERROR: Job failed: Process exited with status 1