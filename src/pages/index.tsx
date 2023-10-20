import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { useOrder } from "~/contexts/Order";

export default function Home() {
  const [fiatAmount, setFiatAmount] = useState(200);
  const [vote, setVote] = useState(50);

  const { checkOut, setAmount } = useOrder();
  const router = useRouter();

  const nextStep = async () => {
    setAmount(1000);
    const { eventId } = await checkOut();

    console.info("eventId", eventId);
    void router.push(`/checkout/${eventId}`);
  };
  return (
    <>
      <Head>
        <title>La Crypta - Elecciones</title>
        <meta name="description" content="La Crypta Elecciones" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-6 px-4 py-6 ">
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[3rem]">
            La Crypta Elecciones
          </h1>
          <div className="flex w-full flex-col gap-4 text-white">
            Voto en Porcentaje
            <input
              value={vote}
              className="text-black"
              onChange={(e) => setVote(parseInt(e.currentTarget.value))}
            />
          </div>
          <div className="flex w-full flex-col gap-4 text-white">
            Total a apostar
            <input
              value={fiatAmount}
              className="text-black"
              onChange={(e) => setFiatAmount(parseInt(e.currentTarget.value))}
            />
          </div>

          {fiatAmount > 0 ? (
            <div className="absolute bottom-5 w-full p-5 text-white">
              <button
                onClick={() => void nextStep()}
                className="w-full rounded-xl bg-slate-300/20 p-5"
              >
                Pagar ARS {fiatAmount}
              </button>
            </div>
          ) : (
            ""
          )}
        </div>
      </main>
    </>
  );
}
