import { FlexContainer, Link, Text } from "@tbe/components";
import type { MobileNavbarLinksContainerProps } from "@tbe/interface";

const MobileNavbarLinksContainer = ({
  title,
  links,
  onLinkClick,
}: MobileNavbarLinksContainerProps) => (
  <FlexContainer
    className="gap-2"
    direction="col"
    itemCenter={false}
    justifyCenter={false}
  >
    <Text className="pre-title text-primary" level="span">
      {title.toLocaleUpperCase()}
    </Text>
    <FlexContainer
      className="gap-2"
      direction="col"
      itemCenter={false}
      justifyCenter={false}
    >
      {links.map(({ name, href, target, description }, index) => {
        // Skip rendering Link if href is empty or undefined
        if (!href || (typeof href === "string" && href.trim() === "")) {
          return (
            <div
              key={index}
              className="text-base font-semibold text-foreground dark:text-white"
            >
              <Text
                className="strong-text text-foreground dark:text-white"
                level="span"
              >
                {name}
              </Text>
              <br />
              <Text
                className="pre-title text-muted-foreground dark:text-zinc-400"
                level="span"
              >
                {description}
              </Text>
            </div>
          );
        }

        return (
          <Link
            key={index}
            className="text-base font-semibold text-foreground dark:text-white hover:text-primary dark:hover:text-primary transition-colors"
            href={href}
            target={target}
            onClick={onLinkClick}
          >
            <Text
              className="strong-text text-foreground dark:text-white"
              level="span"
            >
              {name}
            </Text>
            <br />
            <Text
              className="pre-title text-muted-foreground dark:text-zinc-400"
              level="span"
            >
              {description}
            </Text>
          </Link>
        );
      })}
    </FlexContainer>
  </FlexContainer>
);

export default MobileNavbarLinksContainer;
