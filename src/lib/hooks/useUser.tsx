import { useState } from 'react';

// component
export default function UseUser() {
  return <div>useUser</div>;
}

// hook

export function useUser() {
  const [user, setUser] = useState(null);

  return user;
}
