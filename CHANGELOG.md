# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-05

### Changed
- **UI Improvement**: Sidebar is now integrated into the page layout instead of floating over content. The sidebar uses `position: sticky` and adjusts the main content width, similar to Brave's Leo AI sidebar. This prevents the sidebar from covering ticket content when resizing the browser window.
- Removed drag-and-drop functionality (no longer needed with integrated layout)
- Sidebar width increased to 320px for better readability

## [1.0.1] - 2026-02-05

### Fixed
- **Critical Bug**: Extension now displays sidebar on tickets without keywords. Previously, tickets with no keywords would not show the sidebar at all, preventing users from seeing recent comments and component maintainer information. The sidebar now appears on all tickets and shows a helpful message when no keywords are present.

## [1.0.0] - 2026-02-05

### Added
- Comment highlighting for core contributors with role-based color coding
- Floating keyword sidebar with explanations for all TRAC keywords
- Component maintainer information display
- Recent comments section showing last 3 comments
- Draggable and collapsible sidebar
- Settings page for customization
- Custom user lists support
- Keyboard history tracking for keywords

### Features
- **Comment Highlighting**: Visual highlights for different contributor roles:
  - Project Lead (Purple)
  - Lead Developer (Blue)
  - Core Committer (Green)
  - Emeritus Committer (Orange)
  - Lead Tester (Pink)
  - Themes Committer (Cyan)
- **Keyword Sidebar**: Comprehensive explanations for all WordPress TRAC keywords
- **Maintainer Info**: Component-specific maintainer information
- **Recent Activity**: Quick view of the most recent comments
- **Settings**: Customizable feature toggles and custom user lists

### Technical
- Chrome Manifest V3 compliant
- Content Security Policy implemented
- Optimized performance with cached DOM queries
- Clean modular code structure
- Comprehensive error handling
- localStorage for persistent UI state
- chrome.storage.sync for settings synchronization

## [Unreleased]

### Planned
- Keyboard shortcuts
- Dark mode support
- Export triage statistics
- Quick triage action buttons
- Template comments for common responses
- Ticket health score indicator
