# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Reporter Highlighting for Core Team Members

#### Visual Prominence for Important Reporters
- **Core Committer/Maintainer Badge**: Tickets reported by core committers or component maintainers now display a prominent badge in both the sidebar and main ticket table
- **Green Highlight**: The reporter field in the Quick Info section and main ticket table is highlighted with a green background when reported by a core team member
- **Role Badge**: Shows the specific role (e.g., "Core Committer", "Component Maintainer") next to the reporter's name
- **Instant Recognition**: Helps triagers quickly identify tickets that have higher priority due to being reported by experienced contributors

#### Implementation Details
- **New Function**: `isImportantReporter()` - Checks if a reporter is a core committer or component maintainer
- **New Function**: `highlightImportantReporter()` - Highlights the reporter cell in the main ticket table
- **Important Roles**: Project Lead, Lead Developer, Core Committer, Emeritus Committer, Component Maintainer, Themes Committer
- **Dual Highlight**: Applied to both the Quick Info sidebar section and the main ticket table's reporter cell
- **Tooltip**: Hovering over the badge shows "This ticket was reported by a [Role]"

#### Use Cases
- **Triaging Priority**: Quickly identify tickets that should be reviewed with higher priority
- **Context Awareness**: Understand when a ticket comes from an experienced contributor who likely has deep knowledge
- **Efficient Workflow**: Reduce time spent evaluating the importance of tickets during triage

## [1.5.0] - 2026-02-09

### Added - Keyword Change History Timeline

#### Pure Visibility Feature
- **Chronological Keyword Timeline**: New visual timeline showing the complete history of all keyword additions and removals on a ticket
- **Color-Coded Changes**: Visual differentiation between additions (green), removals (red), and mixed changes (orange)
- **Author Context**: Each change displays who made it, their role, and when (relative time)
- **Direct Navigation**: Click-through links to view the exact comment where keywords were changed
- **No Judgments**: Shows only factual information - no validation, no suggestions, just the timeline of what happened

#### Visual Design
- Vertical timeline with connecting line (similar to Milestone History)
- Color-coded dots indicating change type:
  - 🟢 Green: Keywords added only
  - 🔴 Red: Keywords removed only
  - 🟠 Orange: Mixed (both added and removed)
  - 🔵 Blue: Default
- Inline keyword badges with + (addition) or - (removal) prefix
- **Interactive Tooltips**: Hover over any keyword to see its description and usage guidelines
- Role-based color coding for author information
- Chronological order from oldest to newest

#### Technical Implementation
- **New Function**: `extractKeywordChangeTimeline()` - Extracts all keyword changes with author, role, and timestamp
- **Improved Parsing**: Uses DOM-based extraction via `<em>` tags instead of regex for accurate keyword detection
- **Section Integration**: New configurable sidebar section "Keyword Change History" (🔄)
- **Order Position**: Defaults to position 4 (after Milestone History, before Authority Legend)
- **User Configurable**: Can be reordered or hidden via Settings → Sidebar Section Manager
- **Storage Updates**: Updated default section order in both `trac-sidebar.js` and `options.js`
- **Enhanced Reliability**: Both `extractKeywordHistory()` and `extractKeywordChangeTimeline()` now use `.trac-field-keywords` selector with `<em>` tag parsing

#### Use Cases
- **Understand Evolution**: See how a ticket's keywords evolved over time
- **Identify Patterns**: Notice who typically adds/removes which keywords
- **Context for Decisions**: Review the full history before making triage decisions
- **Learning Tool**: New contributors can learn proper keyword workflows by observing patterns

#### Contributor-Friendly Data Management
- **New JSON Source File**: Created `data/keywords.json` as the single source of truth for all keyword definitions
- **Easy Updates**: Contributors can now update keyword definitions via Pull Requests by editing a simple JSON file
- **Comprehensive Documentation**: Added `data/README.md` with detailed instructions for updating keywords
- **Schema Validation**: JSON includes schema definition for validation
- **Metadata Tracking**: Includes source URL, last updated date, and versioning information
- **30+ Keywords Documented**: Complete definitions with descriptions, usage guidelines, categories, and colors

### Changed
- **Extension Branding**: Official name is now consistently "WP Trac Triager" throughout the extension
  - Updated sidebar header from "🔍 TRAC Visual Helper" to "🔍 WP Trac Triager"
  - Updated in all code files and documentation
  - Matches the official extension name in manifest.json
- **Section Ordering**: Updated default section order to accommodate new Keyword History section
  - Milestone History: 3
  - **Keyword Change History: 4** (NEW)
  - Authority Legend: 5 (was 4)
  - Component Maintainers: 6 (was 5)
  - Keyword Validation: 7 (was 6)
  - TRAC Keywords: 8 (was 7)

### Removed
- **Keyword Validation Section**: Removed from sidebar and settings to maintain pure visibility focus
  - This feature provided suggestions/recommendations ("you should remove this keyword")
  - Conflicts with extension philosophy of showing information without telling users what to do
  - Code preserved in comments for potential future redesign
  - Rationale: Users should make their own triage decisions based on visible information

- **Authority Legend from Settings**: Removed from Sidebar Section Manager (still functions dynamically)
  - Authority Legend is a **conditional section** that only appears when core team members comment on a ticket
  - Not part of the standard section list, so shouldn't be in settings
  - Still renders automatically when applicable (cannot be toggled off)
  - Appears dynamically based on ticket content, not user preferences

### Fixed
- **Multiple Keyword Detection**: Keyword Change History now correctly detects all keywords in multi-keyword changes
  - Previously: "has-patch needs-testing removed" only detected "needs-testing"
  - Now: Correctly detects both "has-patch" and "needs-testing" as removed
  - Fixed by parsing semicolon-separated action segments instead of checking immediate text nodes
  - Applies to both `extractKeywordHistory()` and `extractKeywordChangeTimeline()` functions

- **Settings Migration**: Settings page now properly merges new sections with existing user preferences
  - When new sections are added in updates, they automatically appear in the settings page
  - User's existing customizations are preserved
  - No need to reset settings when updating the extension

### Philosophy
This feature focuses purely on **information visibility** rather than recommendations. It helps users make informed decisions based on complete context, without telling them what to do. The extension continues to prioritize empowering contributors with data while respecting their judgment.

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
