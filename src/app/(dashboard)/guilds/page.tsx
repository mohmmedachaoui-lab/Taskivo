"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Gamepad2, Plus, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function GuildsPage() {
  const guilds: any[] = [];

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

      {guilds.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <Gamepad2 className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No guilds available</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Create or join a guild to start competing
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guilds.map((guild: any, i: number) => null)}
        </div>
      )}
    </div>
  );
}
