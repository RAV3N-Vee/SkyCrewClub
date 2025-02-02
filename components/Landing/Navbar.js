import Image from "next/image";
import Link from "next/link";
import Logo from "../../public/Logo.png";
import styles from "../../styles/Navbar.module.css";

// login
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { signIn } from "next-auth/react";
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
import { useRouter } from "next/router";
import axios from "axios";

const Navbar = () => {
  // login
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { push } = useRouter();

  const handleAuth = async () => {
    if (isConnected) {
      await disconnectAsync();
    }

    const { account, chain } = await connectAsync({
      connector: new MetaMaskConnector(),
    });

    const userData = { address: account, chain: chain.id, network: "evm" };

    const { data } = await axios.post("/api/auth/request-message", userData, {
      headers: {
        "content-type": "application/json",
      },
    });

    const message = data.message;

    const signature = await signMessageAsync({ message });

    // redirect user after success authentication to '/user' page
    const { url } = await signIn("credentials", {
      message,
      signature,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    /**
     * instead of using signIn(..., redirect: "/user")
     * we get the url from callback and push it to the router to avoid page refreshing
     */
    push(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <div className={styles.logoContainer}>
          <Link href="/main">
            <Image src={Logo} />
          </Link>
        </div>
        {/* <Link href="/dashboard">
          <div className={styles.connectBut}>
            <span>Connect</span>
          </div>
        </Link> */}
        <button className={styles.connectBut} onClick={() => handleAuth()}>
          connect
        </button>
      </div>
    </div>
  );
};

export default Navbar;
