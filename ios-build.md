Running with gitlab-runner 14.10.1/1.6.1 (029651c8)
  on ANKA_RUNNER 161fa1c3
Preparing the "anka" executor
Opening a connection to the Anka Cloud Controller: https://controller.green.us-west-2.apple-orchard.net:443
Starting Anka VM using:
  - VM Template UUID: a2cafd4d-8237-47b3-83dc-47fdd53d37aa
  - VM Template Tag Name: v1
Please be patient...
You can check the status of starting your Instance on the Anka Cloud Controller: https://controller.green.us-west-2.apple-orchard.net:443/#/instances
Verifying connectivity to the VM: build_stack_2026.01_arm64-1775053004743284000 (40627d95-aa0d-489f-bae1-3caace0edc42) | Controller Instance ID: 7a6129e6-7d26-4868-7c34-fdecc0306255 | Host: 10.2.146.83 | Port: 10001 
VM "build_stack_2026.01_arm64-1775053004743284000" (40627d95-aa0d-489f-bae1-3caace0edc42) / Controller Instance ID 7a6129e6-7d26-4868-7c34-fdecc0306255 running on Node ip-10-2-146-83.us-west-2.compute.internal (10.2.146.83), is ready for work (10.2.146.83:10001)
Preparing environment
Running on ip-192-168-64-24.us-west-2.compute.internal via ip-10-2-129-215.us-west-2.compute.internal...
Getting source from Git repository
$ pre-clone
[14:17:31]: Cloning repository...
Fetching changes...
Initialized empty Git repository in /Users/ionic-cloud-team/builds/sandroallada-png/mcf/.git/
Created fresh repository.
failed to store: -25308
Checking out be8f30a0 as main...
Updating/initializing submodules...
$ post-clone
[14:17:33]: Cloning complete...
Executing "step_script" stage of the job script
$ pre-build
[14:17:34]: Building project....
$ fetch-updates || true
Checking for build process updates...
$ build-ios
Top level ::CompositeIO is deprecated, require 'multipart/post' and use `Multipart::Post::CompositeReadIO` instead!
Top level ::Parts is deprecated, require 'multipart/post' and use `Multipart::Post::Parts` instead!
[14:17:40]: ---------------------------------
[14:17:40]: --- Step: add_extra_platforms ---
[14:17:40]: ---------------------------------
[14:17:40]: Setting '[:web]' as extra SupportedPlatforms
[14:17:40]: ------------------------------
[14:17:40]: --- Step: default_platform ---
[14:17:40]: ------------------------------
[14:17:40]: Driving the lane 'ios build_capacitor' 🚀
[14:17:40]: ---------------------------------
[14:17:40]: --- Step: prepare_environment ---
[14:17:40]: ---------------------------------
[14:17:40]: Setting default environment variables to tidy up logs. These can be overridden by setting them in Appflow.
[14:17:40]: 
[14:17:40]: No changes needed - logs are already tidy! 🧹
[14:17:40]: -------------------------
[14:17:40]: --- Step: sentry_init ---
[14:17:40]: -------------------------
[14:17:40]: ----------------------------
[14:17:40]: --- Step: begin_building ---
[14:17:40]: ----------------------------
[14:17:40]: Began building @ 2026-04-01T14:17:40
[14:17:40]: ---------------------------
[14:17:40]: --- Step: build_summary ---
[14:17:40]: ---------------------------

+---------------------------------------------------+
|                   Build Summary                   |
+---------------------+-----------------------------+
| Runners Revision    | 4926248                     |
| Job ID              | 10840106                    |
| Node.js version     | v22.22.0                    |
| Cordova CLI version | 12.0.0 (cordova-lib@12.0.2) |
| npm version         | 10.9.4                      |
| yarn version        | 1.22.19                     |
| macOS version       | 15.6                        |
| Xcode version       | Xcode 26.2                  |
|                     | Build version 17C52         |
| Fastlane version    | fastlane (2.230.0)          |
+---------------------+-----------------------------+

[14:17:44]: -----------------------------
[14:17:44]: --- Step: create_keychain ---
[14:17:44]: -----------------------------
[14:17:44]: $ security list-keychains -d user
[14:17:44]: ▸ "/Users/ionic-cloud-team/Library/Keychains/login.keychain-db"
[14:17:44]: ------------------------------------------
[14:17:44]: --- Step: get_ios_credentials_from_api ---
[14:17:44]: ------------------------------------------
[14:17:44]: Fetching certificate and profile(s) from Ionic Appflow
[14:17:46]: ---------------------------------
[14:17:46]: --- Step: set_ios_credentials ---
[14:17:46]: ---------------------------------
[14:17:46]: Installing provisioning profile...
[14:17:46]: /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ca5009a3-c2f6-4a05-b7f1-1b719a43c05e.mobileprovision

+----------------------------------------------------------------------------+
|                           Installed Certificate                            |
+-------------------+--------------------------------------------------------+
| User ID           | KV825CMDG7                                             |
| Common Name       | iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) |
| Organization Unit | KV825CMDG7                                             |
| Organization      | Setondji Maxy Djisso                                   |
| Country           | FR                                                     |
+-------------------+--------------------------------------------------------+

