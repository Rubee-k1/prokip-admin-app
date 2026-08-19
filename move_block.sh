#!/bin/bash
# First, extract the block to a temporary file
sed -n '9768,9866p' components/AdminHRCenterView.tsx > block_to_move.txt

# Delete the block from its current location
sed -i '9768,9866d' components/AdminHRCenterView.tsx

# Insert the block before the Workspace Sub-Navigation Tab Switcher
# Which is currently around line 9713 after deletion
sed -i '/{\/\* Workspace Sub-Navigation Tab Switcher \*\//e cat block_to_move.txt' components/AdminHRCenterView.tsx
