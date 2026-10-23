import { FlexContainer, Link } from "@tbe/components";
import type { NavbarDropdownContainerProps } from "@tbe/interface";

const NavbarDropdownContainer = ({ links }: NavbarDropdownContainerProps) => (
  <div className="p-2">
    {links.map(({ name, href, description, target, isDevelopment }) => {
      // Skip rendering Link if href is empty or undefined
      if (!href || (typeof href === "string" && href.trim() === "")) {
        return (
          <FlexContainer
            key={name}
            className="relative rounded-lg p-2 hover:bg-muted/80 dark:hover:bg-white/5 max-w-sm transition-colors"
            direction="col"
            itemCenter={false}
          >
            <FlexContainer direction="col" itemCenter={false}>
              <div className="text-base font-semibold text-foreground dark:text-white">
                {name}{" "}
                {isDevelopment && (
                  <span className="text-secondary">(In Dev)</span>
                )}
              </div>
              <p className="text-muted-foreground dark:text-zinc-400 break-words text-xs sm:text-sm">
                {description}
              </p>
            </FlexContainer>
          </FlexContainer>
        );
      }

      return (
        <FlexContainer
          key={name}
          className="relative rounded-lg p-2 hover:bg-muted/80 dark:hover:bg-white/5 max-w-sm transition-colors"
          direction="col"
          itemCenter={false}
        >
          <FlexContainer direction="col" itemCenter={false}>
            <Link
              className="text-base font-semibold text-foreground dark:text-white hover:text-primary dark:hover:text-primary transition-colors"
              href={href}
              target={target}
            >
              {name}{" "}
              {isDevelopment && (
                <span className="text-secondary">(In Dev)</span>
              )}
              <span className="absolute inset-0" />
            </Link>
            <p className="text-muted-foreground dark:text-zinc-400 break-words text-xs sm:text-sm">
              {description}
            </p>
          </FlexContainer>
        </FlexContainer>
      );
    })}
  </div>
);

export default NavbarDropdownContainer;
