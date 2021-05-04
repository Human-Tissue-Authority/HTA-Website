#!/bin/bash
# Remove unecessary Drupal core files from web-accessible folders.
#
# The purpose of this script is for security: plain text files can be read by
# any frontend user, and can sometimes be used to work out the version of
# Drupal. This could constitute a security risk.
#
# Note: core cannot be patched for this (even though these files are listed in
# the core/composer.json file) as the scaffold files are pulled out by composer
# prior to patches being applied.
#
# @author PK
[[ -f web/example.gitignore ]] && rm web/example.gitignore
[[ -f web/INSTALL.txt ]] && rm web/INSTALL.txt
[[ -f web/README.txt ]] && rm web/README.txt
[[ -f web/update.php ]] && rm web/update.php
[[ -f web/web.config ]] && rm web/web.config
[[ -f web/.gitignore ]] && rm web/.gitignore
