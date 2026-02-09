# Future Features - For Consideration

**Created:** 2026-02-06
**Status:** Ideas for future implementation

---

## 1. Configurable Validation Rules UI

### Current Status: Removed

**Reason:** UX needs deeper consideration before implementation.

### What Was Built (Temporarily)
- Settings page with toggle switches for each rule
- Source transparency (Training, Best Practice, Official Docs)
- Save/load preferences via chrome.storage.sync
- Visual indicators for trust levels

### Why Removed
- User feedback: Not convinced about the UI/UX
- Needs more thought about the best way to present configuration
- Wants to think deeply about user experience first

### For Future Implementation

**Questions to Answer:**
1. **Where should configuration live?**
   - Settings page (current approach)?
   - Inline in the validation panel itself?
   - Context menu on each warning?
   - Global vs per-ticket configuration?

2. **What level of control?**
   - Simple enable/disable per rule?
   - Severity adjustment (high/medium/low)?
   - Custom messages per rule?
   - Whitelist certain users/tickets?

3. **Configuration scope:**
   - Per-user (chrome.storage.sync)?
   - Per-team (shared config)?
   - Per-component (different rules for different areas)?

4. **Discoverability:**
   - How do users learn about validation rules?
   - How do they know they can configure them?
   - Should there be an onboarding flow?

### Alternative Approaches to Consider

**Approach 1: Contextual Configuration**
- Show "Don't show this again" link on each warning
- Configure rules inline, not in separate settings
- More intuitive, less overwhelming

**Approach 2: Smart Defaults with Override**
- Most users never configure
- Advanced users can access config via special URL or flag
- Keep UI clean for majority

**Approach 3: Profile-Based**
- Predefined profiles: "Strict", "Balanced", "Minimal"
- Users pick a profile instead of individual rules
- Simpler decision-making

**Approach 4: Learn from Actions**
- Extension learns from user dismissals
- Auto-disable rules user consistently ignores
- AI-powered personalization

### What to Keep
- ✅ Rule configuration system (`data/validation-rules.js`)
- ✅ Source transparency (show where rules come from)
- ✅ Separate training-based vs best-practice rules
- ✅ Default to conservative (only training-backed rules)

### What to Rethink
- ❓ UI for enabling/disabling rules
- ❓ Settings page location
- ❓ Granularity of control
- ❓ Communication about configurability

---

## 2. Custom User Lists

### Current Status: Removed

**Reason:** Not useful enough, adds noise to configuration page.

### What Was Built
- Textarea to add custom Core Committers
- Textarea to add custom Lead Testers
- Validation for username format
- Merge with default lists

### Why Removed
- User feedback: Not super useful
- Adds clutter to settings page
- Core team list is already comprehensive
- Edge case that doesn't warrant UI space

### If Needed in Future
- Could be implemented as advanced setting
- Or as import/export of custom data files
- Or as command-line flag for power users

---

## 3. Other Ideas for Future

### A. Keyboard Shortcuts
- Quick navigation between warnings
- Rapid keyword add/remove
- See FEATURE_SUGGESTIONS.md - Feature 13 (Bulk Triage Mode)

### B. Batch Operations
- Apply same action to multiple tickets
- Queue of tickets to process
- Progress tracking

### C. AI-Powered Features
- See FEATURE_SUGGESTIONS.md - Feature 16
- Smart suggestions based on ticket content
- Auto-categorization
- Similar ticket detection

### D. Team Collaboration
- See FEATURE_SUGGESTIONS.md - Feature 14
- Shared triage state
- Real-time coordination
- Slack integration

---

## Lessons Learned

### Configuration UI Design
1. **Start simple**: Don't expose every knob and dial
2. **Think about defaults**: Most users won't configure
3. **Progressive disclosure**: Advanced features shouldn't clutter main UI
4. **Test with users**: Get feedback before building complex UIs

### Feature Removal
- It's okay to remove features that don't work
- Better to ship simple and add later than ship complex
- User feedback is valuable - listen and iterate

---

## Next Steps

When reconsidering these features:
1. **User research**: Talk to WordPress Test Team about their needs
2. **Prototype**: Mock up different UI approaches
3. **A/B test**: Try different configurations with subset of users
4. **Iterate**: Build incrementally based on feedback

---

**Remember:** Features should solve real problems for users. If a feature feels like "noise" or users aren't convinced, it's better to wait and think more deeply about the right solution.