[14:17:46]: --------------------------------
[14:17:46]: --- Step: import_certificate ---
[14:17:46]: --------------------------------
[14:17:47]: Setting key partition list... (this can take a minute if there are a lot of keys installed)
[14:17:47]: ---------------------------
[14:17:47]: --- Step: set_ionic_cli ---
[14:17:47]: ---------------------------
[14:17:48]: Preinstalled @ionic/cli compatible with project `custom`
[14:17:48]: ------------------------------------
[14:17:48]: --- Step: detect_package_manager ---
[14:17:48]: ------------------------------------
[14:17:48]: Detecting package manager
[14:17:48]: Defaulting to npm
[14:17:48]: ---------------------------------
[14:17:48]: --- Step: add_git_credentials ---
[14:17:48]: ---------------------------------
[14:17:48]: Writing git-credentials files
[14:17:48]: git-credentials successfully added to project
[14:17:48]: --------------------------------
[14:17:48]: --- Step: get_appflow_config ---
[14:17:48]: --------------------------------
[14:17:48]: Checking for appflow.config.json
[14:17:48]: Appflow config not detected
[14:17:48]: --------------------------------
[14:17:48]: --- Step: dependency_install ---
[14:17:48]: --------------------------------
[14:17:48]: Installing Dependencies (in /Users/ionic-cloud-team/builds/sandroallada-png/mcf)
[14:17:48]: $ npm ci --quiet 
[14:17:49]: ▸ npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
[14:17:49]: ▸ npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
[14:17:49]: ▸ npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[14:17:49]: ▸ npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
[14:17:49]: ▸ npm warn deprecated q@1.5.1: You or someone you depend on is using Q, the JavaScript Promise library that gave JavaScript developers strong feelings about promises. They can almost certainly migrate to the native JavaScript promise now. Thank you literally everyone for joining me in this bet against the odds. Be excellent to each other.
[14:17:49]: ▸ npm warn deprecated
[14:17:49]: ▸ npm warn deprecated (For a CapTP with native promises, see @endo/eventual-send and @endo/captp)
[14:17:50]: ▸ npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
[14:17:50]: ▸ npm warn deprecated tar@6.2.1: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
[14:17:51]: ▸ npm warn deprecated @types/xlsx@0.0.36: This is a stub types definition for xlsx (https://github.com/sheetjs/js-xlsx). xlsx provides its own type definitions, so you don't need @types/xlsx installed!
[14:17:52]: ▸ npm warn deprecated @xmldom/xmldom@0.7.13: this version is no longer supported, please update to at least 0.8.*
[14:17:52]: ▸ npm warn deprecated @xmldom/xmldom@0.7.13: this version is no longer supported, please update to at least 0.8.*
[14:17:53]: ▸ npm warn deprecated glob@9.3.5: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
[14:18:08]: ▸ added 982 packages, and audited 983 packages in 20s
[14:18:08]: ▸ 186 packages are looking for funding
[14:18:08]: ▸ run `npm fund` for details
[14:18:08]: ▸ 22 vulnerabilities (2 low, 5 moderate, 14 high, 1 critical)
[14:18:08]: ▸ To address issues that do not require attention, run:
[14:18:08]: ▸ npm audit fix
[14:18:08]: ▸ To address all issues possible (including breaking changes), run:
[14:18:08]: ▸ npm audit fix --force
[14:18:08]: ▸ Some issues need review, and may require choosing
[14:18:08]: ▸ a different dependency.
[14:18:08]: ▸ Run `npm audit` for details.
[14:18:08]: -------------------------------------
[14:18:08]: --- Step: create_capacitor_config ---
[14:18:08]: -------------------------------------
[14:18:09]: Created capacitor.config.json from capacitor.config.ts/js
[14:18:09]: ----------------------------------------
[14:18:09]: --- Step: detect_ios_package_manager ---
[14:18:09]: ----------------------------------------
[14:18:09]: Detected SPM project (found /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/CapApp-SPM)
[14:18:09]: Detected iOS package manager: spm
[14:18:09]: -------------------------
[14:18:09]: --- Step: get_web_dir ---
[14:18:09]: -------------------------
[14:18:09]: webDir is `dist`
[14:18:09]: -----------------------------------
[14:18:09]: --- Step: modify_cap_web_config ---
[14:18:09]: -----------------------------------
[14:18:09]: No custom native config detected.
[14:18:09]: ---------------------------
[14:18:09]: --- Step: build_pro_app ---
[14:18:09]: ---------------------------
[14:18:09]: Building app from /Users/ionic-cloud-team/builds/sandroallada-png/mcf
[14:18:09]: Build script detected...
[14:18:09]: $ npm run build
[14:18:09]: ▸ > my-cook-flex@0.1.0 build
[14:18:09]: ▸ > next build
[14:18:09]: ▸ ⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
[14:18:09]: ▸ Attention: Next.js now collects completely anonymous telemetry regarding usage.
[14:18:09]: ▸ This information is used to shape Next.js' roadmap and prioritize features.
[14:18:09]: ▸ You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[14:18:09]: ▸ https://nextjs.org/telemetry
[14:18:10]: ▸ ▲ Next.js 15.3.8
[14:18:10]: ▸ - Environments: .env
[14:18:10]: ▸   Creating an optimized production build ...
[14:18:33]: ▸ warn - The class `duration-[2s]` is ambiguous and matches multiple utilities.
[14:18:33]: ▸ warn - If this is content and not a class, replace it with `duration-&lsqb;2s&rsqb;` to silence this warning.
[14:18:39]: ▸ ✓ Compiled successfully in 29.0s
[14:18:39]: ▸   Skipping validation of types
[14:18:39]: ▸   Skipping linting
[14:18:39]: ▸   Collecting page data ...
[14:18:42]: ▸   Generating static pages (0/57) ...
[14:18:43]: ▸ 🌐 i18next is made possible by our own product, Locize — consider powering your project with managed localization (AI, CDN, integrations): https://locize.com 💙
[14:18:43]: ▸ 🌐 i18next is made possible by our own product, Locize — consider powering your project with managed localization (AI, CDN, integrations): https://locize.com 💙
[14:18:43]: ▸ 🌐 i18next is made possible by our own product, Locize — consider powering your project with managed localization (AI, CDN, integrations): https://locize.com 💙
[14:18:43]: ▸   Generating static pages (14/57)
[14:18:43]: ▸   Generating static pages (28/57)
[14:18:43]: ▸   Generating static pages (42/57)
[14:18:43]: ▸ ✓ Generating static pages (57/57)
[14:18:44]: ▸   Finalizing page optimization ...
[14:18:44]: ▸   Collecting build traces ...
[14:18:47]: ▸ Route (app)                                  Size  First Load JS    
[14:18:47]: ▸ ┌ ○ /                                     3.15 kB         280 kB
[14:18:47]: ▸ ├ ○ /_not-found                             990 B         103 kB
[14:18:47]: ▸ ├ ○ /admin                                3.02 kB         372 kB
[14:18:47]: ▸ ├ ○ /admin/atelier                          12 kB         426 kB
[14:18:47]: ▸ ├ ○ /admin/carousel                       8.44 kB         415 kB
[14:18:47]: ▸ ├ ○ /admin/deleted-members                4.68 kB         378 kB
[14:18:47]: ▸ ├ ○ /admin/dishes                         16.8 kB         434 kB
[14:18:47]: ▸ ├ ○ /admin/feedbacks                      4.01 kB         373 kB
[14:18:47]: ▸ ├ ○ /admin/follow-up                       113 kB         494 kB
[14:18:47]: ▸ ├ ○ /admin/messages                       1.48 kB         371 kB
[14:18:47]: ▸ ├ ○ /admin/notifications                  2.91 kB         372 kB
[14:18:47]: ▸ ├ ○ /admin/promotions                     9.98 kB         417 kB
[14:18:47]: ▸ ├ ○ /admin/publications                   4.08 kB         377 kB
[14:18:47]: ▸ ├ ○ /admin/users                          6.77 kB         397 kB
[14:18:47]: ▸ ├ ƒ /api/ai/chat                            194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/estimate-calories               194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/explain-calorie-goal            194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/generate-meal-plan              194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/generate-recipe                 194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/generate-reminder               194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/generate-shopping-list          194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/generate-title                  194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/get-invite                      194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/get-motivational-message        194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/get-recommended-dishes          194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/provide-dietary-tips            194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/recipes-from-ingredients        194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/suggest-day-plan                194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/suggest-healthy-replacements    194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/suggest-single-meal             194 B         102 kB
[14:18:47]: ▸ ├ ƒ /api/ai/track-interaction               194 B         102 kB
[14:18:47]: ▸ ├ ○ /atelier                              8.59 kB         518 kB
[14:18:47]: ▸ ├ ƒ /atelier/recipe/[id]                   6.9 kB         419 kB
[14:18:47]: ▸ ├ ○ /avatar-selection                     13.4 kB         342 kB
[14:18:47]: ▸ ├ ○ /box                                  11.8 kB         443 kB
[14:18:47]: ▸ ├ ○ /boxe                                 9.75 kB         441 kB
[14:18:47]: ▸ ├ ○ /calendar                             6.31 kB         432 kB
[14:18:47]: ▸ ├ ○ /courses                              4.72 kB         378 kB
[14:18:47]: ▸ ├ ○ /cuisine                              22.4 kB         500 kB
[14:18:47]: ▸ ├ ○ /dashboard                            26.2 kB         535 kB
[14:18:47]: ▸ ├ ○ /denied                               4.58 kB         290 kB
[14:18:47]: ▸ ├ ○ /forgot-password                      3.65 kB         293 kB
[14:18:47]: ▸ ├ ○ /foyer-control                        6.14 kB         386 kB
[14:18:47]: ▸ ├ ƒ /foyer/[id]                           1.27 kB         273 kB
[14:18:47]: ▸ ├ ○ /fridge                               5.83 kB         382 kB
[14:18:47]: ▸ ├ ƒ /join-family/[inviteId]               4.66 kB         285 kB
[14:18:47]: ▸ ├ ○ /login                                5.71 kB         207 kB
[14:18:47]: ▸ ├ ○ /mon-niveau                           5.09 kB         374 kB
[14:18:47]: ▸ ├ ○ /my-flex-ai                             11 kB         462 kB
[14:18:47]: ▸ ├ ○ /notifications                        3.11 kB         415 kB
[14:18:47]: ▸ ├ ○ /personalization                      10.3 kB         366 kB
[14:18:47]: ▸ ├ ○ /preferences                          9.15 kB         331 kB
[14:18:47]: ▸ ├ ○ /pricing                              11.9 kB         307 kB
[14:18:47]: ▸ ├ ○ /register                             6.72 kB         335 kB
[14:18:47]: ▸ ├ ○ /settings                             12.7 kB         431 kB
[14:18:47]: ▸ ├ ○ /settings/privacy                     2.24 kB         372 kB
[14:18:47]: ▸ ├ ○ /settings/terms                       2.35 kB         372 kB
[14:18:47]: ▸ └ ○ /welcome                              10.7 kB         333 kB
[14:18:47]: ▸ + First Load JS shared by all              102 kB
[14:18:47]: ▸ ├ chunks/1684-db3844069279775f.js       46.4 kB
[14:18:47]: ▸ ├ chunks/4bd1b696-0b6a7111c5ee985d.js   53.2 kB
[14:18:47]: ▸ └ other shared chunks (total)            2.2 kB
[14:18:47]: ▸ ○  (Static)   prerendered as static content
[14:18:47]: ▸ ƒ  (Dynamic)  server-rendered on demand
[14:18:47]: $ ionic info
[14:18:51]: ▸ Ionic:
[14:18:51]: ▸ Ionic CLI : 7.2.1 (/Users/ionic-cloud-team/.nvm/versions/node/v22.22.0/lib/node_modules/@ionic/cli)
[14:18:51]: ▸ Capacitor:
[14:18:51]: ▸ Capacitor CLI      : 8.1.0
[14:18:51]: ▸ @capacitor/android : 8.1.0
[14:18:51]: ▸ @capacitor/core    : 8.1.0
[14:18:51]: ▸ @capacitor/ios     : 8.1.0
[14:18:51]: ▸ Utility:
[14:18:51]: ▸ cordova-res : 0.15.4
[14:18:51]: ▸ native-run  : 2.0.3
[14:18:51]: ▸ System:
[14:18:51]: ▸ NodeJS : v22.22.0 (/Users/ionic-cloud-team/.nvm/versions/node/v22.22.0/bin/node)
[14:18:51]: ▸ npm    : 10.9.4
[14:18:51]: ▸ OS     : macOS Unknown
[14:18:51]: Generating app manifest...
[14:18:52]: -------------------------------------
[14:18:52]: --- Step: get_xcode_project_paths ---
[14:18:52]: -------------------------------------
[14:18:52]: -------------------------------
[14:18:52]: --- Step: modify_ios_config ---
[14:18:52]: -------------------------------
[14:18:52]: No custom native config detected.
[14:18:52]: ----------------------
[14:18:52]: --- Step: cap_sync ---
[14:18:52]: ----------------------
[14:18:52]: $ npx cap sync ios
[14:18:52]: ▸ ✔ Copying web assets from dist to ios/App/App/public in 3.85ms
[14:18:52]: ▸ ✔ Creating capacitor.config.json in ios/App/App in 1.02ms
[14:18:52]: ▸ ✔ copy ios in 61.00ms
[14:18:52]: ▸ ✔ Updating iOS plugins in 6.63ms
[14:18:52]: ▸ [info] All plugins have a Package.swift file and will be included in Package.swift
[14:18:52]: ▸ [info] Writing Package.swift
[14:18:52]: ▸ [info] Found 2 Capacitor plugins for ios:
[14:18:52]: ▸ @capacitor-firebase/authentication@8.1.0
[14:18:52]: ▸ @capacitor/app@8.0.1
[14:18:52]: ▸ ✔ update ios in 54.61ms
[14:18:52]: ▸ [info] Sync finished in 0.176s
[14:18:52]: -------------------------------
[14:18:52]: --- Step: cap_custom_deploy ---
[14:18:52]: -------------------------------
[14:18:52]: No custom native config detected.
[14:18:52]: ------------------------------------------
[14:18:52]: --- Step: update_code_signing_settings ---
[14:18:52]: ------------------------------------------

+---------------------------------------------------------------------------------------------------+
|                                 Summary for code signing settings                                 |
+-----------------------+---------------------------------------------------------------------------+
| path                  | /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj |
| use_automatic_signing | false                                                                     |
| team_id               | KV825CMDG7                                                                |
| code_sign_identity    | iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7)                    |
+-----------------------+---------------------------------------------------------------------------+

