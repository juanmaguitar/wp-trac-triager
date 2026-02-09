# Changelog

All notable changes to the WP Trac Triager extension will be documented in this file.

## [1.0.0] - 2026-02-04

### Initial Release

#### Features
- **Comment Highlighting**: Visual highlighting for comments from important contributors
  - Core Committers (blue border + lightning badge)
  - Component Maintainers (green border + wrench badge)
  - Lead Testers (purple border + test tube badge)
  - Ticket Reporters (orange border + document badge)

- **Keyword Sidebar**: Floating sidebar with comprehensive keyword explanations
  - Organized by category (Patch, Testing, Feedback, Design, Documentation, Review, Screenshots, Status)
  - Color-coded labels
  - Critical keywords marked with special badge
  - Collapsible for focused reading
  - Based on official WordPress Core Handbook

- **Component Maintainer Info**: Information box showing component maintainers
  - Links to maintainer WordPress.org profiles
  - Shows maintainer roles
  - Indicates recent maintainer comments with timestamps

- **Settings Page**: Full configuration interface
  - Toggle individual features on/off
  - Add custom users to highlight lists
  - Reset to defaults option
  - Persistent settings via Chrome storage

#### Data Included
- 30+ Trac keyword definitions with usage guidance
- 40+ component mappings to maintainers
- 19 core committers pre-configured
- 6 lead testers pre-configured
- 18 maintainer profiles with links

#### Technical Details
- Manifest V3 Chrome extension
- Works on core.trac.wordpress.org and meta.trac.wordpress.org
- Lightweight: No external dependencies
- Privacy-friendly: All data stored locally

### Known Limitations
- Maintainer data requires manual updates (not auto-synced from make.wordpress.org)
- Only works on Chromium-based browsers (Chrome, Edge)
- Some components don't have designated maintainers listed
- Sidebar hides on small screens (< 768px width)

### Future Enhancements Planned
- Quick triage action buttons
- Ticket health score indicator
- Template comments for common triage responses
- Keyboard shortcuts for common actions
- Dark mode support
- Auto-update maintainer lists from WordPress.org

---

## Development Notes

### Data Sources
- Keywords: https://make.wordpress.org/core/handbook/contribute/trac/keywords/
- Components: https://make.wordpress.org/core/components/
- Workflow: User's personal Trac triage documentation

### Testing
- Tested on example ticket: https://core.trac.wordpress.org/ticket/8905
- Verified all features functional
- Settings persistence confirmed

### Credits
Built by Juan Manuel Garrido for the WordPress community.
