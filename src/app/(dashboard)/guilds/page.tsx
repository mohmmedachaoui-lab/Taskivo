"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Gamepad2, Plus, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function GuildsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Guilds
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Join a guild to compete with others
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Guild
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: "Alpha Squad", members: 12, rank: "#3" },
          { name: "Code Warriors", members: 8, rank: "#7" },
          { name: "Task Masters", members: 15, rank: "#1" },
        ].map((guild, i) => (
          <motion.div
            key={guild.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card hover>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Gamepad2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {guild.name}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {guild.rank} Leaderboard
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{guild.members} members</span>
                </div>
                <Button variant="secondary" size="sm">
                  Join
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
