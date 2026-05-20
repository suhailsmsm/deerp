#!/bin/bash
cd /Users/suhailsainulabdeen/Files/projects/deerp/mobile-app
echo "y" | npx expo start --web 2>&1 | tee /tmp/expo-full.log
