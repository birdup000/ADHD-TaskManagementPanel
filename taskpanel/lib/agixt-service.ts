import axios from 'axios';

export interface AGiXTConfig {
    baseUri: string;
    authToken: string;
    enabled: boolean;
}

export class AGiXTService {
    private config: AGiXTConfig;

    constructor(config: AGiXTConfig) {
        this.config = config;
    }

    private get client() {
        return axios.create({
            baseURL: this.config.baseUri,
            headers: {
                'Authorization': `Bearer ${this.config.authToken}`,
                'Content-Type': 'application/json',
            },
        });
    }

    async interactWithAgent(prompt: string) {
        if (!this.config.enabled) {
            throw new Error('AGiXT integration is not enabled');
        }

        try {
            const response = await this.client.post('/api/v1/agent/prompt', {
                prompt,
            });
            return response.data;
        } catch (error) {
            console.error('Error interacting with AGiXT:', error);
            throw error;
        }
    }

    // Add other methods to interact with AGiXT
}