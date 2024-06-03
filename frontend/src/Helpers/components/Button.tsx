import { ReactElement } from "react";

interface ButtonObj {
  content: string;
  icon?: ReactElement;
  onclick?: (e: any) => any;
}

export default function Button({ content, icon, onclick }: ButtonObj) {
  return (
    <div
      className="button-box w-full bg-[var(--blue)] py-4 rounded text-center text-white font-semibold
						cursor-pointer flex items-center justify-center hover:brightness-90 transition"
      onClick={onclick}
    >
      <h1 className={`${icon ? "pr-3" : ""}`}>{content}</h1>
      {icon}
    </div>
  );
}
