import React from 'react';

export const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-message-in">
      <div className="bg-bubble-received rounded-lg rounded-tl-none px-4 py-3 ml-2 shadow-sm">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-typing" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-typing" style={{ animationDelay: '200ms' }} />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-typing" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
};
