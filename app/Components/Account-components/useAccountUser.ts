"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export const useAccountUser = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!session?.user?.email) return;
    fetch(`/api/getUserDetails/${session.user.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?._id) {
          setUser(data);
          setIsLoaded(true);
        }
      })
      .catch((err) => console.error("Failed to fetch user:", err));
  }, [session?.user?.email]);

  return { user, setUser, session, isLoaded };
};