[14:18:53]: Updating the Automatic Codesigning flag to disabled for the given project '/Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj/project.pbxproj'
[14:18:53]: Set Team id to: KV825CMDG7 for target: App for build configuration: Debug
[14:18:53]: Set Code Sign identity to: iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) for target: App for build configuration: Debug
[14:18:53]: Set Team id to: KV825CMDG7 for target: App for build configuration: Release
[14:18:53]: Set Code Sign identity to: iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7) for target: App for build configuration: Release
[14:18:53]: Successfully updated project settings to use Code Sign Style = 'Manual'
[14:18:53]: Modified Targets:
[14:18:53]: 	 * App
[14:18:53]: Modified Build Configurations:
[14:18:53]: 	 * Debug
[14:18:53]: 	 * Release
[14:18:53]: ------------------------------------------
[14:18:53]: --- Step: update_provisioning_profiles ---
[14:18:53]: ------------------------------------------
[14:18:53]: ---------------------------
[14:18:53]: --- Step: build_ios_app ---
[14:18:53]: ---------------------------
[14:18:53]: Resolving Swift Package Manager dependencies...
[14:18:53]: $ xcodebuild -resolvePackageDependencies -scheme App -project /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj
[14:18:54]: ▸ Command line invocation:
[14:18:54]: ▸     /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -resolvePackageDependencies -scheme App -project /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj
[14:18:56]: ▸ Resolve Package Graph
[14:19:04]: ▸ Fetching from https://github.com/google/GoogleSignIn-iOS
[14:19:11]: ▸ Fetching from https://github.com/ionic-team/capacitor-swift-pm.git
[14:19:11]: ▸ Fetching from https://github.com/facebook/facebook-ios-sdk.git
[14:19:11]: ▸ Fetching from https://github.com/firebase/firebase-ios-sdk.git
[14:19:29]: ▸ Fetching from https://github.com/openid/AppAuth-iOS.git
[14:19:29]: ▸ Fetching from https://github.com/google/gtm-session-fetcher.git
[14:19:29]: ▸ Fetching from https://github.com/google/GTMAppAuth.git
[14:19:29]: ▸ Fetching from https://github.com/google/app-check.git
[14:19:31]: ▸ Fetching from https://github.com/google/promises.git
[14:19:32]: ▸ Fetching from https://github.com/google/GoogleUtilities.git
[14:19:34]: ▸ Fetching from https://github.com/google/abseil-cpp-binary.git
[14:19:34]: ▸ Fetching from https://github.com/firebase/leveldb.git
[14:19:34]: ▸ Fetching from https://github.com/google/grpc-binary.git
[14:19:34]: ▸ Fetching from https://github.com/google/GoogleDataTransport.git
[14:19:35]: ▸ Fetching from https://github.com/google/interop-ios-for-google-sdks.git
[14:19:35]: ▸ Fetching from https://github.com/google/GoogleAppMeasurement.git
[14:19:35]: ▸ Fetching from https://github.com/firebase/nanopb.git
[14:19:37]: ▸ Fetching from https://github.com/googleads/google-ads-on-device-conversion-ios-sdk
[14:19:39]: ▸ Creating working copy of package ‘google-ads-on-device-conversion-ios-sdk’
[14:19:39]: ▸ Checking out 3.4.0 of package ‘google-ads-on-device-conversion-ios-sdk’
[14:19:39]: ▸ Creating working copy of package ‘promises’
[14:19:39]: ▸ Checking out 2.4.0 of package ‘promises’
[14:19:39]: ▸ Creating working copy of package ‘grpc-binary’
[14:19:39]: ▸ Checking out 1.69.1 of package ‘grpc-binary’
[14:19:39]: ▸ Creating working copy of package ‘GoogleDataTransport’
[14:19:39]: ▸ Checking out 10.1.0 of package ‘GoogleDataTransport’
[14:19:39]: ▸ Creating working copy of package ‘nanopb’
[14:19:39]: ▸ Checking out 2.30910.0 of package ‘nanopb’
[14:19:39]: ▸ Creating working copy of package ‘capacitor-swift-pm’
[14:19:39]: ▸ Checking out 8.1.0 of package ‘capacitor-swift-pm’
[14:19:40]: ▸ Creating working copy of package ‘facebook-ios-sdk’
[14:19:40]: ▸ Checking out 18.0.3 of package ‘facebook-ios-sdk’
[14:19:40]: ▸ Creating working copy of package ‘firebase-ios-sdk’
[14:19:41]: ▸ Checking out 12.11.0 of package ‘firebase-ios-sdk’
[14:19:42]: ▸ Creating working copy of package ‘app-check’
[14:19:42]: ▸ Checking out 11.2.0 of package ‘app-check’
[14:19:42]: ▸ Creating working copy of package ‘leveldb’
[14:19:42]: ▸ Checking out 1.22.5 of package ‘leveldb’
[14:19:42]: ▸ Creating working copy of package ‘GoogleSignIn-iOS’
[14:19:42]: ▸ Checking out 9.1.0 of package ‘GoogleSignIn-iOS’
[14:19:43]: ▸ Creating working copy of package ‘AppAuth-iOS’
[14:19:43]: ▸ Checking out 2.0.0 of package ‘AppAuth-iOS’
[14:19:43]: ▸ Creating working copy of package ‘GoogleAppMeasurement’
[14:19:43]: ▸ Checking out 12.11.0 of package ‘GoogleAppMeasurement’
[14:19:43]: ▸ Creating working copy of package ‘abseil-cpp-binary’
[14:19:43]: ▸ Checking out 1.2024072200.0 of package ‘abseil-cpp-binary’
[14:19:43]: ▸ Creating working copy of package ‘gtm-session-fetcher’
[14:19:43]: ▸ Checking out 3.5.0 of package ‘gtm-session-fetcher’
[14:19:43]: ▸ Creating working copy of package ‘GoogleUtilities’
[14:19:43]: ▸ Checking out 8.1.0 of package ‘GoogleUtilities’
[14:19:43]: ▸ Creating working copy of package ‘interop-ios-for-google-sdks’
[14:19:43]: ▸ Checking out 101.0.0 of package ‘interop-ios-for-google-sdks’
[14:19:43]: ▸ Creating working copy of package ‘GTMAppAuth’
[14:19:43]: ▸ Checking out 5.0.0 of package ‘GTMAppAuth’
[14:20:12]: ▸ Resolved source packages:
[14:20:12]: ▸   CapacitorApp: /Users/ionic-cloud-team/builds/sandroallada-png/mcf/node_modules/@capacitor/app @ local
[14:20:12]: ▸   GoogleAppMeasurement: https://github.com/google/GoogleAppMeasurement.git @ 12.11.0
[14:20:12]: ▸   InteropForGoogle: https://github.com/google/interop-ios-for-google-sdks.git @ 101.0.0
[14:20:12]: ▸   abseil: https://github.com/google/abseil-cpp-binary.git @ 1.2024072200.0
[14:20:12]: ▸   GoogleDataTransport: https://github.com/google/GoogleDataTransport.git @ 10.1.0
[14:20:12]: ▸   AppCheck: https://github.com/google/app-check.git @ 11.2.0
[14:20:12]: ▸   Facebook: https://github.com/facebook/facebook-ios-sdk.git @ 18.0.3
[14:20:12]: ▸   gRPC: https://github.com/google/grpc-binary.git @ 1.69.1
[14:20:12]: ▸   Firebase: https://github.com/firebase/firebase-ios-sdk.git @ 12.11.0
[14:20:12]: ▸   Promises: https://github.com/google/promises.git @ 2.4.0
[14:20:12]: ▸   nanopb: https://github.com/firebase/nanopb.git @ 2.30910.0
[14:20:12]: ▸   GTMAppAuth: https://github.com/google/GTMAppAuth.git @ 5.0.0
[14:20:12]: ▸   GTMSessionFetcher: https://github.com/google/gtm-session-fetcher.git @ 3.5.0
[14:20:12]: ▸   CapApp-SPM: /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/CapApp-SPM @ local
[14:20:12]: ▸   capacitor-swift-pm: https://github.com/ionic-team/capacitor-swift-pm.git @ 8.1.0
[14:20:12]: ▸   GoogleSignIn: https://github.com/google/GoogleSignIn-iOS @ 9.1.0
[14:20:12]: ▸   GoogleAdsOnDeviceConversion: https://github.com/googleads/google-ads-on-device-conversion-ios-sdk @ 3.4.0
[14:20:12]: ▸   AppAuth: https://github.com/openid/AppAuth-iOS.git @ 2.0.0
[14:20:12]: ▸   leveldb: https://github.com/firebase/leveldb.git @ 1.22.5
[14:20:12]: ▸   CapacitorFirebaseAuthentication: /Users/ionic-cloud-team/builds/sandroallada-png/mcf/node_modules/@capacitor-firebase/authentication @ local
[14:20:12]: ▸   GoogleUtilities: https://github.com/google/GoogleUtilities.git @ 8.1.0
[14:20:12]: ▸ resolved source packages: CapacitorApp, GoogleAppMeasurement, InteropForGoogle, abseil, GoogleDataTransport, AppCheck, Facebook, gRPC, Firebase, Promises, nanopb, GTMAppAuth, GTMSessionFetcher, CapApp-SPM, capacitor-swift-pm, GoogleSignIn, GoogleAdsOnDeviceConversion, AppAuth, leveldb, CapacitorFirebaseAuthentication, GoogleUtilities
[14:20:12]: $ xcodebuild -showBuildSettings -scheme App -project /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj 2>&1
[14:21:09]: Detected provisioning profile mapping: {"my.cook.flex": "mcf-distribution"}

