// lib/format-message.tsx
import React, { type ReactNode, type CSSProperties } from 'react';

const ANSI_MAP: Record<string, string> = {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    grey: '\x1b[90m',
    redBright: '\x1b[91m',
    greenBright: '\x1b[92m',
    yellowBright: '\x1b[93m',
    blueBright: '\x1b[94m',
    magentaBright: '\x1b[95m',
    cyanBright: '\x1b[96m',
    whiteBright: '\x1b[97m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',
    strikethrough: '\x1b[9m',
};

const CSS_MAP: Record<string, CSSProperties> = {
    black: { color: 'black' },
    red: { color: '#f87171' },
    green: { color: '#4ade80' },
    yellow: { color: '#facc15' },
    blue: { color: '#60a5fa' },
    magenta: { color: '#c084fc' },
    cyan: { color: '#22d3ee' },
    white: { color: 'white' },
    gray: { color: '#9ca3af' },
    grey: { color: '#9ca3af' },
    redBright: { color: '#fca5a5' },
    greenBright: { color: '#86efac' },
    yellowBright: { color: '#fde047' },
    blueBright: { color: '#93c5fd' },
    magentaBright: { color: '#d8b4fe' },
    cyanBright: { color: '#67e8f9' },
    whiteBright: { color: 'white' },
    bold: { fontWeight: 'bold' },
    dim: { opacity: 0.5 },
    italic: { fontStyle: 'italic' },
    underline: { textDecoration: 'underline' },
    strikethrough: { textDecoration: 'line-through' },
};

type FormatData = {
    APP_NAME?: string;
    RELATIVE_PATH?: string;
};

const TAG_REGEX = /\[(\w+)\]([\s\S]*?)\[\/\1\]/g;

function replacePlaceholders(message: string, data: FormatData): string {
    return message.replace(/{{(\w+)}}/g, (match, key) => {
        const value = data[key as keyof FormatData];
        return value !== undefined ? value : match;
    });
}

export function formatMessageANSI(message: string, data: FormatData = {}): string {
    const formatted = replacePlaceholders(message, data);
    return formatted.replace(TAG_REGEX, (_, tag, content) => {
        const ansi = ANSI_MAP[tag];
        return ansi ? `${ansi}${content}\x1b[0m` : content;
    });
}

export function formatMessageCSS(message: string, data: FormatData = {}): ReactNode {
    const formatted = replacePlaceholders(message, data);
    const lines = formatted.split('\n');

    return lines.map((line, i): ReactNode => {
        const parts: ReactNode[] = [];
        let last = 0;
        let match;
        TAG_REGEX.lastIndex = 0;

        while ((match = TAG_REGEX.exec(line)) !== null) {
            if (match.index > last) parts.push(line.slice(last, match.index));
            const style = CSS_MAP[match[1]];
            parts.push(
                <span key={match.index} style={style}>
                    {match[2]}
                </span>
            );
            last = match.index + match[0].length;
        }

        if (last < line.length) parts.push(line.slice(last));

        return (
            <span key={i} className="block">
                {parts.length > 0 ? parts : '\u00A0'}
            </span>
        );
    });
}