"use client";
import { useEffect, useState, MouseEvent } from "react";
import AccountPageShell from "./AccountPageShell";
import dynamic from "next/dynamic";

const Popup = dynamic(() => import("../Popup"), { ssr: false });
import bcrypt from "bcryptjs";
import { UploadButton } from "@/app/Uploadthing/uploadthing";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useAccountUser } from "./useAccountUser";

const inputClass =
  "w-full bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-cyan-500/50 transition-colors text-sm placeholder:text-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed";
const labelClass =
  "text-xs font-semibold uppercase tracking-wider text-neutral-400";

const AccountInfo = () => {
  const { user, session, isLoaded } = useAccountUser();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [hasProvider, setHasProvider] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [initialData, setInitialData] = useState({ username: "", email: "" });
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordre: "",
  });

  useEffect(() => {
    if (!user) return;
    setHasProvider(user.provider !== "credentials");
    const base = { username: user.username, email: user.email };
    setInitialData(base);
    setFormData({ ...base, password: "", passwordre: "" });
  }, [user]);

  const handleDeleteAccount = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowPopup(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${user._id}/deleteAccount`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: user._id }),
      });
      if (response.ok) {
        setTimeout(() => { signOut({ callbackUrl: "/" }); }, 2000);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("An error occurred while deleting the account.");
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowPopup(false);
    setIsDeleting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: string[] = [];

    if (
      formData.username === initialData.username &&
      !formData.password.trim() &&
      !formData.passwordre.trim()
    ) {
      alert("Nothing to update");
      return;
    }

    const usernameRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W]{10,}$/;
    if (formData.username.trim() && !usernameRegex.test(formData.username)) {
      errors.push(
        "Username must be at least 10 characters long, contain at least one capital letter, one number, and may include symbols."
      );
    }

    if (formData.password.trim() || formData.passwordre.trim()) {
      const passwordRegex = /^(?=.*[A-Z])[A-Za-z\d\W]{10,}$/;
      if (!passwordRegex.test(formData.password)) {
        errors.push(
          "Password must be at least 10 characters long, contain at least one capital letter, and may include symbols."
        );
      }
      if (formData.password !== formData.passwordre) {
        errors.push("Passwords do not match");
      }
    }

    if (errors.length > 0) {
      setErrorMessages(errors);
      return;
    }

    const updatedData: any = { username: formData.username };
    if (formData.password.trim()) {
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      updatedData.password = hashedPassword;
    }

    const response = await fetch(`/api/users/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      setErrorMessages([]);
      alert("User info updated successfully!");
    } else {
      alert("Error updating user info");
    }
  };

  return (
    <AccountPageShell show={!!user} isLoaded={isLoaded}>
      {hasProvider ? (
        <>
          <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-cyan-400/30 ring-offset-2 ring-offset-[#13131f]">
            <Image
              src={user.profilePicture || "/assets/images/default_avatar.jpg"}
              alt="User Avatar"
              className="object-cover"
              width={80}
              height={80}
              priority
            />
          </div>

          <form className="flex flex-col gap-4 mt-8 w-full">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className={labelClass}>Username</label>
              <input
                type="text"
                name="name"
                value={session?.user?.name || "No user name found"}
                className={inputClass}
                autoComplete="off"
                disabled
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mail" className={labelClass}>Email</label>
              <input
                type="email"
                name="mail"
                value={session?.user?.email || "No email found"}
                className={inputClass}
                disabled
              />
            </div>
            <div className="bg-amber-900/20 border border-amber-500/20 text-amber-200/70 text-sm text-center p-4 rounded-lg">
              Nothing can be edited as you are connected with a provider.
            </div>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600/80 hover:bg-red-700 transition duration-200 text-white rounded-lg px-4 py-2.5 font-medium border border-red-500/30 mt-2"
            >
              Delete Account
            </button>
            {showPopup && (
              <Popup onConfirm={confirmDelete} onCancel={cancelDelete} isDeleting={isDeleting} />
            )}
          </form>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-cyan-400/30 ring-offset-2 ring-offset-[#13131f]">
              <Image
                src={user?.profilePicture || "/assets/images/default_avatar.jpg"}
                alt="User Avatar"
                className="object-cover"
                fill
                priority
              />
            </div>
            <UploadButton
              className="ut-button:bg-cyan-700/80 ut-button:hover:bg-cyan-700 ut-button:rounded-lg ut-button:text-sm"
              endpoint="imageUploader"
              onClientUploadComplete={async (res) => {
                const imageUrl = res[0].url;
                await fetch("/api/saveImage", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: session?.user?.email,
                    profilePicture: imageUrl,
                  }),
                });
              }}
              onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
              }}
            />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8 w-full">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className={labelClass}>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={inputClass}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className={labelClass}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                disabled
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className={labelClass}>New Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="passwordre" className={labelClass}>Re-enter Password</label>
              <input
                type="password"
                name="passwordre"
                placeholder="Re-enter password"
                value={formData.passwordre}
                onChange={handleChange}
                className={inputClass}
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 transition duration-200 text-white rounded-lg px-4 py-2.5 font-medium mt-2"
            >
              Update
            </button>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600/80 hover:bg-red-700 transition duration-200 text-white rounded-lg px-4 py-2.5 font-medium border border-red-500/30"
            >
              Delete Account
            </button>
            {showPopup && (
              <Popup onConfirm={confirmDelete} onCancel={cancelDelete} isDeleting={isDeleting} />
            )}
          </form>
        </>
      )}

      {errorMessages.length > 0 && (
        <ul className="bg-red-900/40 border border-red-500/30 text-red-300 text-sm text-center p-4 rounded-lg w-full mt-4">
          {errorMessages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      )}
    </AccountPageShell>
  );
};

export default AccountInfo;
