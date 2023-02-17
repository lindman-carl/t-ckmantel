import LogoWebp from "../assets/logo.webp";

const Logo = () => {
  return (
    <div className="my-8 flex items-center justify-center gap-x-2">
      <div>
        <img src={LogoWebp} alt="logo" width="100px" height="100px" />
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="text-5xl font-extrabold tracking-tight text-slate-800  underline decoration-rose-900 drop-shadow">
          täckmantel
        </div>
        <div className="text-lg font-semibold text-rose-900">
          [tɛkˈmɑ:nte:l]
        </div>
      </div>
    </div>
  );
};
export default Logo;

// [tɛkˈmɑ:nte:l]
// god bless CoPilot
