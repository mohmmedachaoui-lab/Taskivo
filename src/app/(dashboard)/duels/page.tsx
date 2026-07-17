"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Swords, Shield, Crown, Users } from "lucide-react";

export default function DuelsPage() {
  const activeDuels: any[] = [];
  const leaderboard: any[] = [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Swords className="h-8 w-8 text-red-500" />
            War Room
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Challenge others and prove your productivity
          </p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25">
          <Swords className="h-4 w-4" />
          New Duel
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          Active Duels
        </h2>
        {activeDuels.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-12">
            <Swords className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No active duels
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Start a duel to compete with others
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeDuels.map((duel: any) => null)}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </h2>
        <Card>
          {leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No leaderboard data
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Complete tasks to appear on the leaderboard
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry: any) => null)}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
