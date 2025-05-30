
import { ChatMessage } from '@/types/chat';

export class StreamHandler {
  static async handleStreamResponse(
    response: Response,
    assistantMessageId: string,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ): Promise<string> {
    if (!response.body || !response.body.getReader) {
      return '';
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Look for complete JSON objects in the buffer
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line) {
            try {
              const chunk = JSON.parse(line);
              if (chunk.token) {
                fullResponse += chunk.token;
                // Update the assistant message with streaming content
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullResponse, status: 'streaming' }
                    : msg
                ));
              }
            } catch (parseError) {
              // If not JSON, might be final response
              console.log('Non-JSON chunk:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullResponse;
  }
}
