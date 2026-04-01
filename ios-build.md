Running with gitlab-runner 14.10.1/1.6.1 (029651c8)
  on ANKA_RUNNER 161fa1c3
Preparing the "anka" executor
Opening a connection to the Anka Cloud Controller: https://controller.green.us-west-2.apple-orchard.net:443
Starting Anka VM using:
  - VM Template UUID: a2cafd4d-8237-47b3-83dc-47fdd53d37aa
  - VM Template Tag Name: v1
Please be patient...
You can check the status of starting your Instance on the Anka Cloud Controller: https://controller.green.us-west-2.apple-orchard.net:443/#/instances
Verifying connectivity to the VM: build_stack_2026.01_arm64-1775052343427018000 (e7416c5c-60f0-4763-ab28-35c25adc8e9d) | Controller Instance ID: 284c7b26-b453-4661-4676-4a6a33b9d657 | Host: 10.2.146.68 | Port: 10001 
VM "build_stack_2026.01_arm64-1775052343427018000" (e7416c5c-60f0-4763-ab28-35c25adc8e9d) / Controller Instance ID 284c7b26-b453-4661-4676-4a6a33b9d657 running on Node ip-10-2-146-68.us-west-2.compute.internal (10.2.146.68), is ready for work (10.2.146.68:10001)
Preparing environment
Running on ip-192-168-64-23.us-west-2.compute.internal via ip-10-2-129-215.us-west-2.compute.internal...
Getting source from Git repository
$ pre-clone
[14:06:34]: Cloning repository...
Fetching changes...
Initialized empty Git repository in /Users/ionic-cloud-team/builds/sandroallada-png/mcf/.git/
Created fresh repository.
failed to store: -25308
Checking out 7e203894 as main...
Updating/initializing submodules...
$ post-clone
[14:06:37]: Cloning complete...
Executing "step_script" stage of the job script
$ pre-build
[14:06:37]: Building project....
$ fetch-updates || true
Checking for build process updates...
$ build-ios
Top level ::CompositeIO is deprecated, require 'multipart/post' and use `Multipart::Post::CompositeReadIO` instead!
Top level ::Parts is deprecated, require 'multipart/post' and use `Multipart::Post::Parts` instead!
[14:06:44]: ---------------------------------
[14:06:44]: --- Step: add_extra_platforms ---
[14:06:44]: ---------------------------------
[14:06:44]: Setting '[:web]' as extra SupportedPlatforms
[14:06:44]: ------------------------------
[14:06:44]: --- Step: default_platform ---
[14:06:44]: ------------------------------
[14:06:44]: Driving the lane 'ios build_capacitor' 🚀
[14:06:44]: ---------------------------------
[14:06:44]: --- Step: prepare_environment ---
[14:06:44]: ---------------------------------
[14:06:44]: Setting default environment variables to tidy up logs. These can be overridden by setting them in Appflow.
[14:06:44]: 
[14:06:44]: No changes needed - logs are already tidy! 🧹
[14:06:44]: -------------------------
[14:06:44]: --- Step: sentry_init ---
[14:06:44]: -------------------------
[14:06:44]: ----------------------------
[14:06:44]: --- Step: begin_building ---
[14:06:44]: ----------------------------
[14:06:44]: Began building @ 2026-04-01T14:06:44
[14:06:44]: ---------------------------
[14:06:44]: --- Step: build_summary ---
[14:06:44]: ---------------------------

+---------------------------------------------------+
|                   Build Summary                   |
+---------------------+-----------------------------+
| Runners Revision    | 4926248                     |
| Job ID              | 10840054                    |
| Node.js version     | v22.22.0                    |
| Cordova CLI version | 12.0.0 (cordova-lib@12.0.2) |
| npm version         | 10.9.4                      |
| yarn version        | 1.22.19                     |
| macOS version       | 15.6                        |
| Xcode version       | Xcode 26.2                  |
|                     | Build version 17C52         |
| Fastlane version    | fastlane (2.230.0)          |
+---------------------+-----------------------------+

