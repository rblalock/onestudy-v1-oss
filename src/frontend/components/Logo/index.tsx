import Image from "next/image";
import Link from "next/link";

import DarkLogo from "$/assets/icons/sm_face.svg";
import WhiteLogo from "$/assets/icons/sm_face.svg";

export const MainLogo = () => {
  return (
    <Link className="items-center space-x-1 flex" href="/">
      <Image
        priority
        src={DarkLogo}
        alt=""
        className="w-10 block dark:hidden"
      />
      <Image
        priority
        src={WhiteLogo}
        alt=""
        className="w-10 hidden dark:block"
      />
    </Link>
  );
};
