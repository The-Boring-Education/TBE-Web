import {
  LoadingSpinner,
  prefetchSheetData,
  SEO,
  SheetLearningSpace,
} from "@tbe/components";
import { envConfig, routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import type { PrimaryCardWithCTAProps, SheetPageProps } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import {
  cn,
  getSheetPageProps,
  isUserAuthenticated,
  mapInterviewSheetResponseToCard,
  sendRequest,
} from "@tbe/utils";
import { ArrowRight, FolderOpen, Lock, Search, X } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo, useState } from "react";

const InterviewPrepDashboardPage = (props: SheetPageProps) => {
  const router = useRouter();
  const { user, loading: userLoading, isAuth } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  const selectedRoadmap =
    typeof router.query.roadmap === "string"
      ? router.query.roadmap.toLowerCase()
      : "all";

  const { data: response, isLoading: sheetsLoading } = useQuery<any>({
    queryKey: queryKeys.interviewPrep.list({ roadmap: "all" }),
    queryFn: () =>
      sendRequest({
        url: `${routes.api.base}${routes.api.interviewPrep}`,
      }),
    ...CACHE_TIMES.STATIC,
  });

  const { data: mySheetsResponse } = useQuery<any>({
    queryKey: queryKeys.interviewPrep.lists(),
    queryFn: () =>
      sendRequest({
        url: `${routes.api.base}${routes.api.mySheets}?userId=${user?.id}`,
      }),
    ...CACHE_TIMES.STANDARD,
    enabled: !!user?.id,
  });

  const enrolledSheets = useMemo(() => {
    const list =
      mySheetsResponse?.data || (props as any).initialEnrolledSheets || [];
    return Array.isArray(list) ? list : [];
  }, [mySheetsResponse, (props as any).initialEnrolledSheets]);

  const sheetsData = useMemo(() => {
    const payload = response?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  }, [response]);

  const [purchaseStatuses, setPurchaseStatuses] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login");
    }
  }, [userLoading, isAuth, router]);

  useEffect(() => {
    if (sheetsData.length > 0 && user?.id) {
      const checkPurchaseStatuses = async () => {
        const statuses: Record<string, boolean> = {};
        for (const sheet of sheetsData) {
          if (sheet.isPremium) {
            try {
              const res = await fetch(
                `${routes.api.base}${routes.api.checkStatus}?userId=${user.id}&productId=${sheet._id}`,
              );
              const result = await res.json();
              statuses[sheet._id] = result.status && result.data?.purchased;
            } catch {
              statuses[sheet._id] = false;
            }
          } else {
            statuses[sheet._id] = false;
          }
        }
        setPurchaseStatuses(statuses);
      };
      checkPurchaseStatuses();
    }
  }, [sheetsData, user?.id]);

  const sheets: PrimaryCardWithCTAProps[] = useMemo(() => {
    if (!sheetsData.length) return [];
    return sheetsData.map((sheet: any) => {
      const baseCard = mapInterviewSheetResponseToCard([sheet])[0];
      const isPurchased = purchaseStatuses[sheet._id] || false;
      return {
        ...baseCard,
        href: {
          pathname: "/interview-sheets",
          query: { topic: sheet.slug },
        },
        isPurchased: sheet.isPremium ? isPurchased : false,
        isPremium: sheet.isPremium && !isPurchased,
      };
    });
  }, [sheetsData, purchaseStatuses]);

  const groupedByRoadmap = useMemo(() => {
    const groups: Record<string, any[]> = {};
    sheetsData.forEach((sheet: any) => {
      let roadmap = sheet?.roadmap || "Tech";
      const title = (sheet.name || sheet.title || "").toLowerCase();
      const slug = sheet.slug?.toLowerCase() || "";
      if (
        title.includes("database") ||
        title.includes("dbms") ||
        title.includes("sql") ||
        slug.includes("database") ||
        slug.includes("dbms") ||
        slug.includes("sql")
      ) {
        roadmap = "Database";
      }
      if (!groups[roadmap]) groups[roadmap] = [];
      groups[roadmap].push(sheet);
    });
    return groups;
  }, [sheetsData]);

  const roadmapKeys = useMemo(() => {
    const keys = Object.keys(groupedByRoadmap).sort((a, b) => {
      const order = ["DSA", "Tech", "Frontend", "Database"];
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
    return keys;
  }, [groupedByRoadmap]);

  const filteredSheets = useMemo(() => {
    return sheetsData.filter((sheet: any) => {
      let roadmap = sheet?.roadmap || "Tech";
      const title = (sheet.name || sheet.title || "").toLowerCase();
      const slug = sheet.slug?.toLowerCase() || "";
      if (
        title.includes("database") ||
        title.includes("dbms") ||
        title.includes("sql") ||
        slug.includes("database") ||
        slug.includes("dbms") ||
        slug.includes("sql")
      ) {
        roadmap = "Database";
      }

      const matchesRoadmap =
        selectedRoadmap === "all" ||
        roadmap.toLowerCase() === selectedRoadmap.toLowerCase();

      const matchesSearch =
        !searchQuery.trim() ||
        title.includes(searchQuery.toLowerCase()) ||
        slug.includes(searchQuery.toLowerCase()) ||
        (sheet.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesRoadmap && matchesSearch;
    });
  }, [sheetsData, selectedRoadmap, searchQuery]);

  const handleRoadmapClick = (slug: string) => {
    if (slug === "all") {
      router.push("/interview-sheets");
    } else {
      router.push({ pathname: "/interview-sheets", query: { roadmap: slug } });
    }
  };

  const getSheetEnrollmentInfo = (sheetItem: any) => {
    const slug = sheetItem.slug;
    const enrolled = enrolledSheets.find(
      (s: any) =>
        s.slug === slug ||
        s._id === sheetItem._id ||
        s.name?.toLowerCase() ===
          (sheetItem.name || sheetItem.title)?.toLowerCase() ||
        s.title?.toLowerCase() ===
          (sheetItem.name || sheetItem.title)?.toLowerCase(),
    );

    const isEnrolled = Boolean(enrolled || sheetItem.isEnrolled);
    const completedQuestions =
      enrolled?.progress?.completed ??
      (Array.isArray(sheetItem.questions)
        ? sheetItem.questions.filter((q: any) => q.isCompleted).length
        : 0);
    const totalQuestions =
      enrolled?.progress?.total ??
      (Array.isArray(sheetItem.questions)
        ? sheetItem.questions.length
        : sheetItem.totalQuestions || 0);
    const progressPct =
      totalQuestions > 0
        ? Math.round((completedQuestions / totalQuestions) * 100)
        : (enrolled?.progress?.percentage ?? 0);
    const isInProgress = completedQuestions > 0 || progressPct > 0;

    return {
      isEnrolled,
      isInProgress,
      completedQuestions,
      totalQuestions,
      progressPct,
    };
  };

  const overallLoading = userLoading || sheetsLoading;

  // If a topic is selected, render the reusable SheetLearningSpace matching Platform
  if (router.query.topic) {
    return (
      <Fragment>
        <Head>
          <title>
            {props.sheet?.name
              ? `${props.sheet.name} | OnCampus Sheets`
              : "Interview Sheet | OnCampus"}
          </title>
        </Head>
        <div className="w-full min-w-0 max-w-full font-sans space-y-2.5 pb-4">
          <SheetLearningSpace
            sheetSlug={String(router.query.topic)}
            initialSheet={props.sheet}
            user={user}
            onBack={() => router.push("/interview-sheets")}
            onNavigateToDashboard={() => router.push("/dashboard")}
          />
        </div>
      </Fragment>
    );
  }

  if (overallLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Fragment>
      <Head>
        <title>Interview Sheets | OnCampus</title>
        <meta
          name="description"
          content="Curated interview prep sheets covering DSA, Frontend, Backend, and Database."
        />
      </Head>
      {props.seoMeta ? <SEO seoMeta={props.seoMeta} /> : null}

      <div className="w-full min-w-0 max-w-full font-sans px-1 sm:px-2 py-1 space-y-3 pb-4">
        {/* Breadcrumb Navigation on Top */}
        <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          <Link
            href="/dashboard"
            className="hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            OnCampus
          </Link>
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <span className="font-bold text-[#FF4D4D]">Interview Sheets</span>
        </nav>

        {/* Header Banner matching Platform */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 bg-white dark:bg-[#16161A] p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-[#26262C] shadow-2xs">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-50 dark:bg-red-950/40 text-[#FF4D4D] border border-red-200/80 dark:border-red-900/60">
                Interview Prep Space
              </span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                {sheetsData.length} Sheets Available
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Crack Tech Interviews
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xl">
              Curated topic-wise sheets with top interview questions, code
              snippets and in-depth answers.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-[#202026] border border-slate-200 dark:border-[#2C2C34] text-xs font-bold text-slate-700 dark:text-slate-200">
              {enrolledSheets.length} Enrolled
            </span>
          </div>
        </div>

        {/* Filter Pills & Search matching Platform */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 bg-white dark:bg-[#16161A] p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 dark:border-[#26262C] shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap">
            <button
              type="button"
              onClick={() => handleRoadmapClick("all")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                selectedRoadmap === "all"
                  ? "bg-[#FF4D4D] text-white shadow-xs"
                  : "bg-slate-50 dark:bg-[#202026] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2A2A32] hover:text-slate-900 dark:hover:text-white",
              )}
            >
              <span>All Sheets</span>
              <span className="text-[10px] opacity-75">
                ({sheetsData.length})
              </span>
            </button>

            {roadmapKeys.map((roadmap) => {
              const slug = roadmap.toLowerCase();
              const isActive = selectedRoadmap === slug;
              const count = groupedByRoadmap[roadmap]?.length || 0;

              return (
                <button
                  key={roadmap}
                  type="button"
                  onClick={() => handleRoadmapClick(slug)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                    isActive
                      ? "bg-[#FF4D4D] text-white shadow-xs"
                      : "bg-slate-50 dark:bg-[#202026] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2A2A32] hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  <span>{roadmap}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-3.5 h-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search sheet title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 dark:bg-[#202026] border border-slate-200 dark:border-[#2C2C34] rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#1E1E24] focus:border-[#FF4D4D] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Sheets Grid matching Platform Learn/Interview Prep */}
        {filteredSheets.length === 0 ? (
          <div className="py-16 bg-white dark:bg-[#16161A] border border-slate-200/80 dark:border-[#26262C] rounded-2xl text-center p-6 space-y-2">
            <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              No sheets found
            </h3>
            <p className="text-xs text-slate-400">
              Try adjusting your search query or roadmap filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {filteredSheets.map((s: any) => {
              const info = getSheetEnrollmentInfo(s);
              const isLocked = s.isPremium && !purchaseStatuses[s._id];
              const coverImage =
                s.coverImageURL ||
                s.coverImageUrl ||
                s.cover_image_url ||
                s.image ||
                s.thumbnail;

              return (
                <div
                  key={s._id || s.slug}
                  onMouseEnter={() => prefetchSheetData(s.slug, user?.id)}
                  className="bg-white dark:bg-[#17171B] border border-slate-200/80 dark:border-[#26262C] hover:border-slate-300 dark:hover:border-[#383842] rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Image or Banner */}
                    {coverImage ? (
                      <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-[#222228]">
                        <img
                          src={coverImage}
                          alt={s.name || s.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-black/60 text-white backdrop-blur-xs">
                          {s.roadmap || "SHEET"}
                        </div>
                        {info.isInProgress ? (
                          <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#FF4D4D] text-white shadow-xs">
                            In Progress
                          </div>
                        ) : info.isEnrolled ? (
                          <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white shadow-xs">
                            Enrolled
                          </div>
                        ) : isLocked ? (
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-black/70 backdrop-blur-sm text-white/90">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Premium</span>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 dark:from-red-950/40 dark:to-rose-950/20 border-b border-rose-100 dark:border-red-950/60 flex items-center justify-between">
                        <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#FF4D4D]">
                          {s.roadmap || "INTERVIEW SHEET"}
                        </span>
                        {info.isInProgress ? (
                          <span className="text-[10px] font-black uppercase text-[#FF4D4D] bg-white dark:bg-[#24242C] px-2 py-0.5 rounded-full shadow-2xs">
                            In Progress
                          </span>
                        ) : info.isEnrolled ? (
                          <span className="text-[10px] font-black uppercase text-emerald-600 bg-white dark:bg-[#24242C] px-2 py-0.5 rounded-full shadow-2xs">
                            Enrolled
                          </span>
                        ) : isLocked ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-amber-500 bg-black/40 px-2 py-0.5 rounded-full">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Premium</span>
                          </span>
                        ) : null}
                      </div>
                    )}

                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#FF4D4D] transition-colors leading-snug">
                        {s.name || s.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {s.description ||
                          "Curated list of technical interview questions."}
                      </p>

                      {/* Progress info if enrolled */}
                      {info.isInProgress && (
                        <div className="pt-2 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                            <span>{info.progressPct}% Solved</span>
                            <span className="text-slate-400 font-medium text-[10px]">
                              {info.completedQuestions}/{info.totalQuestions}{" "}
                              Solved
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-[#26262C] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#FF4D4D] h-1.5 rounded-full transition-all"
                              style={{ width: `${info.progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0 mt-auto">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/interview-sheets?topic=${s.slug}`)
                      }
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                        info.isInProgress
                          ? "bg-[#FF4D4D] hover:bg-[#EE3126] text-white"
                          : info.isEnrolled
                            ? "bg-slate-900 hover:bg-slate-800 dark:bg-[#2A2A32] dark:hover:bg-[#34343E] text-white"
                            : "bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 text-[#FF4D4D] border border-red-200 dark:border-red-900/60"
                      }`}
                    >
                      {info.isInProgress
                        ? "Resume Sheet"
                        : info.isEnrolled
                          ? "Start Sheet"
                          : "Start Learning"}{" "}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Fragment>
  );
};

export const getServerSideProps = async (context: any) => {
  const { topic } = context.query;
  if (topic) {
    const pagePropsResult = await getSheetPageProps(context);

    if ("redirect" in pagePropsResult) {
      return pagePropsResult;
    }

    const props = pagePropsResult.props as any;
    if (props && props.sheet) {
      const sheet = props.sheet;
      const user = await isUserAuthenticated(context.req);

      let isPaidUser = false;
      if (user?.id) {
        try {
          const checkRes = await fetch(
            `${envConfig.API_URL}${routes.api.checkStatus}?userId=${user.id}&productId=oncampus&productType=ONCAMPUS`,
          );
          const checkData = await checkRes.json();
          isPaidUser =
            checkData?.status === true && checkData?.data?.purchased === true;
        } catch (err) {
          console.error(
            "Error checking payment status in getServerSideProps:",
            err,
          );
        }
      }

      if (!isPaidUser && sheet.questions && sheet.questions.length > 0) {
        const total = sheet.questions.length;
        const freeLimit = Math.ceil(total * 0.3);

        sheet.questions = sheet.questions.map((q: any, idx: number) => {
          const isLocked = idx >= freeLimit;
          if (isLocked) {
            return {
              ...q,
              isLocked: true,
              answer: "",
              resources: [],
              notes: "",
              content: {
                ...q.content,
                markdownContent: "",
              },
            };
          }
          return {
            ...q,
            isLocked: false,
          };
        });
      } else if (sheet.questions) {
        sheet.questions = sheet.questions.map((q: any) => ({
          ...q,
          isLocked: false,
        }));
      }

      props.sheet = sheet;
      props.isPaidUser = isPaidUser;
    }

    return pagePropsResult;
  }
  return { props: {} };
};

export default InterviewPrepDashboardPage;
