"use client"

import TodoForm from "@/components/todos/TodoForm";
import TodoList from "@/components/todos/TodoList";
import type { Todo, TodoFilter } from "@/types/todo"
import { useState } from "react"

export default function TodosPage() {

    const [todos, setTodos] = useState<Todo[]>([]);
    const [filter] = useState<TodoFilter>("all")


    function addTodo(title: string) {
        const newTodo: Todo = {
            id: crypto.randomUUID(),
            title,
            completed: false,
            created: new Date().toISOString(),
        }
        setTodos((current) => [...current, newTodo])
    }

    function toggleTodo(id: string) {
        setTodos((current) =>
            current.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        )
    }

    function deleteTodo(id: string) {
        setTodos((current) =>
            current.filter((todo) => todo.id !== id)
        )
    }

    const filteredTodos = todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed
        return true
    })

    return (
        <main>
            <h1>My todos</h1>

            <TodoForm onAdd={addTodo} />

            {/* <TodoFilters filter={filter} onFilterChange={setFilter} /> */}


            <TodoList
                todos={filteredTodos}
                onToggle={toggleTodo}
                onDelete={deleteTodo}


            />

        </main>
    )





}
