export async function updateBlockStatus(
  portfolioId: string,
  blockId: string,
  data: { is_visible: boolean }
) {
  const res = await fetch(`/api/portfolios/${portfolioId}/blocks/${blockId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update block status')
  return res.json()
}

export async function updateBlockConfig(
  portfolioId: string,
  blockId: string,
  data: { config: Record<string, unknown> }
) {
  const res = await fetch(`/api/portfolios/${portfolioId}/blocks/${blockId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update block config')
  return res.json()
}

export async function reorderBlocksApi(
  portfolioId: string,
  data: { blocks: { id: string; position: number }[] }
) {
  const res = await fetch(`/api/portfolios/${portfolioId}/blocks`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to reorder blocks')
  return res.json()
}

export async function updatePortfolioApi(
  portfolioId: string,
  data: { theme: string }
) {
  const res = await fetch(`/api/portfolios/${portfolioId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update portfolio')
  return res.json()
}
