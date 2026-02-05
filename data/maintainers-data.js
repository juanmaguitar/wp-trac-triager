// WordPress Component Maintainers
// Source: https://make.wordpress.org/core/components/
// Last Updated: 2026-02-04
//
// To update this file:
// 1. Visit https://make.wordpress.org/core/components/
// 2. Update the COMPONENT_MAINTAINERS object below
// 3. Add new maintainers to MAINTAINER_PROFILES

var COMPONENT_MAINTAINERS = {
  'General': [],
  'Accessibility': ['audrasjb', 'joedolson', 'afercia'],
  'Administration': ['audrasjb', 'joedolson'],
  'Block Editor': ['gziolo', 'ntsekouras', 'youknowriad'],
  'Bootstrap/Load': ['dd32'],
  'Build/Test Tools': ['johnbillion', 'desrosj'],
  'Bundled Theme': ['audrasjb', 'poena'],
  'Cache API': ['spacedmonkey'],
  'Canonical': [],
  'Coding Standards': ['jrf'],
  'Comments': [],
  'Customize': [],
  'Database': ['spacedmonkey'],
  'Date/Time': [],
  'Embeds': [],
  'External Libraries': [],
  'Feeds': [],
  'Filesystem API': ['dd32'],
  'Formatting': [],
  'Gallery': [],
  'HTTP API': ['dd32'],
  'I18N': [],
  'Import': [],
  'Install and Upgrade': ['dd32', 'desrosj'],
  'Login and Registration': [],
  'Mail': [],
  'Media': ['joedolson', 'antpb'],
  'Menus': [],
  'Networks and Sites': ['spacedmonkey'],
  'Performance': ['flixos90', 'mukesh27', 'joemcgill'],
  'Plugins': [],
  'Post Formats': [],
  'Posts, Post Types': [],
  'Privacy': ['garrett-eclipse'],
  'Query': ['spacedmonkey'],
  'Quick/Bulk Edit': [],
  'REST API': ['spacedmonkey', 'timothyblynjacobs'],
  'Revisions': [],
  'Rewrite Rules': ['spacedmonkey'],
  'Role/Capability': ['spacedmonkey'],
  'Script Loader': [],
  'Security': [],
  'Shortcodes': [],
  'Site Health': [],
  'Taxonomy': ['spacedmonkey'],
  'Template': [],
  'Themes': ['audrasjb'],
  'Tickets/Workflow': [],
  'TinyMCE': [],
  'Toolbar': [],
  'Upgrade/Install': ['dd32', 'desrosj'],
  'Upload': [],
  'Users': ['spacedmonkey'],
  'Widgets': [],
  'XML-RPC': []
};

// Maintainer profile information
var MAINTAINER_PROFILES = {
  'audrasjb': {
    name: 'Audrey Audrasjb',
    profile: 'https://profiles.wordpress.org/audrasjb/',
    role: 'Core Committer'
  },
  'joedolson': {
    name: 'Joe Dolson',
    profile: 'https://profiles.wordpress.org/joedolson/',
    role: 'Accessibility Lead'
  },
  'afercia': {
    name: 'Andrea Fercia',
    profile: 'https://profiles.wordpress.org/afercia/',
    role: 'Core Contributor'
  },
  'gziolo': {
    name: 'Grzegorz Ziółkowski',
    profile: 'https://profiles.wordpress.org/gziolo/',
    role: 'Core Committer'
  },
  'ntsekouras': {
    name: 'Nik Tsekouras',
    profile: 'https://profiles.wordpress.org/ntsekouras/',
    role: 'Core Contributor'
  },
  'youknowriad': {
    name: 'Riad Benguella',
    profile: 'https://profiles.wordpress.org/youknowriad/',
    role: 'Core Committer'
  },
  'dd32': {
    name: 'Dion Hulse',
    profile: 'https://profiles.wordpress.org/dd32/',
    role: 'Core Committer'
  },
  'johnbillion': {
    name: 'John Blackbourn',
    profile: 'https://profiles.wordpress.org/johnbillion/',
    role: 'Core Committer'
  },
  'desrosj': {
    name: 'Jonathan Desrosiers',
    profile: 'https://profiles.wordpress.org/desrosj/',
    role: 'Core Committer'
  },
  'poena': {
    name: 'Carolina Nymark',
    profile: 'https://profiles.wordpress.org/poena/',
    role: 'Core Contributor'
  },
  'spacedmonkey': {
    name: 'Jonny Harris',
    profile: 'https://profiles.wordpress.org/spacedmonkey/',
    role: 'Core Committer'
  },
  'jrf': {
    name: 'Juliette Reinders Folmer',
    profile: 'https://profiles.wordpress.org/jrf/',
    role: 'Core Contributor'
  },
  'flixos90': {
    name: 'Felix Arntz',
    profile: 'https://profiles.wordpress.org/flixos90/',
    role: 'Core Committer'
  },
  'mukesh27': {
    name: 'Mukesh Panchal',
    profile: 'https://profiles.wordpress.org/mukesh27/',
    role: 'Core Contributor'
  },
  'joemcgill': {
    name: 'Joe McGill',
    profile: 'https://profiles.wordpress.org/joemcgill/',
    role: 'Core Committer'
  },
  'antpb': {
    name: 'Anthony Burchell',
    profile: 'https://profiles.wordpress.org/antpb/',
    role: 'Core Contributor'
  },
  'garrett-eclipse': {
    name: 'Garrett Hyder',
    profile: 'https://profiles.wordpress.org/garrett-eclipse/',
    role: 'Core Contributor'
  },
  'timothyblynjacobs': {
    name: 'Timothy Jacobs',
    profile: 'https://profiles.wordpress.org/timothyblynjacobs/',
    role: 'Core Contributor'
  },
  'sabernhardt': {
    name: 'Stephen Bernhardt',
    profile: 'https://profiles.wordpress.org/sabernhardt/',
    role: 'Core Contributor'
  }
};

// Variables are shared between content scripts via execution order
// No need to expose to window in MV3
//
// Note: Core Committers and Lead Testers are available from wpTracContributorLabels
// which is loaded on every Trac page, so we don't need to duplicate that data here
