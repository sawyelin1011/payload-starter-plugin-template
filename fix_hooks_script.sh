#!/bin/bash

# Script to fix beforeValidate hooks in all collections to properly handle undefined data

echo "Fixing hooks in collections..."

# Fix DigitalFiles
sed -i 's/({ data, operation, req }) => {/({ data, operation, req }) => {\n        if (!data) {return data}/' src/plugins/ecommerce/collections/DigitalFiles.ts

# Fix Inventory
sed -i 's/({ data, operation, req }) => {/({ data, operation, req }) => {\n        if (!data) {return data}/' src/plugins/ecommerce/collections/Inventory.ts

# Fix StoreSettings
sed -i 's/({ data, operation, req }) => {/({ data, operation, req }) => {\n        if (!data) {return data}/' src/plugins/ecommerce/collections/StoreSettings.ts

# Fix Subscriptions
sed -i 's/({ data, operation, req }) => {/({ data, operation, req }) => {\n        if (!data) {return data}/' src/plugins/ecommerce/collections/Subscriptions.ts

# Fix ThemeConfig
sed -i 's/({ data, operation, req }) => {/({ data, operation, req }) => {\n        if (!data) {return data}/' src/plugins/ecommerce/collections/ThemeConfig.ts

echo "Done!"
