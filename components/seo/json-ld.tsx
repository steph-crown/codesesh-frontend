import {
  getSiteOrigin,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site-config";

/** WebSite + Organization + SoftwareApplication for rich results eligibility. */
export function JsonLdWebsite() {
  const origin = getSiteOrigin();
  const websiteId = `${origin}/#website`;
  const orgId = `${origin}/#organization`;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: origin,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en-US",
        publisher: { "@id": orgId },
      },
      {
        "@type": "Organization",
        "@id": orgId,
        name: SITE_NAME,
        url: origin,
        description: SITE_TAGLINE,
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };

  const json = JSON.stringify(graph);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
