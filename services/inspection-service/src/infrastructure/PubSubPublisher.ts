export interface EventPublisher {
  publish(topic: string, payload: unknown): Promise<void>;
}

export class ConsoleEventPublisher implements EventPublisher {
  async publish(topic: string, payload: unknown): Promise<void> {
    console.info(JSON.stringify({ topic, payload }));
  }
}

