# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-02-06

### Added - Sidebar Section Manager

#### Dynamic Section Ordering with Drag & Drop
- **Visual Reordering**: Drag and drop sidebar sections to customize the order that works best for your workflow
- **Visibility Toggles**: Show/hide individual sections with easy toggle switches
- **Persistent Preferences**: Your custom layout and visibility settings sync across all devices via Chrome
- **Locked Sections**: Quick Info section is always visible and stays at the top (critical ticket metadata)
- **Real-time Saving**: Changes automatically save as you drag or toggle - no "Save" button needed for layout
- **Reset to Defaults**: One-click button to restore the original section order

#### Available Sidebar Sections
1. **Quick Info** 📊 (Locked) - Ticket summary and metadata - always visible at top
2. **WordPress Release** 📅 - Release milestones and schedule tracker
3. **Recent Comments** 💬 - Last 3 comments on the ticket
4. **Milestone History** 📊 - Timeline of milestone changes
5. **Authority Legend** 👥 - Role distribution in comments
6. **Component Maintainers** 🔧 - Maintainer contact information
7. **Keyword Validation** ⚠️ - Validation warnings (conditional - only shows when issues detected)
8. **TRAC Keywords** 🏷️ - Keyword explanations and history

### Technical Implementation
- **Complete Refactor**: Rebuilt `createKeywordSidebar()` as async function with config loading
- **New Architecture**: Section-based rendering system with `sectionsToRender` array
- **Dynamic Rendering**: Sections are collected, sorted by user preferences, then rendered
- **Smart Ordering**: Authority Legend dynamically inserts itself at correct position based on user's order preference
- **Storage System**: Uses `chrome.storage.sync` for cross-device preference syncing
- **Settings UI**: Drag & drop interface in options page with visual feedback
  - Drag handle (≡) for unlocked sections
  - Lock indicator (🔒) for locked sections
  - Section icons, names, and descriptions
  - Live toggle switches with auto-save
  - "Reset to Default Order" button

### Code Architecture
- **Helper Functions**:
  - `isSectionEnabled(sectionId, config)` - Checks if section should render
  - `getSectionOrder(config)` - Returns order map from user preferences
  - `continueCreatingSidebar(contributorData, config, sectionOrder)` - Main rendering logic
- **Options Page** (`options/options.js`):
  - `defaultSidebarSections` - Section metadata (id, icon, name, description, enabled, order, locked)
  - `renderSidebarSections(sections)` - Creates sortable section list UI
  - `handleDragStart/Drop/End/Over/Enter/Leave` - Native HTML5 drag & drop handlers
  - `saveSidebarSections()` - Auto-saves section config to chrome.storage.sync
  - `resetSidebarLayout()` - Restores default order and visibility
- **Options Page** (`options/options.html`):
  - Sidebar Section Manager UI with drag & drop styling
  - Visual indicators for dragging state (.dragging, .drag-over)
  - Locked section styling (.locked with blue background)
- **Updated Functions**:
  - `addAuthorityLegend()` - Now checks user preferences and inserts at correct position

### User Experience
- **Personalized Workflow**: Arrange sections in the order that matches your triage process
- **Focus Mode**: Hide sections you don't use to declutter the sidebar
- **Team Flexibility**: Different team members can customize based on their role
- **Universal Access**: Settings sync across all computers where you use the extension

### Removed Features (Documented in FUTURE_FEATURES.md)
- Configurable validation rules UI (removed for UX reconsideration)
- Custom user lists (removed as not useful enough)
- See `docs/FUTURE_FEATURES.md` for rationale and potential future approaches

## [1.3.0] - 2026-02-06

### Added - Phase 1A Features

#### Feature 1: Keyword Validation Panel
- **Self-Applied Testing Detection**: Automatically flags when patch authors add "needs-testing" themselves (training shows 80% of these are inadequate)
- **Redundant Keyword Detection**: Identifies redundant keyword pairs (e.g., "2nd-opinion" + "needs-review")
- **Authority Mismatch Warnings**: Alerts when users add keywords that should be restricted to higher authority levels
- **Severity-Based Display**: Color-coded warnings (High=red, Medium=orange, Low=blue) with actionable recommendations
- **Smart Recommendations**: Provides specific guidance on how to fix validation issues

#### Feature 2: Enhanced Authority/Role Badges
- **Universal Role Badges**: ALL commenters now receive role badges, including "Individual Contributor" for non-core contributors
- **GitHub Sync Detection**: Automatically detects and badges comments synced from GitHub Pull Requests with "🔗 GitHub PR" indicator
- **Authority Legend**: New collapsible sidebar section showing role distribution across all comments
- **Visual Hierarchy**: Improved color-coded system reflecting authority levels
- **Statistics**: Displays comment count per role for quick triage context

#### Feature 3: Milestone History Timeline
- **Visual Timeline**: Beautiful vertical timeline showing complete milestone change history
- **Detailed Change Information**: Each change shows from/to milestone, author, role, and relative time
- **Punt Detection**: Automatically flags tickets that have been punted 2+ times with explanatory warning
- **Direct Navigation**: Click-through links to view the exact comments where milestones were changed
- **Progress Tracking**: Easily see if a ticket is progressing or stalled based on milestone history

### Technical
- Added `data/keyword-equivalencies.js` with keyword redundancy rules and authority restrictions
- Added `data/role-hierarchy.js` with authority hierarchy definitions and role colors
- Added 6 new utility functions:
  - `findPatchesByAuthor()` - Detects patch uploads by specific authors
  - `analyzeKeywordValidation()` - Validates keywords against training-based patterns
  - `extractMilestoneHistory()` - Parses complete milestone change history from DOM
  - `getRoleColor()` - Provides consistent role color mapping
  - `addAuthorityLegend()` - Creates collapsible authority reference section
  - Enhanced `highlightContributors()` to badge ALL users and detect GitHub sync
  - Enhanced `createKeywordSidebar()` to integrate new validation and timeline sections

### Training-Based Improvements
All Phase 1A features are based on WordPress Test Team training materials:
- 2026-02-03: Ticket Triaging and Keywords
- 2026-01-29: Testing and Handbook Coordination
- 2026-01-27: Core Testing Challenges

## [1.2.0] - 2026-02-05

### Added
- **WordPress Release Schedule Tracker**: New section showing the target WordPress release schedule with next milestone and days remaining
- **Collapsible Sections**: All sidebar sections (Quick Info, Recent Comments, Component Maintainers, TRAC Keywords) can now be collapsed/expanded with persistent state
- Release schedule configuration in settings page to select target WordPress version
- Release schedule data for WordPress 7.0 including all beta, RC, and final release dates

### Technical
- Added `data/release-schedule.js` with WordPress 7.0 milestone dates
- Collapsible section helper function with localStorage state persistence
- Chrome storage integration for release version preferences

## [1.1.0] - 2026-02-05

### Added
- **Ticket Summary Section**: Sticky summary at the top of sidebar showing ticket ID, reporter, owner, dates, milestone, priority, severity, component, and keywords
- **Slide-out Sidebar**: Click to completely hide/show sidebar with smooth animation
- **Username Display**: Component maintainers now show @username alongside full name

### Changed
- **UI Improvement**: Sidebar is now integrated into the page layout instead of floating over content. The sidebar uses fixed positioning on the right edge and adjusts the main content width, similar to Brave's Leo AI sidebar
- Removed drag-and-drop functionality (replaced with hide/show toggle)
- Sidebar width increased to 340px for better readability
- Renamed `test-simple.js` to `trac-sidebar.js` for better semantic meaning

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
