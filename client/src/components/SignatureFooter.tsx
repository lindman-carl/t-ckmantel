import OpenInNewSvg from "../assets/open-in-new.svg";

const SignatureFooter = () => {
  return (
    <div className="inline-flex gap-4 py-4 text-center text-base font-light text-slate-800">
      @lindman_dev
      <a
        href="https://github.com/lindman-carl/tackmantel"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 font-semibold underline decoration-rose-900 decoration-2 underline-offset-auto "
      >
        GitHub
        <img
          src={OpenInNewSvg}
          alt="open in new tab"
          width="16px"
          height="16px"
        />
      </a>
    </div>
  );
};

export default SignatureFooter;
