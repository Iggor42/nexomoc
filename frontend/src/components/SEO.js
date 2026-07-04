import React from "react";

/**
 * SEO component — usa metadata nativa do React 19 (title/meta/link são hoisted ao <head>).
 * Sobrescreve as tags padrão do index.html quando renderizado por rota específica.
 */
export function SEO({
  title,
  description,
  path = "/",
  image = "https://nexomoc.netlify.app/og-image.png",
  type = "website",
  jsonLd,
}) {
  const siteUrl = "https://nexomoc.netlify.app";
  const url = `${siteUrl}${path}`;
  const fullTitle = title.includes("NexoMoc") ? title : `${title} | NexoMoc`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </>
  );
}
