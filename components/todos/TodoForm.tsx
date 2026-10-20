"use client"

import React, { useState } from 'react'

type  todoFormProps = {
    onAdd:(title:string) => void;
}

    
export default  function TodoForm({onAdd}:todoFormProps) {

    const [title, setTitle] = useState("");
    const [completed , setCompleted] = useState(false)

    function handleSubmit(e:React.FormEvent){


        e.preventDefault()

        const trimmedTitle = title.trim()

        if (!trimmedTitle) return ;

        onAdd(trimmedTitle)

        setTitle("")
        setCompleted(false)
    }



          

       


    
    
    
  return (
    <div>
        <h1>New Todo</h1>

        <form onSubmit={handleSubmit}>
            <label htmlFor="title">Todo :</label>
            <input 
            type="text" 
            id="title" 
            placeholder='Add a Todo'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            />    

            <label>Completed:</label>
            <input 
            type="checkbox"
            id='completed'
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            />        

            <button type="submit">Add</button>
            
        </form>
    </div>
  )
}
