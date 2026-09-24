import { EyeOff, RefreshCw, Trophy } from "lucide-react";
import { useState } from "react";

import {
  type LeaderboardType,
  useAdminLeaderboard,
  useClosePeriod,
  useSetLeaderboardExclusion,
} from "@/api/leaderboardApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const PERIOD_KEY_HINT: Record<LeaderboardType, string> = {
  DAILY: "2026-09-24",
  WEEKLY: "2026-W39",
  MONTHLY: "2026-09",
};

const LeaderboardPage = () => {
  const { toast } = useToast();
  const [type, setType] = useState<LeaderboardType>("WEEKLY");
  const [periodKeyInput, setPeriodKeyInput] = useState("");
  const [periodKey, setPeriodKey] = useState("");

  const { data, isLoading, refetch, error } = useAdminLeaderboard(
    type,
    periodKey,
  );
  const setExclusion = useSetLeaderboardExclusion();
  const closePeriod = useClosePeriod();

  const handleExclusion = async (
    userId: string,
    name: string,
    excluded: boolean,
  ) => {
    try {
      await setExclusion.mutateAsync({ userId, excluded });
      toast({
        title: excluded ? "Learner excluded" : "Learner restored",
        description: name,
      });
    } catch {
      toast({ title: "Could not update exclusion", variant: "destructive" });
    }
  };

  const handleClose = async () => {
    try {
      const result = await closePeriod.mutateAsync({
        type,
        ...(periodKey ? { periodKey } : {}),
      });
      const closed = result?.data?.[0];
      toast({
        title: closed?.alreadyClosed ? "Already closed" : "Period closed",
        description: closed
          ? `${closed.periodKey}: ${closed.sent} emails sent, ${closed.skipped} skipped, ${closed.failed} failed`
          : undefined,
      });
    } catch (e) {
      toast({
        title: "Could not close period",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  const board = data?.board;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Trophy className="text-amber-500" /> Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Live Period Scores. Hidden and excluded learners are shown here only.
          </p>
        </div>
        <Button onClick={() => refetch()} size="sm" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Tabs onValueChange={(v) => setType(v as LeaderboardType)} value={type}>
          <TabsList>
            <TabsTrigger value="DAILY">Daily</TabsTrigger>
            <TabsTrigger value="WEEKLY">Weekly</TabsTrigger>
            <TabsTrigger value="MONTHLY">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          className="w-44"
          onChange={(e) => setPeriodKeyInput(e.target.value.trim())}
          placeholder={`Current (e.g. ${PERIOD_KEY_HINT[type]})`}
          value={periodKeyInput}
        />
        <Button onClick={() => setPeriodKey(periodKeyInput)} variant="secondary">
          Load period
        </Button>
        <Button
          disabled={closePeriod.isPending}
          onClick={handleClose}
          variant="outline"
        >
          {periodKey ? `Close ${periodKey}` : "Close previous period"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {board
                ? `${board.periodKey} · ${board.totalLearners} learners`
                : "Board"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : error ? (
              <p className="text-sm text-destructive">Failed to load board.</p>
            ) : !board?.entries.length ? (
              <p className="text-sm text-muted-foreground">
                No learners on this board.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Learner</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Leaderboard</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {board.entries.map((entry) => (
                    <TableRow key={entry.userId}>
                      <TableCell>{entry.rank}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{entry.displayName}</span>
                          {entry.hidden && (
                            <Badge variant="secondary">
                              <EyeOff className="mr-1 h-3 w-3" /> Hidden
                            </Badge>
                          )}
                          {entry.excluded && (
                            <Badge variant="destructive">Excluded</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {entry.userId}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {entry.score}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          disabled={setExclusion.isPending}
                          onClick={() =>
                            handleExclusion(
                              entry.userId,
                              entry.displayName,
                              !entry.excluded,
                            )
                          }
                          size="sm"
                          variant={entry.excluded ? "outline" : "destructive"}
                        >
                          {entry.excluded ? "Restore" : "Exclude"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Champions history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!data?.champions.length ? (
              <p className="text-sm text-muted-foreground">
                No closed periods yet.
              </p>
            ) : (
              data.champions.map((period) => (
                <div key={period.periodKey}>
                  <p className="text-sm font-semibold">{period.periodKey}</p>
                  <ol className="mt-1 space-y-1 text-sm">
                    {period.champions.map((c) => (
                      <li className="flex justify-between" key={c.userId}>
                        <span>
                          {["🥇", "🥈", "🥉"][c.rank - 1]} {c.displayName}
                        </span>
                        <span className="text-muted-foreground">
                          {c.score} pts
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaderboardPage;
