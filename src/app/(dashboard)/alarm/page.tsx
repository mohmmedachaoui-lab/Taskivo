"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Bell, Plus, Trash2, Clock } from "lucide-react";

interface Alarm {
  id: string;
  time: string;
  label: string;
  active: boolean;
  days: string[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AlarmPage() {
  const [alarms, setAlarms] = useState<Alarm[]>([
    {
      id: "1",
      time: "07:00",
      label: "Morning Focus",
      active: true,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
    {
      id: "2",
      time: "22:00",
      label: "Wind Down",
      active: false,
      days: ["Mon", "Wed", "Fri"],
    },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTime, setNewTime] = useState("09:00");
  const [newLabel, setNewLabel] = useState("");

  const toggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const deleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const addAlarm = () => {
    if (!newLabel.trim()) return;
    setAlarms((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        time: newTime,
        label: newLabel,
        active: true,
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      },
    ]);
    setNewLabel("");
    setShowAdd(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Smart Alarm
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Set focus-based alarms to stay on track
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Alarm
        </Button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g. Deep Work Session"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addAlarm}>
                  Add Alarm
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="space-y-4">
        {alarms.map((alarm, i) => (
          <motion.div
            key={alarm.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              className={`flex items-center gap-6 ${
                alarm.active ? "" : "opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock
                  className={`h-5 w-5 ${
                    alarm.active ? "text-blue-500" : "text-gray-400"
                  }`}
                />
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                    {alarm.time}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {alarm.label}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex justify-center">
                <div className="flex gap-1">
                  {DAYS.map((day) => (
                    <span
                      key={day}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        alarm.days.includes(day)
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => toggleAlarm(alarm.id)}
                className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                  alarm.active
                    ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    alarm.active ? "translate-x-6" : ""
                  }`}
                />
              </button>

              <button
                onClick={() => deleteAlarm(alarm.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
