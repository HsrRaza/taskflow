export type Todo ={
    id:string;
    title:string;
    completed:boolean;
    created:string
}

export type TodoFilter = 'all' | 'active' | 'completed'