+------------------------------------------------------------------------------------------------------------------------------+
|                                                   Summary for gym 2.230.0                                                    |
+--------------------------------------------------+---------------------------------------------------------------------------+
| project                                          | /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj |
| output_directory                                 | /Users/ionic-cloud-team/builds/sandroallada-png/mcf                       |
| output_name                                      | 436ebfe7-f33f-4d4c-9c27-a2707df7a19f-app-store                            |
| archive_path                                     | 436ebfe7-f33f-4d4c-9c27-a2707df7a19f-app-store.xcarchive                  |
| scheme                                           | App                                                                       |
| codesigning_identity                             | iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7)                    |
| export_team_id                                   | KV825CMDG7                                                                |
| catalyst_platform                                | ios                                                                       |
| export_options.provisioningProfiles.my.cook.flex | mcf-distribution                                                          |
| clean                                            | false                                                                     |
| silent                                           | false                                                                     |
| skip_package_ipa                                 | false                                                                     |
| export_method                                    | app-store                                                                 |
| build_path                                       | /Users/ionic-cloud-team/Library/Developer/Xcode/Archives/2026-04-01       |
| result_bundle                                    | false                                                                     |
| buildlog_path                                    | ~/Library/Logs/gym                                                        |
| destination                                      | generic/platform=iOS                                                      |
| xcodebuild_formatter                             | xcbeautify                                                                |
| build_timing_summary                             | false                                                                     |
| skip_profile_detection                           | false                                                                     |
| xcodebuild_command                               | xcodebuild                                                                |
| skip_package_dependencies_resolution             | false                                                                     |
| disable_package_automatic_updates                | false                                                                     |
| use_system_scm                                   | false                                                                     |
| generate_appstore_info                           | false                                                                     |
| skip_package_pkg                                 | false                                                                     |
| xcode_path                                       | /Applications/Xcode.app                                                   |
+--------------------------------------------------+---------------------------------------------------------------------------+

