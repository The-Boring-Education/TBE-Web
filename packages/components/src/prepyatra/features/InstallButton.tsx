import {Download, DownloadIcon} from "lucide-react";

import {Button} from "../ui/button";
import {useInstallPrompt} from "@tbe/hooks";

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
            <DownloadIcon className='w-2 h-2' />
            <span className='font-semibold text-sm'>Install App</span>
        </Button>
    );
}
