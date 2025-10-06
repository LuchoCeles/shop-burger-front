import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:bg-emerald-950 group-[.toaster]:text-emerald-50 group-[.toaster]:border-emerald-800",
          error: "group-[.toaster]:bg-red-950 group-[.toaster]:text-red-50 group-[.toaster]:border-red-800",
          warning: "group-[.toaster]:bg-amber-950 group-[.toaster]:text-amber-50 group-[.toaster]:border-amber-800",
          info: "group-[.toaster]:bg-blue-950 group-[.toaster]:text-blue-50 group-[.toaster]:border-blue-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
