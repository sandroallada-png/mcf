#!/bin/bash
echo "Fixing iOS Signing for Appflow..."
sed -i '' 's/DEVELOPMENT_TEAM = "";/DEVELOPMENT_TEAM = "KV825CMDG7";/g' ios/App/App.xcodeproj/project.pbxproj
sed -i '' 's/CODE_SIGN_STYLE = Automatic;/CODE_SIGN_STYLE = Manual;/g' ios/App/App.xcodeproj/project.pbxproj
# Disable signing for all targets including SPM packages
# (Appflow's export step will handle the final main app signature)
sed -i '' 's/CODE_SIGNING_ALLOWED = YES/CODE_SIGNING_ALLOWED = NO/g' ios/App/App.xcodeproj/project.pbxproj
echo "Done!"
