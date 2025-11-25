'use client';

import { KeyboardEvent, useState, useEffect } from 'react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSendMessage: (message: string) => void;
  placeholder: string;
  isLoading: boolean;
}

export function MessageInput({
  value,
  onChange,
  onSendMessage,
  placeholder,
  isLoading
}: MessageInputProps) {
  const placeholderSuggestions = [
    "Hey Rube, can you fetch my emails",
    "Hey Rube, can you search my twitter",
    "Hey Rube, can you fetch the reddit posts in r/localllama"
  ];

  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [displayPlaceholder, setDisplayPlaceholder] = useState(placeholderSuggestions[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % placeholderSuggestions.length;
        setDisplayPlaceholder(placeholderSuggestions[nextIndex]);
        return nextIndex;
      });
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(value);
    }
  };

  return (
    <div className="input-bar bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm transition-colors duration-200">
      <div className="flex-1 text-neutral-700 dark:text-neutral-200">
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="font-inter m-1 w-full resize-none border-0 bg-transparent px-2 sm:px-3 py-2 text-sm leading-relaxed text-gray-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={displayPlaceholder}
        />
      </div>
      <div className="flex w-full items-center justify-between gap-1 pt-2 px-2 pb-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-neutral-700 focus:outline-none bg-gray-50 dark:bg-neutral-700/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-plus text-neutral-600 dark:text-neutral-400"
            >
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all duration-200 focus:outline-none text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-700 bg-gray-50 dark:bg-neutral-700/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-mic"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" x2="12" y1="19" y2="22"></line>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onSendMessage(value)}
            disabled={!value.trim() || isLoading}
            className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gray-900 dark:bg-white text-white dark:text-neutral-900 transition-all duration-200 hover:bg-gray-700 dark:hover:bg-neutral-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-up"
            >
              <path d="m5 12 7-7 7 7"></path>
              <path d="M12 19V5"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}