# ExtensionFE

Browser extension frontend for biomedical synonym generalization.

## Overview

This browser extension provides a user interface for interacting with the SynonymNERmodel backend to identify and suggest biomedical synonyms.

## Files

- `manifest.json` - Extension manifest
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality
- `content.js` - Content script for web pages
- `background.js` - Background service worker
- `styles.css` - Extension styling
- `icon.png` - Extension icon

## Installation

1. Open Chrome/Edge browser
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select this folder

## Usage

1. Click the extension icon
2. Enter biomedical terms
3. Get synonym suggestions powered by the NER model

## Backend Integration

This extension communicates with the [SynonymNERmodel](https://github.com/TharaganSTH/SynonymNERmodel) backend for NER processing.