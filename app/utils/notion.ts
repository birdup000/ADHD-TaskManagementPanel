export const deleteNoteFromNotion = async (noteId: string, { apiKey, clientSecret, refreshToken }: { apiKey: string, clientSecret: string, refreshToken: string }) => {
  // TODO: Replace with actual Notion API implementation
  if (!apiKey || !clientSecret || !refreshToken) {
    throw new Error('Notion API key, client secret, or refresh token not configured');
  }
  const NOTION_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID;
  if (!NOTION_DATABASE_ID) {
    throw new Error('Notion database ID not configured');
  }

  try {
    // First, find the Notion page ID for this note
    const searchResponse = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: 'note_id',
          rich_text: {
            equals: noteId
          }
        }
      })
    });

    if (!searchResponse.ok) {
      throw new Error(`Failed to find note in Notion: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    if (searchData.results.length > 0) {
      const notionPageId = searchData.results[0].id;
      
      // Delete the page
      const deleteResponse = await fetch(`https://api.notion.com/v1/pages/${notionPageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
        },
      });

      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete note from Notion: ${deleteResponse.statusText}`);
      }
    }
  } catch (error) {
    console.error('Error deleting from Notion:', error);
    throw error;
  }
};

export const findNotionPageId = async (noteId: string) => {
  const NOTION_API_KEY = process.env.NEXT_PUBLIC_NOTION_API_KEY;
  const NOTION_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID;

  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    throw new Error('Notion API key or database ID not configured');
  }

  const searchResponse = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: {
        property: 'note_id',
        rich_text: {
          equals: noteId
        }
      }
    })
  });

  if (!searchResponse.ok) {
    throw new Error(`Failed to find note in Notion: ${searchResponse.statusText}`);
  }

  const searchData = await searchResponse.json();
  return searchData.results[0]?.id;
};

interface NotionPage {
  properties: {
    note_id: { rich_text: [{ plain_text: string }] };
    title: { title: [{ plain_text: string }] };
    content: { rich_text: [{ plain_text: string }] };
    tags: { multi_select: [{ name: string }] };
  };
  created_time: string;
  last_edited_time: string;
}

export const syncNotesFromNotion = async ({ apiKey, clientSecret, refreshToken }: { apiKey: string, clientSecret: string, refreshToken: string }) => {
  if (!apiKey || !clientSecret || !refreshToken) {
    throw new Error('Notion API key, client secret, or refresh token not configured');
  }
  const NOTION_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID;
    if (!NOTION_DATABASE_ID) {
    throw new Error('Notion database ID not configured');
  }


  const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch notes from Notion: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results.map((page: NotionPage) => ({
    id: page.properties.note_id.rich_text[0]?.plain_text || crypto.randomUUID(),
    title: page.properties.title.title[0]?.plain_text || 'Untitled Note',
    content: page.properties.content.rich_text.map(text => text.plain_text).join('\n') || '',
    tags: page.properties.tags.multi_select.map(tag => tag.name) || [],
    createdAt: new Date(page.created_time),
    updatedAt: new Date(page.last_edited_time)
  }));
};

export const syncNoteWithNotion = async (note: {
  id: string;
  title: string;
  content: string;
  tags: string[];
}, { apiKey, clientSecret, refreshToken }: { apiKey: string, clientSecret: string, refreshToken: string }) => {
  // TODO: Replace with actual Notion API implementation
  if (!apiKey || !clientSecret || !refreshToken) {
    throw new Error('Notion API key, client secret, or refresh token not configured');
  }
  const NOTION_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID;
    if (!NOTION_DATABASE_ID) {
    throw new Error('Notion database ID not configured');
  }

  try {
    // Check if note already exists in Notion
    const existingPageId = await findNotionPageId(note.id);
    
    const endpoint = existingPageId 
      ? `https://api.notion.com/v1/pages/${existingPageId}`
      : `https://api.notion.com/v1/pages`;

    const response = await fetch(endpoint, {
      method: existingPageId ? 'PATCH' : 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: {
          note_id: {
            rich_text: [{ text: { content: note.id } }]
          },
          title: {
            title: [{ text: { content: note.title } }]
          },
          content: {
            rich_text: note.content.split('\n').map(line => ({
              text: { content: line }
            }))
          },
          tags: {
            multi_select: note.tags.map(tag => ({ name: tag }))
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to sync with Notion: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error syncing with Notion:', error);
    throw error;
  }
};
