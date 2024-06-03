import logo from "../../assets/sidebarAssets/logo.png";

export default function Logo() {
  return (
    <div className="logo flex items-center">
      <div className="img-box">
        <img
          className="transition "
          src={logo}
          alt="pong-logo"
          referrerPolicy="no-referrer"
        />
      </div>
      <p className="ml-4 transition text-[#3c3f88] text-2xl font-semibold">
        Pong
      </p>
    </div>
  );
}
