"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Check, X, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

type Difficulty = "easy" | "medium" | "hard";

interface MathChallengeProps {
  difficulty: Difficulty;
  onSolved: () => void;
}

function generateProblem(difficulty: Difficulty): { question: string; answer: number } {
  let a: number, b: number, op: string, answer: number;

  switch (difficulty) {
    case "easy":
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      op = Math.random() > 0.5 ? "+" : "−";
      answer = op === "+" ? a + b : a - b;
      break;
    case "medium":
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * 50) + 10;
      const ops = ["+", "−", "×"];
      op = ops[Math.floor(Math.random() * ops.length)];
      if (op === "+") answer = a + b;
      else if (op === "−") answer = a - b;
      else { answer = a * b; a = a; b = b; }
      break;
    case "hard":
      a = Math.floor(Math.random() * 100) + 10;
      b = Math.floor(Math.random() * 100) + 10;
      const hardOps = ["+", "−", "×", "÷"];
      op = hardOps[Math.floor(Math.random() * hardOps.length)];
      if (op === "÷") {
        answer = a;
        a = a * b;
      } else if (op === "+") answer = a + b;
      else if (op === "−") answer = a - b;
      else answer = a * b;
      break;
    default:
      a = 1; b = 1; op = "+"; answer = 2;
  }

  return { question: `${a} ${op} ${b}`, answer };
}

export default function MathChallenge({ difficulty, onSolved }: MathChallengeProps) {
  const [problem, setProblem] = useState(() => generateProblem(difficulty));
  const [userInput, setUserInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setProblem(generateProblem(difficulty));
    setUserInput("");
    setError(false);
  }, [difficulty]);

  const handleSubmit = useCallback(() => {
    const parsed = parseInt(userInput, 10);
    if (isNaN(parsed)) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (parsed === problem.answer) {
      onSolved();
    } else {
      setError(true);
      setShake(true);
      setUserInput("");
      setTimeout(() => {
        setShake(false);
        setError(false);
        setProblem(generateProblem(difficulty));
      }, 800);
    }
  }, [userInput, problem.answer, onSolved, difficulty]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="flex items-center gap-2 text-red-500">
        <AlertTriangle className="h-5 w-5" />
        <span className="text-sm font-medium">Solve to dismiss alarm</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Brain className="h-3.5 w-3.5" />
        <span className="capitalize">{difficulty} difficulty</span>
      </div>

      <div className="text-center">
        <p className="text-5xl font-bold text-gray-900 dark:text-white tabular-nums mb-6">
          {problem.question} = ?
        </p>

        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <input
            type="number"
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Your answer"
            autoFocus
            className={`w-48 px-4 py-3 text-center text-2xl font-bold rounded-xl border-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-all ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
            }`}
          />

          <Button onClick={handleSubmit} className="w-48 gap-2" disabled={!userInput}>
            {error ? (
              <>
                <X className="h-4 w-4" />
                Try Again
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
