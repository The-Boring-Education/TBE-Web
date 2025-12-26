/**
 * Lighthouse CI Configuration
 *
 * This configuration enables automated SEO and accessibility audits
 * across all TBE Platform apps.
 *
 * Usage:
 *   - Local: pnpm seo:audit
 *   - Production: pnpm seo:audit:prod
 *   - CI: Automatically runs via GitHub Actions
 *
 * @see https://github.com/GoogleChrome/lighthouse-ci
 */

/**
 * Production URLs for all TBE apps
 * These URLs are audited during production builds
 */
const PRODUCTION_URLS = {
    platform: [
        'https://theboringeducation.com/',
        'https://theboringeducation.com/shiksha',
        'https://theboringeducation.com/shiksha/explore',
        'https://theboringeducation.com/interview-prep',
        'https://theboringeducation.com/interview-prep/explore',
        'https://theboringeducation.com/projects',
        'https://theboringeducation.com/projects/explore',
        'https://theboringeducation.com/webinar',
        'https://theboringeducation.com/youfocus',
        'https://theboringeducation.com/youfocus/explore',
        'https://theboringeducation.com/portfolio',
        'https://theboringeducation.com/contact',
        'https://theboringeducation.com/contribute',
        'https://theboringeducation.com/unskilled',
        'https://theboringeducation.com/topmate-sessions',
        'https://theboringeducation.com/cohort/bring-your-idea'
    ],
    prepYatra: [
        'https://prepyatra.theboringeducation.com/',
        'https://prepyatra.theboringeducation.com/pricing'
    ],
    quizes: [
        'https://quizes.theboringeducation.com/',
        'https://quizes.theboringeducation.com/leaderboard'
    ],
    resumeYatra: ['https://resumeyatra.theboringeducation.com/'],
    dsayatra: [
        'https://dsayatra.theboringeducation.com/',
        'https://dsayatra.theboringeducation.com/pricing'
    ],
    techyatra: ['https://techyatra.theboringeducation.com/'],
    oncampus: ['https://oncampus.theboringeducation.com/']
};

/**
 * Get all production URLs for auditing
 */
function getAllProductionUrls() {
    return Object.values(PRODUCTION_URLS).flat();
}

/**
 * Get URLs for a specific app
 * @param {string} appName - Name of the app
 */
function getAppUrls(appName) {
    return PRODUCTION_URLS[appName] || [];
}

// Determine which URLs to audit based on environment
const isProduction = process.env.LHCI_ENV === 'production';
const targetApp = process.env.LHCI_APP;

let urlsToAudit;
if (isProduction) {
    urlsToAudit = targetApp ? getAppUrls(targetApp) : getAllProductionUrls();
} else {
    // Local development - audit localhost
    urlsToAudit = [
        'http://localhost:3000/', // Platform
        'http://localhost:3000/shiksha',
        'http://localhost:3000/interview-prep',
        'http://localhost:3000/projects'
    ];
}

module.exports = {
    ci: {
        collect: {
            // Number of times to run Lighthouse per URL
            numberOfRuns: 1,

            // URLs to audit
            url: urlsToAudit,

            // Lighthouse settings
            settings: {
                // Categories to audit
                onlyCategories: ['seo', 'accessibility', 'best-practices', 'performance'],

                // Chrome flags for headless operation
                chromeFlags: '--no-sandbox --headless --disable-gpu',

                // Throttling settings (use desktop for SEO audits)
                formFactor: 'desktop',
                throttling: {
                    rttMs: 40,
                    throughputKbps: 10240,
                    cpuSlowdownMultiplier: 1
                },
                screenEmulation: {
                    mobile: false,
                    width: 1350,
                    height: 940,
                    deviceScaleFactor: 1,
                    disabled: false
                }
            },

            // Puppeteer settings
            puppeteerScript: undefined,
            puppeteerLaunchOptions: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        },

        // Assertions - fail build if scores are too low
        assert: {
            assertions: {
                // SEO score must be at least 85%
                'categories:seo': ['error', { minScore: 0.85 }],

                // Accessibility should be at least 80%
                'categories:accessibility': ['warn', { minScore: 0.8 }],

                // Best practices should be at least 75%
                'categories:best-practices': ['warn', { minScore: 0.75 }],

                // Performance is informational (varies by network)
                'categories:performance': ['warn', { minScore: 0.5 }]
            }
        },

        // Upload settings - save reports to filesystem
        upload: {
            target: 'filesystem',
            outputDir: './apps/testing/.lhci',
            reportFilenamePattern: '%%HOSTNAME%%-%%PATHNAME%%-%%DATETIME%%.report.%%EXTENSION%%'
        }
    }
};

// Export URL lists for use in SEO Inspector
module.exports.PRODUCTION_URLS = PRODUCTION_URLS;
module.exports.getAllProductionUrls = getAllProductionUrls;
module.exports.getAppUrls = getAppUrls;