[14:06:47]: -----------------------------
[14:06:47]: --- Step: create_keychain ---
[14:06:47]: -----------------------------
[14:06:47]: $ security list-keychains -d user
[14:06:47]: ▸ "/Users/ionic-cloud-team/Library/Keychains/login.keychain-db"
[14:06:47]: ------------------------------------------
[14:06:47]: --- Step: get_ios_credentials_from_api ---
[14:06:47]: ------------------------------------------
[14:06:47]: Fetching certificate and profile(s) from Ionic Appflow
[14:06:48]: ---------------------------------
[14:06:48]: --- Step: set_ios_credentials ---
[14:06:48]: ---------------------------------
[14:06:48]: Installing provisioning profile...
[14:06:49]: /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ca5009a3-c2f6-4a05-b7f1-1b719a43c05e.mobileprovision

+----------------------------------------------------------------------------+
|                           Installed Certificate                            |
+-------------------+--------------------------------------------------------+
| User ID           | KV825CMDG7                                             |
| Common Name       | iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) |
| Organization Unit | KV825CMDG7                                             |
| Organization      | Setondji Maxy Djisso                                   |
| Country           | FR                                                     |
+-------------------+--------------------------------------------------------+

[14:06:49]: --------------------------------
[14:06:49]: --- Step: import_certificate ---
[14:06:49]: --------------------------------
[14:06:49]: Setting key partition list... (this can take a minute if there are a lot of keys installed)
[14:06:49]: ---------------------------
[14:06:49]: --- Step: set_ionic_cli ---
[14:06:49]: ---------------------------
[14:06:51]: Preinstalled @ionic/cli compatible with project `custom`
[14:06:51]: ------------------------------------
[14:06:51]: --- Step: detect_package_manager ---
[14:06:51]: ------------------------------------
[14:06:51]: Detecting package manager
[14:06:51]: Defaulting to npm
[14:06:51]: ---------------------------------
[14:06:51]: --- Step: add_git_credentials ---
[14:06:51]: ---------------------------------
[14:06:51]: Writing git-credentials files
[14:06:51]: git-credentials successfully added to project
[14:06:51]: --------------------------------
[14:06:51]: --- Step: get_appflow_config ---
[14:06:51]: --------------------------------
[14:06:51]: Checking for appflow.config.json
[14:06:51]: Appflow config not detected
[14:06:51]: --------------------------------
[14:06:51]: --- Step: dependency_install ---
[14:06:51]: --------------------------------
[14:06:51]: Installing Dependencies (in /Users/ionic-cloud-team/builds/sandroallada-png/mcf)
[14:06:51]: $ npm ci --quiet 
[14:06:52]: ▸ npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
[14:06:52]: ▸ npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
[14:06:52]: ▸ npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[14:06:52]: ▸ npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
[14:06:52]: ▸ npm warn deprecated q@1.5.1: You or someone you depend on is using Q, the JavaScript Promise library that gave JavaScript developers strong feelings about promises. They can almost certainly migrate to the native JavaScript promise now. Thank you literally everyone for joining me in this bet against the odds. Be excellent to each other.
[14:06:52]: ▸ npm warn deprecated
[14:06:52]: ▸ npm warn deprecated (For a CapTP with native promises, see @endo/eventual-send and @endo/captp)
[14:06:53]: ▸ npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
[14:06:54]: ▸ npm warn deprecated tar@6.2.1: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
[14:06:54]: ▸ npm warn deprecated @types/xlsx@0.0.36: This is a stub types definition for xlsx (https://github.com/sheetjs/js-xlsx). xlsx provides its own type definitions, so you don't need @types/xlsx installed!
[14:06:56]: ▸ npm warn deprecated @xmldom/xmldom@0.7.13: this version is no longer supported, please update to at least 0.8.*
[14:06:56]: ▸ npm warn deprecated @xmldom/xmldom@0.7.13: this version is no longer supported, please update to at least 0.8.*
[14:06:56]: ▸ npm warn deprecated glob@9.3.5: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
[14:07:25]: ▸ added 982 packages, and audited 983 packages in 34s
[14:07:25]: ▸ 186 packages are looking for funding
[14:07:25]: ▸ run `npm fund` for details
[14:07:25]: ▸ 22 vulnerabilities (2 low, 5 moderate, 14 high, 1 critical)
[14:07:25]: ▸ To address issues that do not require attention, run:
[14:07:25]: ▸ npm audit fix
[14:07:25]: ▸ To address all issues possible (including breaking changes), run:
[14:07:25]: ▸ npm audit fix --force
[14:07:25]: ▸ Some issues need review, and may require choosing
[14:07:25]: ▸ a different dependency.
[14:07:25]: ▸ Run `npm audit` for details.
[14:07:25]: -------------------------------------
[14:07:25]: --- Step: create_capacitor_config ---
[14:07:25]: -------------------------------------
[14:07:26]: Created capacitor.config.json from capacitor.config.ts/js
[14:07:26]: ----------------------------------------
[14:07:26]: --- Step: detect_ios_package_manager ---
[14:07:26]: ----------------------------------------
[14:07:26]: Detected SPM project (found /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/CapApp-SPM)
[14:07:26]: Detected iOS package manager: spm
[14:07:26]: -------------------------
[14:07:26]: --- Step: get_web_dir ---
[14:07:26]: -------------------------
[14:07:26]: webDir is `dist`
[14:07:26]: -----------------------------------
[14:07:26]: --- Step: modify_cap_web_config ---
[14:07:26]: -----------------------------------
[14:07:26]: No custom native config detected.
[14:07:26]: ---------------------------
[14:07:26]: --- Step: build_pro_app ---
[14:07:26]: ---------------------------
[14:07:26]: Building app from /Users/ionic-cloud-team/builds/sandroallada-png/mcf
[14:07:26]: Build script detected...
[14:07:26]: $ npm run build
[14:07:27]: ▸ > my-cook-flex@0.1.0 build
[14:07:27]: ▸ > next build
[14:07:28]: ▸ ⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
[14:07:28]: ▸ Attention: Next.js now collects completely anonymous telemetry regarding usage.
[14:07:28]: ▸ This information is used to shape Next.js' roadmap and prioritize features.
[14:07:28]: ▸ You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[14:07:28]: ▸ https://nextjs.org/telemetry
[14:07:28]: ▸ ▲ Next.js 15.3.8
[14:07:28]: ▸ - Environments: .env
[14:07:28]: ▸   Creating an optimized production build ...
[14:07:47]: ▸ warn - The class `duration-[2s]` is ambiguous and matches multiple utilities.
[14:07:47]: ▸ warn - If this is content and not a class, replace it with `duration-&lsqb;2s&rsqb;` to silence this warning.
[14:07:53]: ▸ ✓ Compiled successfully in 24.0s
[14:07:53]: ▸   Skipping validation of types
[14:07:53]: ▸   Skipping linting
[14:07:53]: ▸   Collecting page data ...
[14:07:57]: ▸   Generating static pages (0/57) ...
[14:07:58]: ▸ 🌐 i18next is made possible by our own product, Locize — consider powering your project with managed localization (AI, CDN, integrations): https://locize.com 💙
[14:07:58]: ▸ 🌐 i18next is made possible by our own product, Locize — consider powering your project with managed localization (AI, CDN, integrations): https://locize.com 💙
[14:07:58]: ▸ 🌐 i18next is made possible by our own product, Locize — consider powering your project with managed localization (AI, CDN, integrations): https://locize.com 💙
[14:07:58]: ▸   Generating static pages (14/57)
[14:07:58]: ▸   Generating static pages (28/57)
[14:07:58]: ▸   Generating static pages (42/57)
[14:07:58]: ▸ ✓ Generating static pages (57/57)
[14:07:58]: ▸   Finalizing page optimization ...
[14:07:58]: ▸   Collecting build traces ...
[14:08:02]: ▸ Route (app)                                  Size  First Load JS    
[14:08:02]: ▸ ┌ ○ /                                     3.15 kB         280 kB
[14:08:02]: ▸ ├ ○ /_not-found                             990 B         103 kB
[14:08:02]: ▸ ├ ○ /admin                                3.02 kB         372 kB
[14:08:02]: ▸ ├ ○ /admin/atelier                          12 kB         426 kB
[14:08:02]: ▸ ├ ○ /admin/carousel                       8.44 kB         415 kB
[14:08:02]: ▸ ├ ○ /admin/deleted-members                4.68 kB         378 kB
[14:08:02]: ▸ ├ ○ /admin/dishes                         16.8 kB         434 kB
[14:08:02]: ▸ ├ ○ /admin/feedbacks                      4.01 kB         373 kB
[14:08:02]: ▸ ├ ○ /admin/follow-up                       113 kB         493 kB
[14:08:02]: ▸ ├ ○ /admin/messages                       1.48 kB         371 kB
[14:08:02]: ▸ ├ ○ /admin/notifications                  2.91 kB         372 kB
[14:08:02]: ▸ ├ ○ /admin/promotions                     9.98 kB         417 kB
[14:08:02]: ▸ ├ ○ /admin/publications                   4.08 kB         377 kB
[14:08:02]: ▸ ├ ○ /admin/users                          6.77 kB         397 kB
[14:08:02]: ▸ ├ ƒ /api/ai/chat                            194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/estimate-calories               194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/explain-calorie-goal            194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/generate-meal-plan              194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/generate-recipe                 194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/generate-reminder               194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/generate-shopping-list          194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/generate-title                  194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/get-invite                      194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/get-motivational-message        194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/get-recommended-dishes          194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/provide-dietary-tips            194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/recipes-from-ingredients        194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/suggest-day-plan                194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/suggest-healthy-replacements    194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/suggest-single-meal             194 B         102 kB
[14:08:02]: ▸ ├ ƒ /api/ai/track-interaction               194 B         102 kB
[14:08:02]: ▸ ├ ○ /atelier                              8.59 kB         517 kB
[14:08:02]: ▸ ├ ƒ /atelier/recipe/[id]                   6.9 kB         419 kB
[14:08:02]: ▸ ├ ○ /avatar-selection                     13.4 kB         342 kB
[14:08:02]: ▸ ├ ○ /box                                  11.8 kB         443 kB
[14:08:02]: ▸ ├ ○ /boxe                                 9.75 kB         441 kB
[14:08:02]: ▸ ├ ○ /calendar                             6.31 kB         432 kB
[14:08:02]: ▸ ├ ○ /courses                              4.72 kB         378 kB
[14:08:02]: ▸ ├ ○ /cuisine                              22.3 kB         500 kB
[14:08:02]: ▸ ├ ○ /dashboard                            26.2 kB         535 kB
[14:08:02]: ▸ ├ ○ /denied                               4.58 kB         290 kB
[14:08:02]: ▸ ├ ○ /forgot-password                      3.65 kB         293 kB
[14:08:02]: ▸ ├ ○ /foyer-control                        6.14 kB         386 kB
[14:08:02]: ▸ ├ ƒ /foyer/[id]                           1.27 kB         273 kB
[14:08:02]: ▸ ├ ○ /fridge                               5.83 kB         382 kB
[14:08:02]: ▸ ├ ƒ /join-family/[inviteId]               4.67 kB         285 kB
[14:08:02]: ▸ ├ ○ /login                                5.71 kB         207 kB
[14:08:02]: ▸ ├ ○ /mon-niveau                           5.06 kB         374 kB
[14:08:02]: ▸ ├ ○ /my-flex-ai                             11 kB         462 kB
[14:08:02]: ▸ ├ ○ /notifications                        3.11 kB         415 kB
[14:08:02]: ▸ ├ ○ /personalization                      10.3 kB         366 kB
[14:08:02]: ▸ ├ ○ /preferences                          9.15 kB         331 kB
[14:08:02]: ▸ ├ ○ /pricing                              11.9 kB         307 kB
[14:08:02]: ▸ ├ ○ /register                             6.72 kB         335 kB
[14:08:02]: ▸ ├ ○ /settings                             12.7 kB         431 kB
[14:08:02]: ▸ ├ ○ /settings/privacy                     2.24 kB         371 kB
[14:08:02]: ▸ ├ ○ /settings/terms                       2.35 kB         372 kB
[14:08:02]: ▸ └ ○ /welcome                              10.7 kB         333 kB
[14:08:02]: ▸ + First Load JS shared by all              102 kB
[14:08:02]: ▸ ├ chunks/1684-db3844069279775f.js       46.4 kB
[14:08:02]: ▸ ├ chunks/4bd1b696-0b6a7111c5ee985d.js   53.2 kB
[14:08:02]: ▸ └ other shared chunks (total)            2.2 kB
[14:08:02]: ▸ ○  (Static)   prerendered as static content
[14:08:02]: ▸ ƒ  (Dynamic)  server-rendered on demand
[14:08:02]: $ ionic info
[14:08:04]: ▸ Ionic:
[14:08:04]: ▸ Ionic CLI : 7.2.1 (/Users/ionic-cloud-team/.nvm/versions/node/v22.22.0/lib/node_modules/@ionic/cli)
[14:08:04]: ▸ Capacitor:
[14:08:04]: ▸ Capacitor CLI      : 8.1.0
[14:08:04]: ▸ @capacitor/android : 8.1.0
[14:08:04]: ▸ @capacitor/core    : 8.1.0
[14:08:04]: ▸ @capacitor/ios     : 8.1.0
[14:08:04]: ▸ Utility:
[14:08:04]: ▸ cordova-res : 0.15.4
[14:08:04]: ▸ native-run  : 2.0.3
[14:08:04]: ▸ System:
[14:08:04]: ▸ NodeJS : v22.22.0 (/Users/ionic-cloud-team/.nvm/versions/node/v22.22.0/bin/node)
[14:08:04]: ▸ npm    : 10.9.4
[14:08:04]: ▸ OS     : macOS Unknown
[14:08:04]: Generating app manifest...
[14:08:05]: -------------------------------------
[14:08:05]: --- Step: get_xcode_project_paths ---
[14:08:05]: -------------------------------------
[14:08:05]: -------------------------------
[14:08:05]: --- Step: modify_ios_config ---
[14:08:05]: -------------------------------
[14:08:05]: No custom native config detected.
[14:08:05]: ----------------------
[14:08:05]: --- Step: cap_sync ---
[14:08:05]: ----------------------
[14:08:05]: $ npx cap sync ios
[14:08:06]: ▸ ✔ Copying web assets from dist to ios/App/App/public in 3.22ms
[14:08:06]: ▸ ✔ Creating capacitor.config.json in ios/App/App in 476.00μs
[14:08:07]: ▸ ✔ copy ios in 85.81ms
[14:08:07]: ▸ ✔ Updating iOS plugins in 9.85ms
[14:08:07]: ▸ [info] All plugins have a Package.swift file and will be included in Package.swift
[14:08:07]: ▸ [info] Writing Package.swift
[14:08:07]: ▸ [info] Found 2 Capacitor plugins for ios:
[14:08:07]: ▸ @capacitor-firebase/authentication@8.1.0
[14:08:07]: ▸ @capacitor/app@8.0.1
[14:08:07]: ▸ ✔ update ios in 101.11ms
[14:08:07]: ▸ [info] Sync finished in 0.335s
[14:08:07]: -------------------------------
[14:08:07]: --- Step: cap_custom_deploy ---
[14:08:07]: -------------------------------
[14:08:07]: No custom native config detected.
[14:08:07]: ------------------------------------------
[14:08:07]: --- Step: update_code_signing_settings ---
[14:08:07]: ------------------------------------------

+---------------------------------------------------------------------------------------------------+
|                                 Summary for code signing settings                                 |
+-----------------------+---------------------------------------------------------------------------+
| path                  | /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj |
| use_automatic_signing | false                                                                     |
| team_id               | KV825CMDG7                                                                |
| code_sign_identity    | iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7)                    |
+-----------------------+---------------------------------------------------------------------------+

