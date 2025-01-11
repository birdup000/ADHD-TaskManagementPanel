export interface SubTask {
  id: number;
  title: string;
  description: string;
  estimatedTime: number;
  completed: boolean;
  tips: string[];
  prerequisites: string[];
}