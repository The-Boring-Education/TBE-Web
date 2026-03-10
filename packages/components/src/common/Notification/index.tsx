import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { BellIcon, LinkIcon } from "@heroicons/react/20/solid";
import { FlexContainer, Link, Text } from "@tbe/components";
import { useNotifications } from "@tbe/hooks";
import { Fragment } from "react";

const NotificationPopover = () => {
  const { notifications } = useNotifications();

  if (!notifications || !notifications.length) return <></>;

  return (
    <Popover className="relative">
      <PopoverButton className="flex p-1 w-10 h-10 justify-center items-center rounded-full border-2 border-primary text-primary hover:text-white hover:bg-primary outline-none font-bold">
        <BellIcon aria-hidden="true" className="h-6 w-6" color="primary" />
      </PopoverButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel
          className="
          fixed z-10 top-18 right-2 w-80 shadow-lg rounded-2xl p-1
          md:absolute md:top-auto md:mt-2 md:w-96 md:right-0 md:left-auto md:mx-0
          overflow-x-auto
        "
        >
          {notifications && (
            <FlexContainer className="gap-1" direction="col">
              {notifications.map((notification, index) => {
                const { type, text, isExternalLink, link } = notification;

                return (
                  <FlexContainer
                    key={index}
                    className="p-2 w-full bg-lightBG rounded-2 border border-secondary gap-2.5"
                    direction="col"
                  >
                    <FlexContainer
                      className="gap-1 w-full items-center"
                      justifyCenter={false}
                    >
                      <Text
                        className="pre-title text-primary text-left"
                        level="span"
                      >
                        {type}
                      </Text>
                      {link && (
                        <Link
                          href={link}
                          target={`${isExternalLink ? "_blank" : ""}`}
                        >
                          <LinkIcon className="w-2 text-primary" />
                        </Link>
                      )}
                    </FlexContainer>
                    <Text className="pre-title text-left w-full" level="p">
                      {text}
                    </Text>
                  </FlexContainer>
                );
              })}
            </FlexContainer>
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
};

export default NotificationPopover;
