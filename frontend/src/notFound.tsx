import { Link } from "react-router-dom";
import notFoundImg from "./assets/notFound.gif";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="absolute w-full h-full bg-[--sky-blue-dark]">
      <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold text-3xl flex flex-col text-center space-y-4">
        <motion.img
          className="rounded-sm"
          src={notFoundImg}
          alt="nigga not found"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ stiffness: 0 }}
        />
        <motion.span
          className="text-red-500 text-6xl"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, stiffness: 0 }}
        >
          404
        </motion.span>
        <motion.span
          className="text-center text-[--blue-cyan]"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, stiffness: 0 }}
        >
          Page not Found go to{" "}
          <Link to="/profile">
            <span className="text-[--text-blue]">Profile</span>
          </Link>
        </motion.span>
      </motion.div>
    </div>
  );
}