[14:08:07]: Updating the Automatic Codesigning flag to disabled for the given project '/Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj/project.pbxproj'
[14:08:07]: Set Team id to: KV825CMDG7 for target: App for build configuration: Debug
[14:08:07]: Set Code Sign identity to: iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) for target: App for build configuration: Debug
[14:08:07]: Set Team id to: KV825CMDG7 for target: App for build configuration: Release
[14:08:07]: Set Code Sign identity to: iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) for target: App for build configuration: Release
[14:08:07]: Successfully updated project settings to use Code Sign Style = 'Manual'
[14:08:07]: Modified Targets:
[14:08:07]: 	 * App
[14:08:07]: Modified Build Configurations:
[14:08:07]: 	 * Debug
[14:08:07]: 	 * Release
[14:08:07]: ------------------------------------------
[14:08:07]: --- Step: update_provisioning_profiles ---
[14:08:07]: ------------------------------------------
[14:08:07]: ---------------------------
[14:08:07]: --- Step: build_ios_app ---
[14:08:07]: ---------------------------
[14:08:07]: Resolving Swift Package Manager dependencies...
[14:08:07]: $ xcodebuild -resolvePackageDependencies -scheme App -project /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj
[14:08:11]: ▸ Command line invocation:
[14:08:11]: ▸     /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -resolvePackageDependencies -scheme App -project /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj
[14:08:14]: ▸ Resolve Package Graph
[14:08:22]: ▸ Fetching from https://github.com/ionic-team/capacitor-swift-pm.git
[14:08:29]: ▸ Fetching from https://github.com/facebook/facebook-ios-sdk.git
[14:08:29]: ▸ Fetching from https://github.com/google/GoogleSignIn-iOS
[14:08:29]: ▸ Fetching from https://github.com/firebase/firebase-ios-sdk.git
[14:08:51]: ▸ Fetching from https://github.com/google/app-check.git
[14:08:51]: ▸ Fetching from https://github.com/google/GTMAppAuth.git
[14:08:51]: ▸ Fetching from https://github.com/google/gtm-session-fetcher.git
[14:08:52]: ▸ Fetching from https://github.com/openid/AppAuth-iOS.git
[14:08:54]: ▸ Fetching from https://github.com/google/GoogleUtilities.git
[14:08:55]: ▸ Fetching from https://github.com/google/promises.git
[14:08:57]: ▸ Fetching from https://github.com/firebase/leveldb.git
[14:08:58]: ▸ Fetching from https://github.com/google/interop-ios-for-google-sdks.git
[14:08:58]: ▸ Fetching from https://github.com/google/grpc-binary.git
[14:08:58]: ▸ Fetching from https://github.com/firebase/nanopb.git
[14:08:58]: ▸ Fetching from https://github.com/google/abseil-cpp-binary.git
[14:08:58]: ▸ Fetching from https://github.com/google/GoogleDataTransport.git
[14:08:58]: ▸ Fetching from https://github.com/google/GoogleAppMeasurement.git
[14:09:01]: ▸ Fetching from https://github.com/googleads/google-ads-on-device-conversion-ios-sdk
[14:09:03]: ▸ Creating working copy of package ‘gtm-session-fetcher’
[14:09:03]: ▸ Checking out 3.5.0 of package ‘gtm-session-fetcher’
[14:09:03]: ▸ Creating working copy of package ‘capacitor-swift-pm’
[14:09:03]: ▸ Checking out 8.1.0 of package ‘capacitor-swift-pm’
[14:09:03]: ▸ Creating working copy of package ‘app-check’
[14:09:04]: ▸ Checking out 11.2.0 of package ‘app-check’
[14:09:04]: ▸ Creating working copy of package ‘GoogleDataTransport’
[14:09:04]: ▸ Checking out 10.1.0 of package ‘GoogleDataTransport’
[14:09:04]: ▸ Creating working copy of package ‘GoogleAppMeasurement’
[14:09:04]: ▸ Checking out 12.11.0 of package ‘GoogleAppMeasurement’
[14:09:04]: ▸ Creating working copy of package ‘GoogleSignIn-iOS’
[14:09:04]: ▸ Checking out 9.1.0 of package ‘GoogleSignIn-iOS’
[14:09:04]: ▸ Creating working copy of package ‘AppAuth-iOS’
[14:09:04]: ▸ Checking out 2.0.0 of package ‘AppAuth-iOS’
[14:09:04]: ▸ Creating working copy of package ‘leveldb’
[14:09:04]: ▸ Checking out 1.22.5 of package ‘leveldb’
[14:09:04]: ▸ Creating working copy of package ‘GTMAppAuth’
[14:09:04]: ▸ Checking out 5.0.0 of package ‘GTMAppAuth’
[14:09:04]: ▸ Creating working copy of package ‘interop-ios-for-google-sdks’
[14:09:04]: ▸ Checking out 101.0.0 of package ‘interop-ios-for-google-sdks’
[14:09:05]: ▸ Creating working copy of package ‘GoogleUtilities’
[14:09:05]: ▸ Checking out 8.1.0 of package ‘GoogleUtilities’
[14:09:05]: ▸ Creating working copy of package ‘facebook-ios-sdk’
[14:09:05]: ▸ Checking out 18.0.3 of package ‘facebook-ios-sdk’
[14:09:05]: ▸ Creating working copy of package ‘firebase-ios-sdk’
[14:09:06]: ▸ Checking out 12.11.0 of package ‘firebase-ios-sdk’
[14:09:08]: ▸ Creating working copy of package ‘grpc-binary’
[14:09:08]: ▸ Checking out 1.69.1 of package ‘grpc-binary’
[14:09:08]: ▸ Creating working copy of package ‘promises’
[14:09:08]: ▸ Checking out 2.4.0 of package ‘promises’
[14:09:08]: ▸ Creating working copy of package ‘abseil-cpp-binary’
[14:09:08]: ▸ Checking out 1.2024072200.0 of package ‘abseil-cpp-binary’
[14:09:08]: ▸ Creating working copy of package ‘nanopb’
[14:09:08]: ▸ Checking out 2.30910.0 of package ‘nanopb’
[14:09:09]: ▸ Creating working copy of package ‘google-ads-on-device-conversion-ios-sdk’
[14:09:09]: ▸ Checking out 3.4.0 of package ‘google-ads-on-device-conversion-ios-sdk’
[14:10:00]: ▸ Resolved source packages:
[14:10:00]: ▸   AppCheck: https://github.com/google/app-check.git @ 11.2.0
[14:10:00]: ▸   GoogleDataTransport: https://github.com/google/GoogleDataTransport.git @ 10.1.0
[14:10:00]: ▸   Promises: https://github.com/google/promises.git @ 2.4.0
[14:10:00]: ▸   AppAuth: https://github.com/openid/AppAuth-iOS.git @ 2.0.0
[14:10:00]: ▸   GTMAppAuth: https://github.com/google/GTMAppAuth.git @ 5.0.0
[14:10:00]: ▸   Facebook: https://github.com/facebook/facebook-ios-sdk.git @ 18.0.3
[14:10:00]: ▸   leveldb: https://github.com/firebase/leveldb.git @ 1.22.5
[14:10:00]: ▸   CapApp-SPM: /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/CapApp-SPM @ local
[14:10:00]: ▸   GTMSessionFetcher: https://github.com/google/gtm-session-fetcher.git @ 3.5.0
[14:10:00]: ▸   GoogleUtilities: https://github.com/google/GoogleUtilities.git @ 8.1.0
[14:10:00]: ▸   GoogleAdsOnDeviceConversion: https://github.com/googleads/google-ads-on-device-conversion-ios-sdk @ 3.4.0
[14:10:00]: ▸   capacitor-swift-pm: https://github.com/ionic-team/capacitor-swift-pm.git @ 8.1.0
[14:10:00]: ▸   abseil: https://github.com/google/abseil-cpp-binary.git @ 1.2024072200.0
[14:10:00]: ▸   CapacitorFirebaseAuthentication: /Users/ionic-cloud-team/builds/sandroallada-png/mcf/node_modules/@capacitor-firebase/authentication @ local
[14:10:00]: ▸   GoogleAppMeasurement: https://github.com/google/GoogleAppMeasurement.git @ 12.11.0
[14:10:00]: ▸   gRPC: https://github.com/google/grpc-binary.git @ 1.69.1
[14:10:00]: ▸   CapacitorApp: /Users/ionic-cloud-team/builds/sandroallada-png/mcf/node_modules/@capacitor/app @ local
[14:10:00]: ▸   InteropForGoogle: https://github.com/google/interop-ios-for-google-sdks.git @ 101.0.0
[14:10:00]: ▸   GoogleSignIn: https://github.com/google/GoogleSignIn-iOS @ 9.1.0
[14:10:00]: ▸   Firebase: https://github.com/firebase/firebase-ios-sdk.git @ 12.11.0
[14:10:00]: ▸   nanopb: https://github.com/firebase/nanopb.git @ 2.30910.0
[14:10:00]: ▸ resolved source packages: AppCheck, GoogleDataTransport, Promises, AppAuth, GTMAppAuth, Facebook, leveldb, CapApp-SPM, GTMSessionFetcher, GoogleUtilities, GoogleAdsOnDeviceConversion, capacitor-swift-pm, abseil, CapacitorFirebaseAuthentication, GoogleAppMeasurement, gRPC, CapacitorApp, InteropForGoogle, GoogleSignIn, Firebase, nanopb
[14:10:01]: $ xcodebuild -showBuildSettings -scheme App -project /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj 2>&1
[14:10:04]: Command timed out after 3 seconds on try 1 of 4, trying again with a 6 second timeout...
[14:10:10]: Command timed out after 6 seconds on try 2 of 4, trying again with a 12 second timeout...
[14:10:22]: Command timed out after 12 seconds on try 3 of 4, trying again with a 24 second timeout...
[14:10:46]: Command timed out after 24 seconds on try 4 of 4
[14:10:46]: -------------------------
[14:10:46]: --- Step: upload_logs ---
[14:10:46]: -------------------------
[14:11:19]: --------------------------------------
[14:11:19]: --- Step: sentry_capture_exception ---
[14:11:19]: --------------------------------------
[14:11:25]: ---------------------------
[14:11:25]: --- Step: shell command ---
[14:11:25]: ---------------------------
[14:11:25]: xcodebuild -showBuildSettings timed out after 4 retries with a base timeout of 3. You can override the base timeout value with the environment variable FASTLANE_XCODEBUILD_SETTINGS_TIMEOUT, and the number of retries with the environment variable FASTLANE_XCODEBUILD_SETTINGS_RETRIES 
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
[14:11:25]: xcodebuild -showBuildSettings timed out after 4 retries with a base timeout of 3. You can override the base timeout value with the environment variable FASTLANE_XCODEBUILD_SETTINGS_TIMEOUT, and the number of retries with the environment variable FASTLANE_XCODEBUILD_SETTINGS_RETRIES 

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
| 6    | build_summary                | 3           |
| 7    | create_keychain              | 0           |
| 8    | get_ios_credentials_from_api | 0           |
| 9    | set_ios_credentials          | 0           |
| 10   | import_certificate           | 0           |
| 11   | set_ionic_cli                | 1           |
| 12   | detect_package_manager       | 0           |
| 13   | add_git_credentials          | 0           |
| 14   | get_appflow_config           | 0           |
| 15   | dependency_install           | 34          |
| 16   | create_capacitor_config      | 1           |
| 17   | detect_ios_package_manager   | 0           |
| 18   | get_web_dir                  | 0           |
| 19   | modify_cap_web_config        | 0           |
| 20   | build_pro_app                | 38          |
| 21   | get_xcode_project_paths      | 0           |
| 22   | modify_ios_config            | 0           |
| 23   | cap_sync                     | 1           |
| 24   | cap_custom_deploy            | 0           |
| 25   | update_code_signing_settings | 0           |
| 26   | update_provisioning_profiles | 0           |
| 💥   | build_ios_app                | 158         |
| 28   | upload_logs                  | 33          |
| 29   | sentry_capture_exception     | 5           |
| 30   | shell command                | 0           |
+------+------------------------------+-------------+

[14:11:25]: fastlane finished with errors

[!] xcodebuild -showBuildSettings timed out after 4 retries with a base timeout of 3. You can override the base timeout value with the environment variable FASTLANE_XCODEBUILD_SETTINGS_TIMEOUT, and the number of retries with the environment variable FASTLANE_XCODEBUILD_SETTINGS_RETRIES 
Running after_script
Running after script...
$ clean-up
Cleaning up project directory and file based variables
Terminating VM: build_stack_2026.01_arm64-1775052343427018000 (e7416c5c-60f0-4763-ab28-35c25adc8e9d) | Controller Instance ID: 284c7b26-b453-4661-4676-4a6a33b9d657 | Host: 10.2.146.68
ERROR: Job failed: Process exited with status 1