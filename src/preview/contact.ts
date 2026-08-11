export const isContactableEmail = (email?: string) =>
  Boolean(email?.trim()) && !/@users\.noreply\.github\.com$/i.test(email!.trim());

export function hasContactMethod(
  blocks: Array<{ is_visible: boolean; block_type: string; config: unknown }>,
) {
  return blocks.some((block) => {
    if (!block.is_visible || block.block_type !== "contact") return false;
    const config = block.config as { github_url?: string; email?: string; linkedin_url?: string; website_url?: string };
    return Boolean(
      config.github_url ||
      isContactableEmail(config.email) ||
      config.linkedin_url ||
      config.website_url,
    );
  });
}
