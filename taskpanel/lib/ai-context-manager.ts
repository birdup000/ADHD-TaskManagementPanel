import { aiService } from './ai-service';

interface ContextEntry {
  timestamp: number;
  content: string;
  type: 'task' | 'user_preference' | 'system' | 'interaction';
  relevanceScore?: number;
}

export class AIContextManager {
  private static readonly MAX_CONTEXT_SIZE = 50;
  private static readonly CONTEXT_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private context: ContextEntry[] = [];

  addEntry(content: string, type: ContextEntry['type']) {
    if (!content?.trim()) {
      throw new ValidationError('Context entry content cannot be empty');
    }

    this.context.push({
      timestamp: Date.now(),
      content,
      type,
    });
    
    // Prune old entries if needed
    this.pruneContext();
  }

  async getRelevantContext(query: string): Promise<string[]> {
    // Calculate relevance scores for context entries
    const scoredContext = await Promise.all(
      this.context.map(async (entry) => {
        try {
          const embeddings = await aiService.ai?.embed(entry.content);
          const queryEmbedding = await aiService.ai?.embed(query);
          
          if (embeddings && queryEmbedding) {
            entry.relevanceScore = this.calculateCosineSimilarity(embeddings, queryEmbedding);
          }
        } catch (error) {
          console.error('Failed to calculate embeddings:', error);
          entry.relevanceScore = 0;
        }
        return entry;
      })
    );

    // Sort by relevance and return top entries
    return scoredContext
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, 5)
      .map(entry => entry.content);
  }

  private pruneContext() {
    const now = Date.now();
    
    // Remove old entries
    this.context = this.context.filter(
      entry => now - entry.timestamp < AIContextManager.CONTEXT_TTL
    );

    // Limit context size
    if (this.context.length > AIContextManager.MAX_CONTEXT_SIZE) {
      this.context = this.context.slice(-AIContextManager.MAX_CONTEXT_SIZE);
    }
  }

  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (norm1 * norm2);
  }
}

export const contextManager = new AIContextManager();