[14:21:10]: $ set -o pipefail && xcodebuild -scheme App -project /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj -destination 'generic/platform=iOS' -archivePath 436ebfe7-f33f-4d4c-9c27-a2707df7a19f-app-store.xcarchive archive CODE_SIGN_IDENTITY=iPhone\ Distribution:\ Setondji\ Maxy\ Djisso\ \(KV825CMDG7\) | tee /Users/ionic-cloud-team/Library/Logs/gym/App-App.log | xcbeautify
[14:21:10]: ▸ ----- xcbeautify -----
[14:21:10]: ▸ Version: 3.1.2
[14:21:10]: ▸ ----------------------
[14:21:18]: ▸ Resolving Package Graph
[14:21:22]: ▸ Resolved source packages
[14:21:22]: ▸ gRPC - https://github.com/google/grpc-binary.git @ 1.69.1
[14:21:22]: ▸ GTMSessionFetcher - https://github.com/google/gtm-session-fetcher.git @ 3.5.0
[14:21:22]: ▸ leveldb - https://github.com/firebase/leveldb.git @ 1.22.5
[14:21:22]: ▸ Promises - https://github.com/google/promises.git @ 2.4.0
[14:21:22]: ▸ nanopb - https://github.com/firebase/nanopb.git @ 2.30910.0
[14:21:22]: ▸ capacitor-swift-pm - https://github.com/ionic-team/capacitor-swift-pm.git @ 8.1.0
[14:21:22]: ▸ GoogleSignIn - https://github.com/google/GoogleSignIn-iOS @ 9.1.0
[14:21:22]: ▸ AppCheck - https://github.com/google/app-check.git @ 11.2.0
[14:21:22]: ▸ InteropForGoogle - https://github.com/google/interop-ios-for-google-sdks.git @ 101.0.0
[14:21:22]: ▸ Facebook - https://github.com/facebook/facebook-ios-sdk.git @ 18.0.3
[14:21:22]: ▸ GTMAppAuth - https://github.com/google/GTMAppAuth.git @ 5.0.0
[14:21:22]: ▸ GoogleDataTransport - https://github.com/google/GoogleDataTransport.git @ 10.1.0
[14:21:22]: ▸ GoogleAppMeasurement - https://github.com/google/GoogleAppMeasurement.git @ 12.11.0
[14:21:22]: ▸ GoogleUtilities - https://github.com/google/GoogleUtilities.git @ 8.1.0
[14:21:22]: ▸ GoogleAdsOnDeviceConversion - https://github.com/googleads/google-ads-on-device-conversion-ios-sdk @ 3.4.0
[14:21:22]: ▸ Firebase - https://github.com/firebase/firebase-ios-sdk.git @ 12.11.0
[14:21:22]: ▸ abseil - https://github.com/google/abseil-cpp-binary.git @ 1.2024072200.0
[14:21:22]: ▸ AppAuth - https://github.com/openid/AppAuth-iOS.git @ 2.0.0
[14:21:22]: ▸ note: Using codesigning identity override: iPhone Distribution: Setondji Maxy Djisso (KV825CMDG7)
[14:21:27]: ▸ note: Building targets in dependency order
[14:21:27]: ▸ note: Target dependency graph (73 targets)
[14:21:42]: ▸ ❌ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: Signing for "GoogleUtilities_GoogleUtilities-Environment" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-Environment' from project 'GoogleUtilities')
[14:21:42]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/firebase-ios-sdk/Package.swift: error: Signing for "Firebase_FirebaseAuth" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'Firebase_FirebaseAuth' from project 'Firebase')
[14:21:42]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: error: Signing for "GoogleUtilities_GoogleUtilities-Logger" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-Logger' from project 'GoogleUtilities')
[14:21:42]: ▸ ❌ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/AppAuth-iOS/Package.swift: Signing for "AppAuth_AppAuth" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'AppAuth_AppAuth' from project 'AppAuth')
[14:21:42]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: error: Signing for "GoogleUtilities_GoogleUtilities-Reachability" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-Reachability' from project 'GoogleUtilities')
[14:21:42]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/gtm-session-fetcher/Package.swift: error: Signing for "GTMSessionFetcher_GTMSessionFetcherCore" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'GTMSessionFetcher_GTMSessionFetcherCore' from project 'GTMSessionFetcher')
[14:21:42]: ▸ ❌ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/facebook-ios-sdk/Package.swift: Signing for "Facebook_FacebookAEM" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'Facebook_FacebookAEM' from project 'Facebook')
[14:21:42]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: error: Signing for "GoogleUtilities_GoogleUtilities-UserDefaults" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-UserDefaults' from project 'GoogleUtilities')
[14:21:42]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GTMAppAuth/Package.swift: error: Signing for "GTMAppAuth_GTMAppAuth" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'GTMAppAuth_GTMAppAuth' from project 'GTMAppAuth')
[14:21:42]: ▸ ❌ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/firebase-ios-sdk/Package.swift: Signing for "Firebase_FirebaseCoreInternal" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'Firebase_FirebaseCoreInternal' from project 'Firebase')
[14:21:42]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/facebook-ios-sdk/Package.swift: error: Signing for "Facebook_FacebookCore" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'Facebook_FacebookCore' from project 'Facebook')
[14:21:42]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/AppAuth-iOS/Package.swift: error: Signing for "AppAuth_AppAuthCore" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'AppAuth_AppAuthCore' from project 'AppAuth')
[14:21:42]: ▸ ❌ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: Signing for "GoogleUtilities_GoogleUtilities-Network" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-Network' from project 'GoogleUtilities')
[14:21:42]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/facebook-ios-sdk/Package.swift: error: Signing for "Facebook_FacebookLogin" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'Facebook_FacebookLogin' from project 'Facebook')
[14:21:42]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/firebase-ios-sdk/Package.swift: error: Signing for "Firebase_FirebaseCore" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'Firebase_FirebaseCore' from project 'Firebase')
[14:21:42]: ▸ ❌ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleSignIn-iOS/Package.swift: Signing for "GoogleSignIn_GoogleSignIn" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'GoogleSignIn_GoogleSignIn' from project 'GoogleSignIn')
[14:21:42]: ▸ /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj: error: "App" requires a provisioning profile. Select a provisioning profile in the Signing & Capabilities editor. (in target 'App' from project 'App')
[14:21:42]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/promises/Package.swift: error: Signing for "Promises_FBLPromises" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'Promises_FBLPromises' from project 'Promises')
[14:21:42]: ▸ ❌ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: Signing for "GoogleUtilities_GoogleUtilities-NSData" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-NSData' from project 'GoogleUtilities')
[14:21:42]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/firebase-ios-sdk/Package.swift: error: Signing for "Firebase_FirebaseCoreExtension" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'Firebase_FirebaseCoreExtension' from project 'Firebase')
[14:21:42]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: error: Signing for "GoogleUtilities_GoogleUtilities-AppDelegateSwizzler" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-AppDelegateSwizzler' from project 'GoogleUtilities')
[14:21:42]: ▸ ** ARCHIVE FAILED **
[14:21:42]: ▸ The following build commands failed:
[14:21:42]: ▸ 	Archiving project App with scheme App
[14:21:42]: ▸ (1 failure)
[14:21:43]: Exit status: 65

