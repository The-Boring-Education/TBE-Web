import { LINKS } from "@tbe/constants";

type Props = {
  docTitle: string;
  pageUrl: string;
};

function buildIssueHref(title: string, pageUrl: string): string {
  const body = [
    `**Resource:** ${title}`,
    `**Page:** ${pageUrl}`,
    "",
    "_Questions, better links, or edits — describe below:_",
    "",
  ].join("\n");

  const params = new URLSearchParams({
    title: `[resources] ${title}`,
    body,
  });

  return `${LINKS.createIssue}?${params.toString()}`;
}

export function ResourceContributeBanner({ docTitle, pageUrl }: Props) {
  const issueHref = buildIssueHref(docTitle, pageUrl);

  return (
    <aside
      className="resource-contribute-banner mt-10 mb-8 w-[80%] max-w-3xl rounded-lg border border-zinc-800/80 bg-zinc-900/35 px-4 py-3 text-center sm:px-5 sm:text-left"
      aria-label="Contribute or ask about this resource"
    >
      <p className="text-sm leading-relaxed text-zinc-400">
        <span className="text-zinc-300">
          Have a question, a better resource, or an improvement for this doc?
        </span>{" "}
        Open an issue or see how to contribute — we&apos;d love your input.
      </p>
      <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm sm:justify-start">
        <a
          href={issueHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-emerald-400 underline-offset-2 hover:text-emerald-300 hover:underline"
        >
          Suggest on GitHub
        </a>
        <span className="hidden text-zinc-600 sm:inline" aria-hidden>
          ·
        </span>
        <a
          href={LINKS.contributeOpenSource}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
        >
          Contribute to TBE
        </a>
      </p>
    </aside>
  );
}
