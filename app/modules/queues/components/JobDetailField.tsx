import type { ReactNode } from "react";

interface JobDetailFieldProps {
    label: string;
    value?: string | number | null;
    children?: ReactNode;
    className?: string;
    valueClassName?: string;
}

export default function JobDetailField({
    label,
    value,
    children,
    className,
    valueClassName
}: JobDetailFieldProps) {
    return (
        <div className={`space-y-2 ${className || ''}`}>
            <label className="text-sm font-medium">{label}</label>
            {children || (
                <p className={`text-sm text-muted-foreground ${valueClassName || ''}`}>
                    {value}
                </p>
            )}
        </div>
    );
}
