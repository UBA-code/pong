export default function setColorVariables() {
  const rootElement = document.querySelector(":root") as HTMLElement;
  if (rootElement?.classList.contains("dark")) {
    document.documentElement.style.setProperty("--Light-blue-grey", "#02091d");
    document.documentElement.style.setProperty("--light-periwinkle", "#122430");
    document.documentElement.style.setProperty("--light-blue", "#191e29");
    document.documentElement.style.setProperty("--settings-box", "#12141a");
    document.documentElement.style.setProperty("--light-gray", "#35516d");
    document.documentElement.style.setProperty("--very-light-gray", "#050505");
    document.documentElement.style.setProperty("--blue", "#0c48df");
    document.documentElement.style.setProperty("--light-purple", "#1b2d42");
    document.documentElement.style.setProperty("--sky-blue-dark", "#e2e6e9");
    document.documentElement.style.setProperty("--gold-bg", "0");
    document.documentElement.style.setProperty("--blue-light-bg", "0");
    document.documentElement.style.setProperty("--light-gold", "#7f6635");
    document.documentElement.style.setProperty("--lose-red", "#821c2e");
    document.documentElement.style.setProperty("--text-blue", "#cdcdcd");
    document.documentElement.style.setProperty(
      "--text-blue-second-text",
      "#35516d"
    );
    document.documentElement.style.setProperty("--purple", "#003B5C");
    document.documentElement.style.setProperty("--sky-blue", "#12141a");
    document.documentElement.style.setProperty("--white-bg", "#191e29");
    document.documentElement.style.setProperty("--white-text", "#fff");
    document.documentElement.style.setProperty("--nav-icons", "#9fccc6");
  } else {
    document.documentElement.style.setProperty("--Light-blue-grey", "#DEE7FF");
    document.documentElement.style.setProperty("--light-periwinkle", "#B6CAFF");
    document.documentElement.style.setProperty("--light-blue", "#E7E8FE");
    document.documentElement.style.setProperty("--settings-box", "#E7E8FE");
    document.documentElement.style.setProperty("--light-gray", "#BCC3E0");
    document.documentElement.style.setProperty("--very-light-gray", "#F9F9F9");
    document.documentElement.style.setProperty("--blue", "#1657FF");
    document.documentElement.style.setProperty("--light-purple", "#C1C5FF");
    document.documentElement.style.setProperty("--sky-blue", "#888DF8");
    document.documentElement.style.setProperty("--sky-blue-dark", "#15191d");
    document.documentElement.style.setProperty("--text-blue", "#3C3F88");
    document.documentElement.style.setProperty(
      "--text-blue-second-text",
      "#3C3F88"
    );
    document.documentElement.style.setProperty("--purple", "#5236FF");
    document.documentElement.style.setProperty("--gold", "#FFBB38");
    document.documentElement.style.setProperty("--blue-light-bg", "#99B5F3");
    document.documentElement.style.setProperty("--gold-bg", "#FFF5D9");
    document.documentElement.style.setProperty("--light-gold", "#FFF5D9");
    document.documentElement.style.setProperty("--lose-red", "#FFD1DC");
    document.documentElement.style.setProperty("--lose-text-red", "#F44771");
    document.documentElement.style.setProperty("--trans-bg", "#00000060");
    document.documentElement.style.setProperty("--wave-start", "#5D25FC");
    document.documentElement.style.setProperty("--wave-end", "#9773FF");
    document.documentElement.style.setProperty("--white-bg", "#fff");
    document.documentElement.style.setProperty("--white-text", "#000");
    document.documentElement.style.setProperty("--nav-icons", "#3C3F88");
  }
}
