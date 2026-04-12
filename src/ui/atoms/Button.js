import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from "clsx";
const Button = ({ variant = "primary", size = "md", loading = false, leftIcon, rightIcon, children, className, disabled, ...rest }) => {
    return (_jsxs("button", { disabled: disabled || loading, className: clsx(
        // Base
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60", 
        // Size
        size === "sm" && "h-9 text-xs px-3", size === "md" && "h-10 text-sm px-4", size === "lg" && "h-12 text-sm px-5", 
        // Variants
        variant === "primary" &&
            "bg-primary text-primary-foreground shadow-soft hover:brightness-95 active:scale-[0.99]", variant === "secondary" &&
            "bg-secondary text-secondary-foreground hover:brightness-95 active:scale-[0.99]", variant === "outline" &&
            "bg-transparent border border-border text-foreground hover:bg-muted/75", variant === "danger" &&
            "bg-danger text-white hover:brightness-95 active:scale-[0.99]", variant === "ghost" &&
            "bg-transparent text-foreground hover:bg-muted/75", className), ...rest, children: [loading && (_jsx("span", { "data-testid": "spinner", className: "mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" })), leftIcon && _jsx("span", { className: "mr-2", children: leftIcon }), _jsx("span", { children: children }), rightIcon && _jsx("span", { className: "ml-2", children: rightIcon })] }));
};
export default Button;
