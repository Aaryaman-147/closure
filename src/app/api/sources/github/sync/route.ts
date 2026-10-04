import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Signal from '@/models/Signal';

export async function POST() {
  try {
    const username = process.env.GITHUB_USERNAME;
    const token = process.env.GITHUB_PAT;

    if (!username || !token) {
      return NextResponse.json(
        { error: 'GitHub credentials missing in .env.local' }, 
        { status: 400 }
      );
    }

    // Fetch the user's recent events from GitHub
    const response = await fetch(`https://api.github.com/users/${username}/events`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const events = await response.json();
    
    // Filter for PushEvents (commits) and grab the 10 most recent
    const pushEvents = events
      .filter((e: any) => e.type === 'PushEvent')
      .slice(0, 10); 

    await connectToDatabase();
    const userId = 'demo-user-123';
    let syncedCount = 0;

    for (const event of pushEvents) {
      const repoName = event.repo.name;
      // Safely check for commits, default to 0 if undefined
      const commitCount = event.payload?.commits?.length || 0; 
      const sourceId = event.id; // GitHub's unique event ID

      // Check if we already synced this specific push event
      const existing = await Signal.findOne({ sourceId });
      
      if (!existing) {
        await Signal.create({
          userId,
          sourceId,
          sourceType: 'github',
          timestamp: new Date(event.created_at),
          metadata: {
            repo: repoName,
            commits: commitCount,
            // Adjust the description if it was a push without standard commits
            description: commitCount > 0 
              ? `Pushed ${commitCount} commit(s) to repository "${repoName.split('/')[1] || repoName}".`
              : `Pushed branch or tag updates to repository "${repoName.split('/')[1] || repoName}".`
          },
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
        });
        syncedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Synced ${syncedCount} new GitHub events.`,
      syncedCount 
    }, { status: 200 });

  } catch (error) {
    console.error('GitHub Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync GitHub' }, { status: 500 });
  }
}