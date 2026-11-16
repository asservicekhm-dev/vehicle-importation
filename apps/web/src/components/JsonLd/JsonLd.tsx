type Json = Record<string, unknown>;

type Props = {
  data: Json | Json[] | null | undefined;
};

export function JsonLd({ data }: Props) {
  const items = (Array.isArray(data) ? data : data ? [data] : []).filter(
    (item) => item && Object.keys(item).length > 0,
  );
  if (items.length === 0) return null;

  return (
    <>
      {items.map((item, index) => (
        <script
          key={`${typeof item['@type'] === 'string' ? item['@type'] : 'ld'}-${index}`}
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  );
}
