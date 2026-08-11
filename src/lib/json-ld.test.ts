import { serializeJsonLd } from "./json-ld";

test("JSON-LD cannot close its script element", () => {
  const result = serializeJsonLd({ name: "</script><script>alert(1)</script>" });

  expect(result).not.toContain("<");
  expect(JSON.parse(result)).toEqual({ name: "</script><script>alert(1)</script>" });
});
