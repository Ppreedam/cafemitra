export type ScoreInput = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string; // Markdown
  coverImage: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  focusKeywords: string[];
  authorName: string;
};

export type Check = { label: string; ok: boolean; hint: string };
export type Score = { score: number; checks: Check[] };

export type Scores = { readability: Score; seo: Score; performance: Score; feedback: Score };

function plainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_`~]/g, "")
    .trim();
}

function words(text: string) {
  return text ? text.split(/\s+/).filter(Boolean) : [];
}

function toScore(checks: Check[]): Score {
  const passed = checks.filter((c) => c.ok).length;
  return { score: Math.round((passed / checks.length) * 100), checks };
}

export function computeScores(a: ScoreInput): Scores {
  const text = plainText(a.content);
  const wordList = words(text);
  const wordCount = wordList.length;
  const sentences = text.split(/(?<=[.!?।])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
  const longSentences = sentences.filter((s) => words(s).length > 25).length;
  const avgSentence = sentences.length ? wordCount / sentences.length : 0;
  const paragraphs = a.content.split(/\n\s*\n/).map(plainText).filter(Boolean);
  const longParagraphs = paragraphs.filter((p) => words(p).length > 120).length;
  const headings = (a.content.match(/^#{2,6}\s+\S/gm) ?? []).length;
  const lists = (a.content.match(/^\s*([-*+]|\d+\.)\s+\S/gm) ?? []).length;
  const images = [...a.content.matchAll(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g)];
  const imagesMissingAlt = images.filter((m) => !m[1].trim()).length;
  const insecureImages = images.filter((m) => m[2].startsWith("http://")).length;
  const links = (a.content.match(/(?<!!)\[[^\]]+\]\([^)]+\)/g) ?? []).length;

  const readability = toScore([
    { label: "Article is at least 300 words", ok: wordCount >= 300, hint: `Currently ${wordCount} words.` },
    { label: "Average sentence is 20 words or fewer", ok: sentences.length > 0 && avgSentence <= 20, hint: "Shorter sentences are easier to read." },
    {
      label: "Few very long sentences (over 25 words)",
      ok: sentences.length > 0 && longSentences / sentences.length <= 0.25,
      hint: `${longSentences} long sentence(s).`,
    },
    { label: "Paragraphs are 120 words or fewer", ok: paragraphs.length > 0 && longParagraphs === 0, hint: "Break up long paragraphs." },
    { label: "Subheadings used (about one per 300 words)", ok: wordCount > 0 && headings >= Math.max(1, Math.floor(wordCount / 300)), hint: "Add ## subheadings." },
    { label: "Uses a bullet or numbered list", ok: lists > 0, hint: "Lists make steps and points easy to scan." },
  ]);

  const keyword = (a.focusKeywords[0] ?? "").trim().toLowerCase();
  const firstWords = wordList.slice(0, 100).join(" ").toLowerCase();
  const seoTitle = a.metaTitle || a.title;
  const seoDescription = a.metaDescription || a.excerpt;
  const slugText = a.slug.replace(/-/g, " ").toLowerCase();
  const kwNote = keyword ? `Focus keyword: "${keyword}".` : "Add a focus keyword in the Tags & Keywords tab.";
  const seo = toScore([
    { label: "SEO title is 30-65 characters", ok: seoTitle.length >= 30 && seoTitle.length <= 65, hint: `Currently ${seoTitle.length}.` },
    { label: "SEO description is 120-160 characters", ok: seoDescription.length >= 120 && seoDescription.length <= 160, hint: `Currently ${seoDescription.length}.` },
    { label: "Focus keyword is set", ok: !!keyword, hint: kwNote },
    { label: "Keyword is in the title", ok: !!keyword && seoTitle.toLowerCase().includes(keyword), hint: kwNote },
    { label: "Keyword is in the first 100 words", ok: !!keyword && firstWords.includes(keyword), hint: kwNote },
    { label: "Keyword is in the description", ok: !!keyword && seoDescription.toLowerCase().includes(keyword), hint: kwNote },
    { label: "Keyword is in the URL slug", ok: !!keyword && slugText.includes(keyword), hint: kwNote },
    { label: "Has at least one link", ok: links > 0, hint: "Link to a related page or source." },
    { label: "Has a ## subheading", ok: headings > 0, hint: "Subheadings help search engines." },
  ]);

  const performance = toScore([
    { label: "Cover image is set", ok: !!a.coverImage.trim(), hint: "Needed for social sharing cards." },
    { label: "Cover image uses https", ok: a.coverImage.trim().startsWith("https://"), hint: "Use a secure image URL." },
    { label: "All images have alt text", ok: images.length === 0 || imagesMissingAlt === 0, hint: `${imagesMissingAlt} image(s) without alt text.` },
    { label: "Images use https", ok: insecureImages === 0, hint: `${insecureImages} insecure image(s).` },
    { label: "No more than 10 images", ok: images.length <= 10, hint: `${images.length} images - many images slow the page.` },
    { label: "Article is under 5000 words", ok: wordCount <= 5000, hint: "Very long pages load slower." },
  ]);

  const feedback = toScore([
    { label: "Title is written", ok: a.title.trim().length >= 10, hint: "Write a clear title." },
    { label: "Short summary is written", ok: a.excerpt.trim().length >= 50, hint: "Shown on the blog list page." },
    { label: "Content is at least 300 words", ok: wordCount >= 300, hint: `Currently ${wordCount} words.` },
    { label: "Category is chosen", ok: !!a.category.trim(), hint: "Pick a category." },
    { label: "At least one tag", ok: a.tags.length > 0, hint: "Add tags in the Tags & Keywords tab." },
    { label: "Focus keyword is set", ok: a.focusKeywords.length > 0, hint: "Add it in the Tags & Keywords tab." },
    { label: "Cover image is set", ok: !!a.coverImage.trim(), hint: "Paste an image URL in the sidebar." },
    { label: "Author is set", ok: !!a.authorName.trim(), hint: "Set an author name." },
  ]);

  return { readability, seo, performance, feedback };
}
