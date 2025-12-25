import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const arxivId = searchParams.get('id');

  if (!arxivId) {
    return NextResponse.json({ error: 'arXiv ID is required' }, { status: 400 });
  }

  try {
    const arxivUrl = `https://export.arxiv.org/api/query?id_list=${arxivId}`;
    const response = await fetch(arxivUrl, {
      headers: {
        Accept: 'application/atom+xml',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from arXiv: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.text();

    // Return the XML data as text
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error proxying arXiv request:', error);
    return NextResponse.json({ error: 'Failed to fetch article from arXiv' }, { status: 500 });
  }
}
