import React from "react";

interface Props {
  name: string;
  age: number;
}

export function MyComponent({ name, age }: Props): React.ReactNode {
  const [greeting, setGreeting] = React.useState("Hello!");
  React.useEffect(() => {
    setGreeting(`Hello ${name}, you are ${age} years old`);
  }, [name, age]);
  return <p>{greeting}</p>;
}
