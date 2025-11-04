interface JobCodeBlockProps {
    label: string;
    value: any;
    fallback?: string;
    className?: string;
}

export default function JobCodeBlock({
    label,
    value,
    fallback = `No ${label.toLowerCase()}`,
    className
}: JobCodeBlockProps) {
    const content = value ? JSON.stringify(value, null, 2) : fallback;

    return (
        <div className={`space-y-2 ${className || ''}`}>
            <label className="text-sm font-medium">{label}</label>
            <div className="border rounded bg-muted max-h-32 overflow-auto mt-2">
                <pre className="text-xs text-muted-foreground p-3 whitespace-pre-wrap break-words">
                    {content}
                </pre>
            </div>
        </div>
    );
}
