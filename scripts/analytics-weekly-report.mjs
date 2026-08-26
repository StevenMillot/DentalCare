#!/usr/bin/env node
// Rapport analytics hebdomadaire pour paro-spe.fr : interroge la Google Search
// Console et la Google Analytics 4 Data API (mêmes credentials OAuth que le
// serveur MCP, voir GUIDE-MCP-SEARCH-CONSOLE-GA4.md), calcule les variations
// semaine sur semaine, et génère un rapport Markdown.
//
// ⚠️ Lecture seule : ce script ne modifie jamais le contenu du site. Il est
// indépendant de l'automatisation "SEO Weekly Audit" (audit SEO technique
// on-page + corrections, gouvernée par .cursor/commands/seo-*.md).
//
// Usage :
//   GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... GOOGLE_OAUTH_REFRESH_TOKEN=... \
//     node scripts/analytics-weekly-report.mjs [--dry-run]
//
// Variables optionnelles :
//   GA4_PROPERTY_ID (défaut: 546646264)
//   GSC_SITE_URL    (défaut: https://paro-spe.fr/)
//
// --dry-run : affiche le rapport sur stdout sans écrire de fichier.

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const DRY_RUN = process.argv.includes('--dry-run');

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '546646264';
const GSC_SITE_URL = process.env.GSC_SITE_URL || 'https://paro-spe.fr/';

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

const missing = [
  ['GOOGLE_OAUTH_CLIENT_ID', clientId],
  ['GOOGLE_OAUTH_CLIENT_SECRET', clientSecret],
  ['GOOGLE_OAUTH_REFRESH_TOKEN', refreshToken],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  console.error(`Variables manquantes : ${missing.join(', ')}`);
  process.exit(1);
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

// La Search Console a un délai de fraîcheur d'environ 2-3 jours : on décale
// la fenêtre pour ne comparer que des données déjà stabilisées.
const GSC_LAG_DAYS = 3;
const today = new Date();
const currentEnd = new Date(today);
currentEnd.setUTCDate(currentEnd.getUTCDate() - GSC_LAG_DAYS);
const currentStart = new Date(currentEnd);
currentStart.setUTCDate(currentStart.getUTCDate() - 6);
const previousEnd = new Date(currentStart);
previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
const previousStart = new Date(previousEnd);
previousStart.setUTCDate(previousStart.getUTCDate() - 6);

const period = {
  current: { start: fmtDate(currentStart), end: fmtDate(currentEnd) },
  previous: { start: fmtDate(previousStart), end: fmtDate(previousEnd) },
};

async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) {
    throw new Error(`Échec du rafraîchissement du token OAuth (${res.status}) : ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function gsc(accessToken, path, body) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE_URL)}/${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Erreur Search Console (${path}, ${res.status}) : ${await res.text()}`);
  }
  return res.json();
}

async function gscTotals(accessToken, start, end) {
  const data = await gsc(accessToken, 'searchAnalytics/query', {
    startDate: start,
    endDate: end,
  });
  const row = data.rows?.[0];
  return {
    clicks: row?.clicks ?? 0,
    impressions: row?.impressions ?? 0,
    ctr: row?.ctr ?? 0,
    position: row?.position ?? 0,
  };
}

async function gscTop(accessToken, dimension, start, end, rowLimit = 10) {
  const data = await gsc(accessToken, 'searchAnalytics/query', {
    startDate: start,
    endDate: end,
    dimensions: [dimension],
    rowLimit,
  });
  return data.rows ?? [];
}

async function gscSitemaps(accessToken) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE_URL)}/sitemaps`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) {
    return { sitemap: [] };
  }
  return res.json();
}

async function ga4Report(accessToken, start, end) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: start, endDate: end }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'engagementRate' },
        ],
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Erreur GA4 Data API (${res.status}) : ${await res.text()}`);
  }
  const data = await res.json();
  const row = data.rows?.[0];
  const val = (i) => Number(row?.metricValues?.[i]?.value ?? 0);
  return {
    sessions: val(0),
    activeUsers: val(1),
    screenPageViews: val(2),
    engagementRate: val(3),
  };
}

