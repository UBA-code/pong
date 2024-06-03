import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface SectionLinkInfo {
  title: string;
  Icon: string;
  to?: string;
}

export default function SesctionLink({ title, Icon, to }: SectionLinkInfo) {
  const stats = useSelector((stats: RootState) => stats.appStates);

  return (
    <motion.div className="section-box">
      <NavLink
        to={to || "/"}
        className={"nav-link w-fit flex items-center my-6 py-4"}
      >
        <img
          className={`transition-[filter] duration-75 ${
            stats.currentPage === title ? "active" : ""
          }`}
          src={Icon}
          alt="icon"
          referrerPolicy="no-referrer"
        />
        <h1
          className={`text-[--light-gray] dark:text-[--nav-icons] pl-3 transition-all pt-[4px]  ${
            stats.currentPage === title ? "active" : ""
          }`}
        >
          {title}
        </h1>
      </NavLink>
    </motion.div>
  );
}
