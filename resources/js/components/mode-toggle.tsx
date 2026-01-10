import { Moon, Sun, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()

    const cycleTheme = () => {
        if (theme === 'system') setTheme('light')
        else if (theme === 'light') setTheme('dark')
        else setTheme('system')
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            title={`Tema atual: ${theme === 'system' ? 'Automático' : theme === 'dark' ? 'Escuro' : 'Claro'}`}
        >
            <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${theme === 'light' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90 absolute'}`} />
            <Moon className={`h-[1.2rem] w-[1.2rem] transition-all ${theme === 'dark' ? 'scale-100 rotate-0 text-white' : 'scale-0 rotate-90 absolute'}`} />
            <Laptop className={`h-[1.2rem] w-[1.2rem] transition-all ${theme === 'system' ? 'scale-100 rotate-0' : 'scale-0 absolute'}`} />
            <span className="sr-only">Alternar tema</span>
        </Button>
    )
}
