import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchGitHubAnalytics } from '@/lib/github';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 30;

    if (isNaN(days) || days <= 0 || days > 365) {
      return NextResponse.json({ error: 'Invalid days parameter' }, { status: 400 });
    }

    const data = await fetchGitHubAnalytics(days);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching GitHub analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub analytics' },
      { status: 500 }
    );
  }
}
