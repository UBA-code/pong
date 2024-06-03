import {
  ComponentProps,
  ReactElement,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

//? icons
import { FaCheck } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";

export type confirmColor = "success" | "danger" | "warning" | "normal";

interface confirmElementProp {
  color: confirmColor;
  hideConfirmBtn: CallableFunction;
  parentElementRef: RefObject<HTMLDivElement>;
  confirmCallback: () => void;
  hasChoice?: boolean;
}

function ConfirmElement({
  color,
  hideConfirmBtn,
  parentElementRef,
  confirmCallback,
  hasChoice,
}: confirmElementProp) {
  let colorClassname: string = "";

  switch (color) {
    case "success":
      colorClassname = "bg-green-500";
      break;
    case "danger":
      colorClassname = "bg-red-500";
      break;
    case "warning":
      colorClassname = "bg-orange-500";
      break;
    case "normal":
      colorClassname = "bg-gray-500";
      break;
    default:
      colorClassname = "bg-gray-500";
  }

  function closeHandler(e: MouseEvent) {
    if (!parentElementRef.current?.contains(e.target as HTMLElement)) {
      hideConfirmBtn();
    }
  }

  useEffect(() => {
    document.addEventListener("click", closeHandler);
    return () => document.removeEventListener("click", closeHandler);
  });

  return (
    <>
      {hasChoice && (
        <motion.button
          className={`confirm-element absolute w-1/2 h-full top-0 left-0 bg-slate-400 rounded-l-full
      flex items-center justify-center text-white space-x-2`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => hideConfirmBtn()}
        >
          <IoCloseSharp size={22} />
        </motion.button>
      )}
      <motion.button
        className={`confirm-element absolute ${
          hasChoice ? "w-1/2 rounded-r-full" : "w-full rounded-md"
        } h-full top-0 right-0 ${colorClassname} 
                flex items-center justify-center text-white space-x-2`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 1 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          hideConfirmBtn();
          confirmCallback();
        }}
      >
        <FaCheck />
      </motion.button>
    </>
  );
}

interface DoubleCheckBtnProp extends ComponentProps<"div"> {
  childComponent: ReactElement;
  color?: confirmColor;
  hasConfirm: boolean;
  hasChoice?: boolean;
  confirmCallback?: () => void;
}

export default function DoubleCheckBtn({
  childComponent,
  color,
  hasConfirm,
  confirmCallback,
  hasChoice = true,
  ...prop
}: DoubleCheckBtnProp) {
  const thisComponentRef = useRef<HTMLDivElement>(null);
  const [confirmElementStatus, setConfirmElementStatus] = useState(false);

  return (
    <motion.div
      ref={thisComponentRef}
      className={`DoubleCheckBtn-container ${
        prop.className || ""
      } relative flex items-center`}
    >
      <motion.div
        className="child-component cursor-pointer w-full"
        whileHover={{ scale: 1.005, filter: "brightness(50%)" }}
        whileTap={{ scale: 1 }}
        onClick={
          hasConfirm ? () => setConfirmElementStatus(true) : prop.onClick!
        }
      >
        {childComponent}
      </motion.div>
      <AnimatePresence>
        {hasConfirm && confirmElementStatus && (
          <ConfirmElement
            parentElementRef={thisComponentRef}
            color={color!}
            hideConfirmBtn={() => setConfirmElementStatus(false)}
            confirmCallback={confirmCallback!}
            hasChoice={hasChoice}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
