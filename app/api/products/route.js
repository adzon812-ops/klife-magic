import { buildProductResponse } from '@/lib/products'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  const { data, error, status } = buildProductResponse(id)

  if (error) {
    return Response.json({ error }, { status })
  }

  return Response.json({ data }, {
    status,
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
