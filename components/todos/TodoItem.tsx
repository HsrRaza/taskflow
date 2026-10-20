
"use client";

import type { Todo } from "@/types/todo";

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
}: TodoItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-label={`Mark ${todo.title} as completed`}
        />

        <p
          className={
            todo.completed
              ? "text-gray-400 line-through"
              : ""
          }
        >
          {todo.title}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        className="text-red-600"
      >
        Delete
      </button>
    </div>
  );
}
