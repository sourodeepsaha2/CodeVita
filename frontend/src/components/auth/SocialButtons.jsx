import toast from "react-hot-toast";
import { GitHubIcon, GoogleIcon } from "../icons";

const PROVIDERS = [
  { key: "google", name: "Google", Icon: GoogleIcon },
  { key: "github", name: "GitHub", Icon: GitHubIcon },
];

export default function SocialButtons({ mode = "login" }) {
  // OAuth isn't wired up yet, so let the user know instead of silently doing nothing.
  const handleClick = (name, key) => {
    toast(`${name} sign-in is coming soon.`, { icon: "🚧", id: `social-${key}` });
  };

  return (
    <div className="social-row">
      {PROVIDERS.map(({ key, name, Icon }) => (
        <button
          key={key}
          type="button"
          id={`btn-${key}-${mode}`}
          className="social-btn"
          onClick={() => handleClick(name, key)}
        >
          <Icon />
          {name}
        </button>
      ))}
    </div>
  );
}
