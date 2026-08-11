CREATE UNIQUE INDEX "portfolios_custom_domain_key" ON "portfolios"("custom_domain");
CREATE UNIQUE INDEX "portfolios_slug_lower_key" ON "portfolios"(LOWER("slug"));