async function ga4TopPages(accessToken, start, end, rowLimit = 10) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: start, endDate: end }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: rowLimit,
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Erreur GA4 Data API top pages (${res.status}) : ${await res.text()}`);
  }
  const data = await res.json();
  return (data.rows ?? []).map((r) => ({
    page: r.dimensionValues?.[0]?.value ?? '',
    views: Number(r.metricValues?.[0]?.value ?? 0),
  }));
}

function pct(current, previous) {
  if (!previous) return current ? '+∞' : '0%';
  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}%`;
}

function round(n, d = 1) {
  return Number(n).toFixed(d);
}

async function main() {
  const accessToken = await getAccessToken();

  const [gscCurrent, gscPrevious, topQueries, topPages, sitemaps, ga4Current, ga4Previous, ga4TopP] =
    await Promise.all([
      gscTotals(accessToken, period.current.start, period.current.end),
      gscTotals(accessToken, period.previous.start, period.previous.end),
      gscTop(accessToken, 'query', period.current.start, period.current.end),
      gscTop(accessToken, 'page', period.current.start, period.current.end),
      gscSitemaps(accessToken),
      ga4Report(accessToken, period.current.start, period.current.end),
      ga4Report(accessToken, period.previous.start, period.previous.end),
      ga4TopPages(accessToken, period.current.start, period.current.end),
    ]);

  const alerts = [];
  if (gscPrevious.clicks > 0) {
    const clicksDelta = ((gscCurrent.clicks - gscPrevious.clicks) / gscPrevious.clicks) * 100;
    if (clicksDelta <= -20) {
      alerts.push(
        `⚠️ Baisse importante des clics Search Console : ${round(clicksDelta)}% vs la semaine précédente.`
      );
    }
  }
  if (gscPrevious.impressions > 0) {
    const impDelta = ((gscCurrent.impressions - gscPrevious.impressions) / gscPrevious.impressions) * 100;
    if (impDelta <= -20) {
      alerts.push(
        `⚠️ Baisse importante des impressions Search Console : ${round(impDelta)}% vs la semaine précédente.`
      );
    }
  }
  const sitemapErrors = (sitemaps.sitemap ?? []).filter(
    (s) => Number(s.errors ?? 0) > 0 || Number(s.warnings ?? 0) > 0
  );
  if (sitemapErrors.length > 0) {
    alerts.push(`⚠️ ${sitemapErrors.length} sitemap(s) avec des erreurs ou avertissements.`);
  }
  if ((sitemaps.sitemap ?? []).length === 0) {
    alerts.push('⚠️ Aucun sitemap déclaré dans Search Console.');
  }

  const lines = [];
  lines.push(`# Rapport analytics hebdomadaire — paro-spe.fr`);
  lines.push('');
  lines.push(
    `Semaine du **${period.current.start}** au **${period.current.end}** (comparée à la semaine précédente du ${period.previous.start} au ${period.previous.end}).`
  );
  lines.push('');

  if (alerts.length > 0) {
    lines.push('## 🚨 Alertes');
    lines.push('');
    for (const a of alerts) lines.push(`- ${a}`);
    lines.push('');
  }

  lines.push('## Google Search Console');
  lines.push('');
  lines.push('| Métrique | Cette semaine | Semaine précédente | Évolution |');
  lines.push('| --- | --- | --- | --- |');
  lines.push(
    `| Clics | ${gscCurrent.clicks} | ${gscPrevious.clicks} | ${pct(gscCurrent.clicks, gscPrevious.clicks)} |`
  );
  lines.push(
    `| Impressions | ${gscCurrent.impressions} | ${gscPrevious.impressions} | ${pct(gscCurrent.impressions, gscPrevious.impressions)} |`
  );
  lines.push(
    `| CTR moyen | ${round(gscCurrent.ctr * 100, 2)}% | ${round(gscPrevious.ctr * 100, 2)}% | ${pct(gscCurrent.ctr, gscPrevious.ctr)} |`
  );
  lines.push(
    `| Position moyenne | ${round(gscCurrent.position)} | ${round(gscPrevious.position)} | ${pct(gscPrevious.position, gscCurrent.position)} |`
  );
  lines.push('');

  lines.push('### Top 10 requêtes (cette semaine)');
  lines.push('');
  lines.push('| Requête | Clics | Impressions | CTR | Position |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const r of topQueries) {
    lines.push(
      `| ${r.keys?.[0] ?? ''} | ${r.clicks} | ${r.impressions} | ${round(r.ctr * 100, 1)}% | ${round(r.position)} |`
    );
  }
  lines.push('');

  lines.push('### Top 10 pages (Search Console, cette semaine)');
  lines.push('');
  lines.push('| Page | Clics | Impressions | CTR | Position |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const r of topPages) {
    lines.push(
      `| ${r.keys?.[0] ?? ''} | ${r.clicks} | ${r.impressions} | ${round(r.ctr * 100, 1)}% | ${round(r.position)} |`
    );
  }
  lines.push('');

  lines.push('### Sitemaps');
  lines.push('');
  if ((sitemaps.sitemap ?? []).length === 0) {
    lines.push('_Aucun sitemap déclaré._');
  } else {
    lines.push('| Sitemap | Dernière lecture | Erreurs | Avertissements |');
    lines.push('| --- | --- | --- | --- |');
    for (const s of sitemaps.sitemap) {
      lines.push(`| ${s.path} | ${s.lastDownloaded ?? '—'} | ${s.errors ?? 0} | ${s.warnings ?? 0} |`);
    }
  }
  lines.push('');

  lines.push('## Google Analytics 4');
  lines.push('');
  lines.push('| Métrique | Cette semaine | Semaine précédente | Évolution |');
  lines.push('| --- | --- | --- | --- |');
  lines.push(
    `| Sessions | ${ga4Current.sessions} | ${ga4Previous.sessions} | ${pct(ga4Current.sessions, ga4Previous.sessions)} |`
  );
  lines.push(
    `| Utilisateurs actifs | ${ga4Current.activeUsers} | ${ga4Previous.activeUsers} | ${pct(ga4Current.activeUsers, ga4Previous.activeUsers)} |`
  );
  lines.push(
    `| Pages vues | ${ga4Current.screenPageViews} | ${ga4Previous.screenPageViews} | ${pct(ga4Current.screenPageViews, ga4Previous.screenPageViews)} |`
  );
  lines.push(
    `| Taux d'engagement | ${round(ga4Current.engagementRate * 100, 1)}% | ${round(ga4Previous.engagementRate * 100, 1)}% | ${pct(ga4Current.engagementRate, ga4Previous.engagementRate)} |`
  );
  lines.push('');

  lines.push('### Top 10 pages (GA4, cette semaine)');
  lines.push('');
  lines.push('| Page | Vues |');
  lines.push('| --- | --- |');
  for (const p of ga4TopP) {
    lines.push(`| ${p.page} | ${p.views} |`);
  }
  lines.push('');

  lines.push('---');
  lines.push(`_Rapport généré automatiquement le ${fmtDate(today)}._`);

  const report = lines.join('\n') + '\n';

  if (DRY_RUN) {
    console.log(report);
    return;
  }

  const outDir = join(repoRoot, 'rapports-analytics');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `${period.current.end}.md`);
  writeFileSync(outPath, report);
  console.log(`Rapport écrit : ${outPath}`);

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    writeFileSync(summaryPath, report, { flag: 'a' });
  }

  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) {
    const issueTitle = `Rapport analytics — semaine du ${period.current.start} au ${period.current.end}`;
    const delimiter = 'ANALYTICS_REPORT_EOF';
    const outputs =
      `report_path=${outPath}\n` +
      `issue_title=${issueTitle}\n` +
      `has_alerts=${alerts.length > 0}\n` +
      `report_body<<${delimiter}\n${report}\n${delimiter}\n`;
    writeFileSync(outputPath, outputs, { flag: 'a' });
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