+-----------------------------------------+
|            Build environment            |
+---------------+-------------------------+
| xcode_path    | /Applications/Xcode.app |
| gym_version   | 2.230.0                 |
| export_method | app-store               |
| sdk           | iPhoneOS26.2.sdk        |
+---------------+-------------------------+

[14:21:43]: ▸ /Users/ionic-cloud-team/builds/sandroallada-png/mcf/ios/App/App.xcodeproj: error: "App" requires a provisioning profile. Select a provisioning profile in the Signing & Capabilities editor. (in target 'App' from project 'App')
[14:21:43]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/promises/Package.swift: error: Signing for "Promises_FBLPromises" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'Promises_FBLPromises' from project 'Promises')
[14:21:43]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: error: Signing for "GoogleUtilities_GoogleUtilities-NSData" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-NSData' from project 'GoogleUtilities')
[14:21:43]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/firebase-ios-sdk/Package.swift: error: Signing for "Firebase_FirebaseCoreExtension" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'Firebase_FirebaseCoreExtension' from project 'Firebase')
[14:21:43]: ▸ /Users/ionic-cloud-team/Library/Developer/Xcode/DerivedData/App-bbvzsewqzsxvlogrbtnkemzmgwnt/SourcePackages/checkouts/GoogleUtilities/Package.swift: error: Signing for "GoogleUtilities_GoogleUtilities-AppDelegateSwizzler" requires a development team. Select a development team in the Signing & Capabilities editor. (in target 'GoogleUtilities_GoogleUtilities-AppDelegateSwizzler' from project 'GoogleUtilities')
[14:21:43]: 
[14:21:43]: ⬆️  Check out the few lines of raw `xcodebuild` output above for potential hints on how to solve this error
[14:21:43]: 📋  For the complete and more detailed error log, check the full log at:
[14:21:43]: 📋  /Users/ionic-cloud-team/Library/Logs/gym/App-App.log
[14:21:43]: 
[14:21:43]: Looks like fastlane ran into a build/archive error with your project
[14:21:43]: It's hard to tell what's causing the error, so we wrote some guides on how
[14:21:43]: to troubleshoot build and signing issues: https://docs.fastlane.tools/codesigning/getting-started/
[14:21:43]: Before submitting an issue on GitHub, please follow the guide above and make
[14:21:43]: sure your project is set up correctly.
[14:21:43]: fastlane uses `xcodebuild` commands to generate your binary, you can see the
[14:21:43]: the full commands printed out in yellow in the above log.
[14:21:43]: Make sure to inspect the output above, as usually you'll find more error information there
[14:21:43]: 
[14:21:43]: -------------------------
[14:21:43]: --- Step: upload_logs ---
[14:21:43]: -------------------------
[14:22:00]: --------------------------------------
[14:22:00]: --- Step: sentry_capture_exception ---
[14:22:00]: --------------------------------------
[14:22:06]: ---------------------------
[14:22:06]: --- Step: shell command ---
[14:22:06]: ---------------------------
[14:22:06]: Error building the application - see the log above
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
[14:22:06]: Error building the application - see the log above

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
| 8    | get_ios_credentials_from_api | 1           |
| 9    | set_ios_credentials          | 0           |
| 10   | import_certificate           | 0           |
| 11   | set_ionic_cli                | 1           |
| 12   | detect_package_manager       | 0           |
| 13   | add_git_credentials          | 0           |
| 14   | get_appflow_config           | 0           |
| 15   | dependency_install           | 20          |
| 16   | create_capacitor_config      | 0           |
| 17   | detect_ios_package_manager   | 0           |
| 18   | get_web_dir                  | 0           |
| 19   | modify_cap_web_config        | 0           |
| 20   | build_pro_app                | 42          |
| 21   | get_xcode_project_paths      | 0           |
| 22   | modify_ios_config            | 0           |
| 23   | cap_sync                     | 0           |
| 24   | cap_custom_deploy            | 0           |
| 25   | update_code_signing_settings | 0           |
| 26   | update_provisioning_profiles | 0           |
| 💥   | build_ios_app                | 170         |
| 28   | upload_logs                  | 17          |
| 29   | sentry_capture_exception     | 5           |
| 30   | shell command                | 0           |
+------+------------------------------+-------------+

[14:22:06]: fastlane finished with errors

[!] Error building the application - see the log above
Running after_script
Running after script...
$ clean-up
Cleaning up project directory and file based variables
Terminating VM: build_stack_2026.01_arm64-1775053004743284000 (40627d95-aa0d-489f-bae1-3caace0edc42) | Controller Instance ID: 7a6129e6-7d26-4868-7c34-fdecc0306255 | Host: 10.2.146.83
ERROR: Job failed: Process exited with status 1