const robotsText = `# RepetiGo Robots.txt
# https://repetigo.com/robots.txt
# Last Updated: July 2026

# ============================
# Content Signals
# ============================

# Search indexing and AI-answer references are allowed.
# AI model training is not allowed.
#
# Content-Signal is an emerging robots.txt extension. Search engines that do
# not understand it will continue to use the standard rules below.

User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no, use=reference
Allow: /

# ============================
# Block internal/system pages
# ============================

Disallow: /analytics
Disallow: /auto-print
Disallow: /dashboard
Disallow: /forgot-password
Disallow: /login
Disallow: /orders
Disallow: /pricing-settings
Disallow: /profile
Disallow: /register
Disallow: /reset-password
Disallow: /s/
Disallow: /verify-email
Disallow: /wallet
Disallow: /cdn-cgi/
Disallow: /search/
Disallow: /?s=

# ============================
# AI Crawlers
# ============================

# These crawlers may access public content for search or reference use, but
# the Content-Signal above reserves RepetiGo content from AI model training.

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: meta-externalagent
Allow: /

# ============================
# Sitemap
# ============================

Sitemap: https://repetigo.com/sitemap.xml
`;

export function GET() {
  return new Response(robotsText, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
