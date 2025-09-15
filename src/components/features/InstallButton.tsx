import {Download} from "lucide-react";

import {Button} from "@/components/ui/button";
import {useInstallPrompt} from "@/hooks/useInstallPrompt";

export default function InstallButton() {
    const {isInstallable, deferredPrompt} = useInstallPrompt();

    const handleInstall = async () => {
        if (deferredPrompt) {
            const promptEvent = deferredPrompt as any;
            promptEvent.prompt();
            const choiceResult = await promptEvent.userChoice;
            if (choiceResult.outcome === "accepted") {
                console.log("User accepted the install prompt");
            } else {
                console.log("User dismissed the install prompt");
            }
        }
    };

    if (!isInstallable) {return null;}

    return (
        <Button
            onClick={handleInstall}
            className='fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all'
            title='Install this app'
            style={{boxShadow: "0 4px 24px 0 rgba(0,0,0,0.15)"}}>
            <Download className='w-5 h-5 mr-2' />
            <span className='font-semibold'>Install App</span>
        </Button>
    );
}
